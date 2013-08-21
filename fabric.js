"use strict";

/**
 * Fabric.js returns a Fabric constructor which exposes standard pub/sub as well as request/fulfill, command/notify
 * 				and enqueue, dequeue, peek, handle and release.  You would usually only have one of these per application
 * @closure returns a Fabric @constructor
 * @notes Read this if you don't understand public/private/privelege in JS 
 *        http://javascript.crockford.com/private.html
 *        there is a cost to defining all of these functions in the constructor... 
 *        but that cost in very few instnaces is merited by the encapsulation gains
 * @returns {Fabric} Fabric constructor
**/

(function() {

	/**
	 * Shimming some of the utils functions so that this library doesn't need to have any dependencies
	 * _u_.__i__ is still an auto incrementing number with each "get" and the extend function
	 * does some very simple copying of object properties and methods from on object to another
	**/
	var _u_ = _u_ || {};
	_u_.AutoInc = 0;
	_u_.extend =  function(dest, source) {	for(var prop in source) {	dest[prop] = source[prop]; } return dest; };
	_u_.isString = function(item) {return (item && {}.toString.call(item) === '[object String]');};
	// Linked Hash Map, in memory implementation
	var LinkedHashMap=function(){this._size=0;this._map={};this._Entry=function(key,value){this.prev=null;this.next=null;this.key=key;this.value=value};this._head=this._tail=null};var _Iterator=function(start,property){this.entry=start===null?null:start;this.property=property};_Iterator.prototype={hasNext:function(){return this.entry!==null},next:function(){if(this.entry===null){return null}var value=this.entry[this.property];this.entry=this.entry.next;return value}};LinkedHashMap.prototype={put:function(key,value){var entry;if(!this.containsKey(key)){entry=new this._Entry(key,value);if(this._size===0){this._head=entry;this._tail=entry}else{this._tail.next=entry;entry.prev=this._tail;this._tail=entry}this._size++}else{entry=this._map[key];entry.value=value}this._map[key]=entry},remove:function(key){var entry;if(this.containsKey(key)){this._size--;entry=this._map[key];delete this._map[key];if(entry===this._head){this._head=entry.next;this._head.prev=null}else if(entry===this._tail){this._tail=entry.prev;this._tail.next=null}else{entry.prev.next=entry.next;entry.next.prev=entry.prev}}else{entry=null}return entry===null?null:entry.value},containsKey:function(key){return this._map.hasOwnProperty(key)},containsValue:function(value){for(var key in this._map){if(this._map.hasOwnProperty(key)){if(this._map[key].value===value){return true}}}return false},get:function(key){return this.containsKey(key)?this._map[key].value:null},clear:function(){this._size=0;this._map={};this._head=this._tail=null},keys:function(from){var keys=[],start=null;if(from){start=this.containsKey(from)?this._map[from]:null}else{start=this._head}for(var cur=start;cur!=null;cur=cur.next){keys.push(cur.key)}return keys},values:function(from){var values=[],start=null;if(from){start=this.containsKey(from)?this._map[from]:null}else{start=this._head}for(var cur=start;cur!=null;cur=cur.next){values.push(cur.value)}return values},iterator:function(from,type){var property="value";if(type&&(type==="key"||type==="keys")){property="key"}var entry=this.containsKey(from)?this._map[from]:null;return new _Iterator(entry,property)},size:function(){return this._size}};
	Object.defineProperty(_u_, "__i__", {
		enumerable:false,
		configurable:false,
		set: undefined,
		get: function() {
			return _u_.AutoInc++;
		}
	});

	/**
	 * Represents a Fabric Object
	 * @constructor
	 * @param {object} [args] - an optional object which should contain:
	 * @param {int} [args.peekTimeout] - a timeout standard for when a queue message is "peeked at"
	 * @param {boolean} [args.replay] - Whether to enable replaying events for the Fabric from some message ID
	 * @param {LinkedHashMap} [args.persistenceProvider] - An instance of an object that has an interface that
	 * 	like a LinkedHashMap. The implementation can store values however it likes but must implement the
	 * 	proper interface for replaying. If not provided and args.replay = true, then an in memory implementation
	 * 	will be setup.
	 * @returns {Fabric} the fabric instance object
	**/
	var Fabric = function(args) {
		args            = args || {};
		
		//peekTimeout defaults to 5000 ms or 5 s until a peeked queue message is released back to the queue
		var peekTimeout = args.peekTimeout || 5000;

		//setup some private instance variables
		//bindings - holds the subscription bindings
		//queue - holds queue messages
		//processing - is a temp holder for queue messages that have been peeked at
		var bindings    = {};
		var subscriptions = {};
		var queue 		  = {};
		var processing  = {};
		var replay = args.replay ? true : false;
		var store = null;
		if (replay) {
			if (args.persistenceProvider) {
				store = args.persistenceProvider;
			} else {
				store = new LinkedHashMap();
			}
		}

		/**
		 * cd is a recursive sometimes self calling function that actually executes the publish callbacks
		 * executing them a single function or chaining functions together if they are sent in with a .next
		 *
		 * @private
		 * @param {object} args - an object containing:
		 * @param {object} args.data - Data that was published or the return of the previous callback in sync mode
		 * @param {object} args.raw - The data that was originally published
		 * @param {function} [args.next] - optional next callback to trigger after this callback returns
		 * @param {Array} [args.matches] - the matching elements if the match was done via regex instead of direct equals on urn
		 * @param {string} args.key - the unique Fabric message ID
		 * @param {int} args.index - the index of the binding loc that would be next
		 * @param {function} args.cb - the callback function to execute with the data and matches
		 * @param {string} args.binding - The subscription binding that matched
		 * @return {null} null
		**/
		function cb(args) {
			if(args.next) {
				args.index++;
				args.data = args.cb.call(null, {data:args.data, matches:args.matches, raw: args.raw, binding: args.binding, key: args.key});
				var next = bindings[args.matches.binding].subs[args.index];
				args.cb = args.next;
				if(next) {
					args.next = next.callback
				} else {
					args.next = undefined;
				}
				cb(args);
			} else {
				args.cb.call(null, {data:args.data, matches:args.matches, raw: args.raw, binding: args.binding, key: args.key});
			}
			return null;
		}

		/**
		 * createRegex is a function to take a urn style string and convert it into a regular expression
		 * for matching wild card subscriptions or peeks
		 *
		 * The matching logic is a "word" delimiter of colon :
		 * where * matches a single wild card word
		 * and # matches multiple words
		 *
		 * @private
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn string to convert into a regular expression
		 * @return {RegExp} an instance of a RegExp;
		**/ 
		 function createRegex(args) {
			var parts = args.urn.split(":");
			var reg = [];
			for(var i = 0; i < parts.length; i++) {
				if(parts[i] == "*") {
					reg.push("([\\w\\d.\\-]*?)")
				} else if(parts[i] == "#") {
					reg.push("([\\w\\d.\\-\\:]*)")
				} else {
					reg.push("("+parts[i]+")")
				}
			}
			var regex = new RegExp("^" + reg.join("\\:\\b")+"$", "i");
			return regex;
		}

		/**
		 * triggerPublish is the private function for abstracting some of the logic out of the publish function
		 * of what to do if they request a synchronous trigger versus the default async trigger etc.  It formats the data slightly
		 * and then defers to the cb function for the actual triggering of the subscriptions callback.
		 *
		 * This function formats/transforms a seed object and then calls "cb" with that seed object
		 *
		 * @private
		 * @param  {object}   args - an object containing:
		 *         @param {object|variable} data - the data object to pass back to the subscription
		 *         @param {array} matches - the regex matching aspects if the match was based on a regex urn
		 *         @param {array} subs - the subscription callbacks on the urn that was matched, these contain an object with the callback function
		 *         @param {string} loc - the matching urn string as the key to the bindings object
		 *         @param {int} index - the index of the subs 
		 *        
		 * @return {null} null;
		**/
		var triggerPublishI;
		var triggerPublishSeed = {};
		function triggerPublish(args) {
			if(!args.sync) {
				for(triggerPublishI = 0; triggerPublishI < args.subs.length; triggerPublishI++) {
					triggerPublishSeed.data = args.data;
					triggerPublishSeed.matches = args.matches;
					triggerPublishSeed.binding = args.loc;
					triggerPublishSeed.raw = args.data;
					triggerPublishSeed.cb = args.subs[triggerPublishI].callback;
					triggerPublishSeed.index = triggerPublishI+1;
					triggerPublishSeed.key = args.key;

					cb(triggerPublishSeed);
				}
			} else {
				triggerPublishSeed.data = args.data;
				triggerPublishSeed.matches = args.matches;
				triggerPublishSeed.binding = args.loc;
				triggerPublishSeed.raw = args.data;
				triggerPublishSeed.cb = args.subs[0].callback;
				triggerPublishSeed.index = triggerPublishI+1;
				triggerPublishSeed.key = args.key;
				if(args.subs[1]) {
					triggerPublishSeed.next = args.subs[1].callback;
				}
				cb(triggerPublishSeed);
			}
			return null;
		}

		/**
		 * subscribe is the simplest low level way of interacting with the fabric.  You proviede a urn to which you wish
		 * to subscribe and a bound callback function to be executed when a matching urn is published.
		 *
		 * the urn provided is a string and can use the * and # wildcards in the : separated string
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to subscribe to
		 *         @param {function} callback - the callback function, will be called with .call(null, ...), and as such
		 *                                    should be bound before being used in the subscribe.  This is so that the Fabric
		 *                                    does not have to keep an array/object of scopes with which to call functions
		 *        
		 * @return {object} args - the args object that was subscribed... in case you want to get back and use the key to unsub;
		**/
		this.subscribe   = function(args) {
			args = args || {};
			args.key = "subscription_"+_u_.__i__;
			
			//setup the bindings property if it doesn't exist already;
			bindings[args.urn] = bindings[args.urn] || {subs:[]};

			//stash the regex so we don't have to create it every time...
			bindings[args.urn].regex = createRegex({urn : args.urn});

			//and also stash the subscription itself under its binding urn "channel"
			bindings[args.urn].subs.push(args);

			// Also stash the subscription key for later lookup
			subscriptions[args.key] = args;

			return args;
		};

		/**
		 * unsubscribe is an easy way to remove a subscription for events.  Unsubscribe must provide the same urn string used to 
		 * subscribe as well as either the key returned in the subscribes returned object, or the same bound callback function
		 *
		 * the urn provided is a string and can use the * and # wildcards in the : separated string
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to unusbscribe from
		 *         @param {function} callback - [either key or callback required] the callback function, will be called with .call(null, ...), and as such
		 *                                    should be bound before being used in the subscribe.  This is so that the Fabric
		 *                                    does not have to keep an array/object of scopes with which to call functions
		 *         @param {string} key - [either key or callback required] the message key that was returned from the subscribe
		 *        
		 * @return {object|bool} args - the args object that was unsubscribed or false if there was no successful sub match to remove
		**/
		this.unsubscribe = function(args) {
			args = args || {};

			if (_u_.isString(args)) {
				// just passed the subscription ID/key
				args = subscriptions[args] || {};
			}

			if (args.key) {
				args = subscriptions[args.key];
				delete subscriptions[args.key];
			}

			//find a binding for the urn match, this is why you have to pass the same urn string as used to subscribe
			var binding = bindings[args.urn];
			if(binding) {
				for(var i = 0; i < binding.subs.length; i++) {
					//match the key directly as a string compare
					if(args.key && args.key == binding.subs[i].key) {
						bindings[args.urn].subs.splice(i, 1);
						if(bindings[args.urn].subs.length == 0){
							delete bindings[args.urn];
						}
					}
					//or match the callback as a function compare
					else if (args.callback && args.callback == binding.subs[i].callback) {
						bindings[args.urn].subs.splice(i, 1);
						if(bindings[args.urn].subs.length == 0){
							delete bindings[args.urn];
						}
					}
				}
				return args;
			} else {
				return false;
			}
		};

		// optimization
		var publishMatches;
		var publishKey;
		function internalPublish(args) {
			var published = false;

			//loop through all of the bindings
			publishKey = null;
			for(publishKey in bindings) {
				//if there is a string match on the urn itself with the bindings key
				//then we can avoid having to even do regex matching
				if(args.urn == publishKey) {
					//prep some data for the triggerPublish private func
					args.subs = bindings[publishKey].subs;
					args.loc = publishKey;
					triggerPublish(args);
					published = true;
				} else {
					//otherwise lets try and match, and if we have a match
					publishMatches = bindings[publishKey].regex.exec(args.urn)
					if(publishMatches) {
						//then prepare some data for the triggerPublish function, in this case including the optional matches
						//from the regex
						publishMatches.splice(0,1);
						args.matches = publishMatches;
						args.subs = bindings[publishKey].subs;
						args.loc = publishKey;
						triggerPublish(args);
						published = true;
					}
				}
			}
			return {
				published: published,
				key: args.key
			};
		}

		/**
		 * Publish a message to a set of given subscription keys.
		 *
		 * @param {object} message - The message to publish
		 * @param {Array} subscriptionKeys - An array of subscription keys to publish to
		 */
		function publishTo(message, subscriptionKeys) {
			var subscription, args, published = false;

			for (var i = 0; i < subscriptionKeys.length; i++) {
				subscription = subscriptions[subscriptionKeys[i]];
				if (subscription) {
					message.loc = subscription.urn;
					message.subs = [subscription];
					if (message.urn == subscription.urn) {
						triggerPublish(message);
						published = true;
					} else {
						publishMatches = bindings[subscription.urn].regex.exec(message.urn);
						if(publishMatches) {
							publishMatches.splice(0,1);
							message.matches = publishMatches;
							triggerPublish(message);
							published = true;
						}
					}
				}
			}

			return {
				published: published,
				key: message.key
			}
		}

		/**
		 * publish is the lowest level method to trigger a subscription callback.  
		 * You provide the urn string (no wildcards allowed) to which you are publishing and a
		 * data and type param
		 *
		 * the urn provided is a string and CANNOT use the wildcards
		 *
		 * @privileged
		 * @public
		 * @param {string} args.urn - the urn to publish to
		 * @param {*} [args.data] - the data to be passed to the callback
		 * @param {string} [args.type] - the type of publish, defaults to publish,
		 * 	but higher level API's that use publish
		 *  provide args such as command/fulfill/notify/request etc
		 *
		 * @return {boolean} Whether someone received the message or not
		**/
		this.publish     = function(args) {
			args = args || {data:{}};
			args.data = args.data || {};
			args.key = "message_"+_u_.__i__;
			args.type = args.type  || "publish";

			if (replay) {
				store.put(args.key, args);
			}

			return internalPublish(args);
		};

		
		/**
		 * request is a bit higher level of an API and subscribes to a fulfill callback and then publishes the request
		 * this guy creates the callback urn that it will subscribe to and then passes that through so that whomever
		 * is subscribed to the request channel will know to which channel to fulfill the request
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to request to
		 *         @param {object|variable} data - the data to be passed to the request handler
		 *         @param {function} callback - the callback function to execute when the request is fulfilled
		 *        
		 * @return {null} null
		**/
		this.request     = function(args) {
			args = args || {};
			args.data = args.data  || {};

			args.data.key = "message_"+_u_.__i__;
			args.data.cbUrn = args.urn+":"+args.data.key;
			args.data.type = "request";

			//subscribe to the newly created cbUrn so that the fulfill can reach us
			this.subscribe({urn:args.data.cbUrn, callback:args.callback});

			//then publish the args object so that any subscriber/handler for this request can react.
			//the first one to fulfill the message is the only one who will reach the provided request callback
			this.publish(args);
			return;
		};

		/**
		 * fulfill is the partner to request.  It is a higher level api that does a publish and an unsubscribe
		 * fulfill must be called with a urn and data etc.  Fulfill should be called by whomever got the request publish
		 * and must use the cbUrn and the key from the data it is given in the request to fulfill
		 *
		 * the urn provided is a string and CANNOT use the wildcards
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to fulfill to
		 *         @param {object|variable} data - the data to be passed to the callback
		 *         @param {string} key - the subscription key that was created by the request function
		 *        
		 * @return {null} null
		**/
		this.fulfill     = function(args) {
			args = args || {};
			args.type = "fulfill";
			
			//publish the provided argument through to the subscription that was created by the request function
			this.publish(args);

			//then ubsubscribe from the 
			this.unsubscribe({urn: args.urn, key: args.key});
			return;
		};

		/**
		 * command is a higher level api over publish and does not expect a response with data.  It may optionally
		 * be informed of the command execution with a paired notify function.  This is a synonym of request/fulfil 
		 * in the functional sense but is to be used for different purposes, as such the onus is really on the party
		 * who is subscribing to a "command" channel as a command handler to execute the difference between a command 
		 * and a request... in general a command shouldn't return anything but can notify of completion, and a request should
		 * not change any data and "must" be fulfilled.
		 *
		 * the urn provided is a string and CANNOT use the wildcards
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to command to
		 *         @param {object|variable} data - the data to be passed to the callback
		 *        
		 * @return {null} null
		**/
		this.command     = function(args) {
			args = args || {};
			args.data = args.data  || {};

			args.data.key = "message_"+_u_.__i__;
			args.data.cbUrn = args.urn+":"+args.data.key;
			args.data.type = "command";

			this.subscribe({urn:args.data.cbUrn, callback:args.callback});
			this.publish(args);
			return;
		};

		/**
		 * notify is the partner to command.  It is a higher level api that does a publish and an unsubscribe
		 * notify MAY be called with a urn and data etc.  Notify MAY be called by whomever got the command publish
		 * and must use the cbUrn and the key from the data it is given in the command to notify
		 *
		 * the urn provided is a string and CANNOT use the wildcards
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to notify to
		 *         @param {object|variable} data - the data to be passed to the callback
		 *         @param {string} key - the subscription key that was created by the command function
		 *        
		 * @return {null} null
		**/
		this.notify      = function(args) {
			args = args || {};
			args.type = "notify";
			
			this.publish(args);
			this.unsubscribe({urn: args.urn, key: args.key});
			return;
		};

		/**
		 * enqueue is a slight be different in that it does not build off of Subscribe and Publish per se
		 * but rather exposes an alternative way of doing things, rather than immediate distribution of messages in a "push"
		 * fashion, the queue holds the messages, and a listener must poll the queue using the peek on a urn channel and then can 
		 * elect to handle or release the peeked message.
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - an object containing:
		 *         @param {string} urn - the urn to notify to
		 *         @param {object|variable} data - the data to be set and used by the peek function
		 *        
		 * @return {object} the queued args object, which must be used in order to dequeue it
		**/
		this.enqueue     = function(args) {
			args = args || {};
			args.key = "queued"+_u_.__i__;

			//setup the bindings property if it doesn't exist already;
			queue[args.urn] = queue[args.urn] || {items:[]};

			//stash the regex so we don't have to create it every time...
			queue[args.urn].regex = createRegex({urn : args.urn});

			//and also stash the subscription itself under its binding urn "channel"
			queue[args.urn].items.push(args);

			return args;
		};


		/**
		 * dequeue is the opposite of queue, and can only be called by the actor who received the return of the queue call
		 * since the args that are passed to dequeue must be an exact object equality match of the return from queue
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - must match the args returned by enqueue... you cannot composite an object that will match
		 *                         it must be an exact object equality match
		 *        
		 * @return {null} - null;
		**/
		this.dequeue     = function(args) {
			args = args || {};
			for(var key in queue) {
				//if there is a string match on the urn itself with the queue key
				//then we can avoid having to even do regex matching
				if(args.urn == key) {
					var match = false;
					//iterate over the items finding a match and only the first match
					var j = 0;
					for(var i = 0; i < queue[key].items.length; i++) {
						//a match must be a direct object equality match and thus cannot be from a newly generated object but 
						//rather must be the return of the enqueue function which was also pushed into the queue
						if(args.key === queue[key].items[i].key) {
							match = true;
							j = i;
							break;
						}
					}
					//if we found a matching queueitem then we remove it from the queue list
					if(match) {
						queue[key].items.splice(j, 1);
						if(queue[key].items.length == 0) {
							delete queue[key];
						}
					}
				}	
			}
			return;
		};

		/**
		 * peek is used to get the first matching queue message out of the queue channel that matches the urn.  
		 * Based on the urn that you are wanting to peek at.
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - 
		 *         @param {string} urn - the urn wildcards allowed
		 *         @param {function} callback - the function to callback when we get a message match from the peek
		 *        
		 * @return {null} - null;
		**/
		this.peek        = function(args) {
			args = args || {};
			args.offset = args.offset || 0;
			var i = 0; var message = null; var match = null;
			for(var key in queue) {
				//if there is a string match on the urn itself with the queue key
				//then we can avoid having to even do regex matching
				if(args.urn == key) {
					if(queue[key].items.length > args.offset) {
						message = queue[key].items[args.offset];
						queue[key].items.splice(args.offset,1);
						match = key;
						break;
					}
				} else {
					//otherwise match the queue channel 
					var matches = queue[key].regex.exec(args.urn)
					if(matches) {
						if(queue[key].items.length > args.offset) {
							match = key;
							message = queue[key].items[args.offset];
							matches.splice(0,1);
							message.matches = matches;
							queue[key].items.splice(args.offset,1);
							break;
						}
					}
				}
			}
			//if there was a message in the channel that mached then lets do some magic
			//like call your callback, take it out of the queue and stick it into the processing temp holder
			if(message) {
				var timeout = setTimeout(function() {
					queue[match] = queue[match] || {items:[], regex: createRegex({urn : match})};
					queue[match].items.unshift(message);
					delete processing[message.key];
				}, peekTimeout);
				processing[message.key] = {message:message, timeout:timeout};
				setTimeout(function(){args.callback.call(null, {data:message})},0);
			} else {
				setTimeout(function(){args.callback.call(null, {data:{}})},0);
			}
			return;
		};

		/**
		 * you should call handle on a message that you peeked at, unless you are a lazy bugger and then it will auto
		 * release after the fact by a timeout.
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - 
		 *         @param {string} key - the string of the queue message to "handle"
		 *        
		 * @return {null} - null;
		**/
		this.handle      = function(args) {
			args = args || {};
			var message = processing[args.key];
			if(message) {
				clearTimeout(message.timeout);
				delete processing[args.key];
			}
			return;
		};

		/**
		 * if you can't handle the message that you peeked at, then you should release it back into the queue.
		 * Then you can peek again if you want to with an offset to try and skip this broken one.
		 *
		 * @privileged
		 * @public
		 * @param  {object}   args - 
		 *         @param {string} key - the string of the queue message to "handle"
		 *        
		 * @return {null} - null;
		**/
		this.release     = function(args) {
			args = args || {};
			queue[processing[args.key].message.urn].items.unshift(processing[args.key].message)
			delete processing[args.key];
			return;
		};

		/**
		 * Check whether this instance of Fabric can replay events or not.
		 *
		 * @returns {boolean} True if the Fabric is setup for replay.
		 */
		this.canReplay = function() {
			return replay;
		};

		/**
		 * Replay all fabric events from a given message ID. Only available if Fabric was setup with replay=true
		 *
		 * @param {string} from The unique message ID to start from.
		 * @param {Number} [count] The number of messages to replay
		 * @param {Array} [to] A set of subscription IDs to replay to
		 * @throws {Error} If the message ID is not found or we are not setup for replaying.
		 */
		this.replay = function(from, count, to) {
			if (!replay) {
				throw new Error("Cannot replay events since Fabric was not initialized with replay=true");
			}
			if (!store.containsKey(from)) {
				throw new Error("Cannot replay from '" + from + "', the message ID was not found");
			}

			if (arguments.length === 1) {
				count = -1;
				to = null;
			} else if (arguments.length === 2) {
				if (_u_.isArray(count)) {
					to = count;
					count = -1;
				} else {
					to = null;
				}
			}

			// Setup publish function so we don't have to keep evaluating
			// which function to use on every iteration
			var publishFunc;
			if (to) {
				publishFunc = function (message) {
					return publishTo(message, to);
				}
			} else {
				publishFunc = internalPublish;
			}

			var itr = store.iterator(from);
			var numPublished = 0;
			var publishedInfo;

			while (itr.hasNext() && (count < 0 || numPublished < count)) {
				var message = itr.next();
				publishedInfo = publishFunc(message);
				if (publishedInfo.published) {
					numPublished++;
				}
			}
		};

		//set a unique id for this fabric
		this.id = "Fabric_"+_u_.__i__;

		//this object exposes no consumable or writable public properties or methods
		//and as such we can freez the whole damn thing in order to prevent people from
		//mucking around with the method signatures or functionality.
		//
		//Although take a note that doing this is awesome but makes it a bloody pain in the arse to write unit tests.
		//hence this silly debugMode piece of work... 
		if(!args.debugMode) {
			Object.freeze(this);
			Object.defineProperties(Fabric.prototype, {
			  "name"     : {writable:false},
			  "toString" : {writable:false}
			});
		} else {
			this.debug = function() {
				return { bindings: bindings,
					queue: queue,
					processing: processing
				}
			}
		}
		return this;
	};

	//a few tiny methods can live on the prototype since they don't need access to the privates
	_u_.extend(Fabric.prototype, {
		name     : "Fabric",
		toString : function() {
			return "[object Fabric]";
		}
	});

	if (typeof exports !== 'undefined') {
		exports.Fabric = Fabric;
	} else {
		self.Fabric = Fabric;
	}
})();
