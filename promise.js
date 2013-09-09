"use strict";

/**
 * Promise.js returns a Deferred object which supports the jQuery deferred api but without
 * 		the requirement on jQuery.  Its also more performant than jQuery deferred and when JS, 
 *   	a bit less performant than vow.js but it does the difference between the deferred object and the 
 *    promise object better, (whereas vow does not).
 * @closure returns a Deferred @constructor
 * @notes Read this if you don't understand public/private/privilege in JS
 *        http://javascript.crockford.com/private.html
 *        there is a cost to defining all of these functions in the constructor... 
 *        but that cost in very few instances is merited by the encapsulation gains
 * @returns {Dfd} Deferred constructor
**/
(function() {
	if (typeof exports !== 'undefined') {
		var self = exports;
	}
	//setImmediate Poly
	(function(global,undefined){"use strict";function canUseNextTick(){return typeof process==="object"&&Object.prototype.toString.call(process)==="[object process]"}function canUseMessageChannel(){return!!global.MessageChannel}function canUsePostMessage(){if(!global.postMessage||global.importScripts){return false}var e=true;var t=global.onmessage;global.onmessage=function(){e=false};global.postMessage("","*");global.onmessage=t;return e}function canUseReadyStateChange(){return"document"in global&&"onreadystatechange"in global.document.createElement("script")}function installNextTickImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);process.nextTick(function(){tasks.runIfPresent(e)});return e}}function installMessageChannelImplementation(e){var t=new global.MessageChannel;t.port1.onmessage=function(e){var t=e.data;tasks.runIfPresent(t)};e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);t.port2.postMessage(e);return e}}function installPostMessageImplementation(e){function n(e,t){return typeof e==="string"&&e.substring(0,t.length)===t}function r(e){if(e.source===global&&n(e.data,t)){var r=e.data.substring(t.length);tasks.runIfPresent(r)}}var t="com.setImmediate"+Math.random();if(global.addEventListener){global.addEventListener("message",r,false)}else{global.attachEvent("onmessage",r)}e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);global.postMessage(t+e,"*");return e}}function installReadyStateChangeImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);var t=global.document.createElement("script");t.onreadystatechange=function(){tasks.runIfPresent(e);t.onreadystatechange=null;t.parentNode.removeChild(t);t=null};global.document.documentElement.appendChild(t);return e}}function installSetTimeoutImplementation(e){e.setImmediate=function(){var e=tasks.addFromSetImmediateArguments(arguments);global.setTimeout(function(){tasks.runIfPresent(e)},0);return e}}var tasks=function(){function Task(e,t){this.handler=e;this.args=t}Task.prototype.run=function(){if(typeof this.handler==="function"){this.handler.apply(undefined,this.args)}else{var scriptSource=""+this.handler;eval(scriptSource)}};var nextHandle=1;var tasksByHandle={};var currentlyRunningATask=false;return{addFromSetImmediateArguments:function(e){var t=e[0];var n=Array.prototype.slice.call(e,1);var r=new Task(t,n);var i=nextHandle++;tasksByHandle[i]=r;return i},runIfPresent:function(e){if(!currentlyRunningATask){var t=tasksByHandle[e];if(t){currentlyRunningATask=true;try{t.run()}finally{delete tasksByHandle[e];currentlyRunningATask=false}}}else{global.setTimeout(function(){tasks.runIfPresent(e)},0)}},remove:function(e){delete tasksByHandle[e]}}}();if(!global.setImmediate){var attachTo=typeof Object.getPrototypeOf==="function"&&"setTimeout"in Object.getPrototypeOf(global)?Object.getPrototypeOf(global):global;if(canUseNextTick()){installNextTickImplementation(attachTo)}else if(canUsePostMessage()){installPostMessageImplementation(attachTo)}else if(canUseMessageChannel()){installMessageChannelImplementation(attachTo)}else if(canUseReadyStateChange()){installReadyStateChangeImplementation(attachTo)}else{installSetTimeoutImplementation(attachTo)}attachTo.clearImmediate=tasks.remove}})(typeof self==="object"&&self?self:local);

	//temp helper function since this promise lib should be stand alone and not dependant on any
	//unerscore or utility library
	function extend(dest, source) {	for(var prop in source) {	dest[prop] = source[prop]; } return dest; }

	/**
	 * callback receives a scope and data as well as a list of callbacks to execute
	 * 		it proceeds to call all of those callbacks with the scope and data provided
	 * @function
	 * @private to this closure
	 * @param {object} scope - the scope with which to call the callback
	 * @param {object} data - data to pass as the argument of the callback
	 * @param {Array.<Function>} cbs - an array of callback functions
	 * @return {Function} Function to invoke the set of callbacks provided
	**/
	function callback(scope, data, cbs) {
		for(var i=0; i<cbs.length; i++) {
			setImmediate(function(i) {
				cbs[i].call(scope, data);
			}, i);
		}
	}

	/**
	 * sanitizeCbs ensures that the callbacks are returns in an array format
	 * 		this is a helper function to keep it from being used all over the place below
	 * @function
	 * @private to this closure
	 * @param {Array.<Function>|Function} cbs either an array of functions or a single function
	 * @return {Array.<Function>} - returns an array of functions
	**/
	function sanitizeCbs(cbs) {
		if(cbs && {}.toString.call(cbs) !== '[object Array]') {
    	cbs = [cbs]
    	}
		return cbs;
	}
	
	/**
	 * Represents a Deferred Object
	 * @constructor
	 * @param {function} [beforeStart] - an optional function to be called before
	 *                               the deferred starts up
	 * @param {boolean} [debugMode] - Enables debug mode for exposing internal properties
	 * @returns {deferred} the deferred instance object
	**/
	var Dfd = function(beforeStart, debugMode) {
		//setup some instance parameters
		//internalState 0 == pending, 1 == resolved, 2 == rejected
		this.internalState = 0;
		this.internalWith = this;
		this.internalData = null;
		this.callbacks = {
			done    : [],
			fail    : [],
			always  : [],
			progress: []
		};
		
		//if beforeStart is passed then call it with this being the deferred
		if(beforeStart && {}.toString.call(beforeStart) === '[object Function]') {
			beforeStart.call(this, this);
		}

		if(!debugMode) {
			Object.defineProperties(this, {
				"internalState": {enumerable:false, writable:true, configurable:false},
				"internalWith": {enumerable:false, writable:true, configurable:false},
				"internalData": {enumerable:false, writable:true, configurable:false},
				"callbacks": {enumerable:false, writable:false, configurable:false}
			});
			//Freeze the this so that the functions cannot be changed/overridden nor modified
			Object.seal(this);
			//Freeze the prototype so that the functions cannot be changed/overridden nor modified
			Object.freeze(Dfd.prototype);
		}
		return this;
	};

	//extend the Deferred prototype with the functions that it needs.
	//This is a performance/security trade-off in that these functions are
	//kinda exposed (even though we freeze them below), but they are on
	//the prototype chain so tht you could extend this object and add things
	//or overload some prototype methods
	extend(Dfd.prototype, {
		toString: function() {
			return "[object Deferred]";
		},

		/**
		 * Represents a Promise Object.  If target is supplied and is an object
		 * 		then we will turn that target object into the promise 
		 * 		by extending it with the promise functions
		 * 		instead of creating a new promise
		 * @constructor
		 * @param {Dfd} dfd - the linked Deferred instance
		 * @param {object} target - the target object
		 * @returns {promise} the promise instance object
		**/
		Promise: function(dfd, target) {
			this.toString = function() {
				return "[object Promise]";
			};
			this.done = dfd.done.bind(dfd);
			this.fail = dfd.fail.bind(dfd);
			this.progress = dfd.progress.bind(dfd);
			this.always = dfd.always.bind(dfd);
			this.then = dfd.then.bind(dfd);
			this.state = dfd.state.bind(dfd);

			//if target was passed in then return the ='promisified' target 
			//intead of a new promise object
			if(target && {}.toString.call(target) === '[object Object]') {
				extend(target, this);
				return target;
			}
			return this;
		},

		/**
		 * notify will call any progress callbacks with the data provided
		 * @function
		 * @public on prototype
		 * @param {object} data - the data to notify with 
		 * @return {null} null
		**/
		notify: function(data) {
			if(this.state() == 0) {
				this.internalData = data;
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.progress
				);
			}
			return null;
		},
		
		/**
		 * notifyWith will call any progress callbacks with the data provided 
		 * 		using the scope provided
		 * @function
		 * @public on prototype
		 * @param {object} scope - the scope to call the progress callbacks with
		 * @param {object} data - the data to notify with 
		 * @return {null} null
		**/
		notifyWith: function(scope, data) {
			if(this.state() == 0) {
				this.internalWith = scope;
				this.internalData = data;
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.progress
				);
			}
			return null;
		},
		
		/**
		 * reject will call any fail callbacks with the data provided, as well as always callbacks
		 * @function
		 * @public on prototype
		 * @param {object} [data] - the data to reject with
		 * @return {null} null
		**/
		reject: function(data) {
			if(this.state() == 0) {
				this.internalData = data;
				this.setState(2);
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.fail.concat(this.callbacks.always)
				);
			}
			return null;
		},
		
		/**
		 * rejectWith will call any fail and always callbacks with the data provided 
		 * 		using the scope provided
		 * @function
		 * @public on prototype
		 * @param {object} scope - the scope to call the callbacks with
		 * @param {object} data - the data to reject with 
		 * @return {null} null
		**/
		rejectWith: function(scope, data) {
			if(this.state() == 0) {
				this.internalWith = scope;
				this.internalData = data;
				this.setState(2);
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.fail.concat(this.callbacks.always)
				);
			}
			return null;
		},
		
		/**
		 * resolve will call any done and always callbacks with the data provided
		 * @function
		 * @public on prototype
		 * @param {object} data - the data to resolve with 
		 * @return {null} null
		**/
		resolve: function(data) {
			if(this.state() == 0) {
				this.internalData = data;
				this.setState(1);
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.done.concat(this.callbacks.always)
				);
			}
			return null;
		},
		
		/**
		 * resolveWith will call any done and always callbacks with the data provided
		 *  	using the scope provided
		 * @function
		 * @public on prototype
		 * @param {object} scope - the scope to call the callbacks with
		 * @param {object} data - the data to notify with 
		 * @return {null} null
		**/
		resolveWith: function(scope, data) {
			if(this.state() == 0) {
				this.internalWith = scope;
				this.internalData = data;
				this.setState(1);
				callback(
					this.internalWith, 
					this.internalData, 
					this.callbacks.done.concat(this.callbacks.always)
				);
			}
			return null;
		},

		/**
		 * always will set a callback for the resolve and reject events
		 * 		or will immediately run the callback if the object is already
		 *   	resolved or rejected.
		 * @function
		 * @public on prototype
		 * @param {function || array[function]} cbs - a callback function or an array
		 *                     of callback functions
		 * @return {null} null
		**/
		always: function(cbs) {
			cbs = sanitizeCbs(cbs);
			if(cbs.length > 0) {
				if(this.state() !== 0) {
					callback(
						this.internalWith, 
						this.internalData, 
						cbs
					);
				} else {
					this.callbacks.always = this.callbacks.always.concat(cbs)
				}
			}
			return null;
		},
		
		/**
		 * done will set a callback for the resolve events
		 * 		or will immediately run the callback if the object is already
		 *   	resolved.
		 * @function
		 * @public on prototype
		 * @param {Function|Array.<Function>} cbs a callback function or an array
		 *                     of callback functions
		 * @return {null} null
		**/
		done: function(cbs) {
			cbs = sanitizeCbs(cbs);
			if(cbs.length > 0) {
				if(this.state() === 1) {
					callback(
						this.internalWith, 
						this.internalData, 
						cbs
					);
				} else {
					this.callbacks.done = this.callbacks.done.concat(cbs)
				}
			}
			return null;
		},
		
		/**
		 * fail will set a callback for the reject events
		 * 		or will immediately run the callback if the object is already
		 *   	rejected.
		 * @function
		 * @public on prototype
		 * @param {Function|Array.<Function>} cbs - a callback function or an array
		 *                     of callback functions
		 * @return {null} null
		**/
		fail: function(cbs) {
			cbs = sanitizeCbs(cbs);
			if(cbs.length > 0) {
				if(this.state() === 2) {
					callback(
						this.internalWith, 
						this.internalData, 
						cbs
					);
				} else {
					this.callbacks.fail = this.callbacks.fail.concat(cbs)
				}
			}
			return;
		},
		
		/**
		 * progress will set a callback for the notify events, or do nothing
		 * 		if it is already resolved or rejected
		 * @function
		 * @public on prototype
		 * @param {function || array[function]} cbs - a callback function or an array
		 *                     of callback functions
		 * @return {null} null
		**/
		progress: function(cbs) {
			if(this.state() === 0) {
				cbs = sanitizeCbs(cbs);
				this.callbacks.progress = this.callbacks.progress.concat(cbs)
			}
			return;
		},

		/**
		 * then provides a function which allows chaining of promise callbacks essentially
		 * 		it allows you to provide filter functions that will be called upon the original promise
		 * 		which may modify/alter the data before returning/resolving/rejecting the newly
		 * 		created deferred/promise.
		 * @function
		 * @public on prototype
		 * @param {function} doneFilter - a function to be run on the resolve event and whose return value
		 *                              will be used to resolve the promise returned by the "then"
		 * @param {function} failFilter - a function to be run on the reject event and whose return value
		 *                              will be used to reject the promise returned by the "then"
		 * @param {function} progressFilter - a function to be run on the notify event and whose return value
		 *                              will be used to notify the promise returned by the "then"
		 * @return {Promise} New promise to chain further events off of
		**/
		then: function(doneFilter, failFilter, progressFilter) {
			//create a new inner DFD function
			var newDfd = new Dfd;

			var dF = function(data) {
				if (doneFilter) {
					data = doneFilter.call(this, data);
				}
				newDfd.resolveWith(this, data);
			};
			this.done(dF);
			var fF = function(data) {
				if (failFilter) {
					var ret = failFilter.call(this, data);
				}
				newDfd.rejectWith(this, ret);
			};
			this.fail(fF);
			var pF = function(data) {
				if (progressFilter) {
					var ret = progressFilter.call(this, data);
				}
				newDfd.notifyWith(this, ret);
			};
			this.progress(pF);

			return newDfd.promise();
		},

		/**
		 * When can take an array of promised or truthy/falsey objects
		 * 		and can mesh them into a single promise/deferred which will
		 * 		be resolved when all of the passed in promises resolve, or rejected if
		 * 		any of the passed in promises is rejected.  It returns a promise in 
		 * 		its own right which can represent the summation of all the inner
		 * 		promises.
		 * @function
		 * @public on prototype
		 * @return {promise} promise instance object
		**/
		when: function(promises) {
			var newDfd = new Dfd();
			var resolvedCount = 0;
			var handledCount = 0;
			var whenData = [];

			for(var i = 0; i<promises.length; i++) {
				var tempI = i;
				//if it is a promise object
				if(promises[i].toString() === "[object Promise]" || promises[i].toString() === "[object Deferred]") {
					//when the promise is done store the data into the whenData array
					//and resolve the new whenDeferred if all the promises are resolved
					var doneFunc = (function(tempI) {
						return function(data) {
							whenData[tempI] = data;
							resolvedCount++; handledCount++;
							if(resolvedCount === promises.length) {
								newDfd.resolve(whenData);
							}
						}
					})(tempI);

					promises[i].done(doneFunc);
					//if one of the inner promises fails then we store that fail and the 
					//when wrapper will also fail but only after running all of the promises
					//such that the returned composite data is indicative of the status of all of the 
					//wrapped promises
					
					var failFunc = (function(tempI) {
						return function(e) {
							handledCount++;
							whenData[tempI] = e;
							if(handledCount === promises.length) {
								newDfd.reject(whenData);
							}
						}
					})(tempI);
				
					promises[i].fail(failFunc);
					//simply pass along progress events with no need to chain them etc.
					promises[i].progress(function(e) {
						newDfd.notify(e);
					});
				} 
				//otherwise if it is truthy value
				//then use that value to return in the callback and 
				//increment the resolvedCount
				else if (promises[i]) {
					whenData[i] = promises[i];
					resolvedCount++; handledCount++;
				} 
				//otherwise if it is falsy
				//then use that valu to return in the callback
				//and increment only the handledCount not the 
				//resolved Count.  This means the when will eventually 
				//reject.
				else {
					whenData[i] = promises[i];
					handledCount++;
				}
			};

			// if all of the "promises" were not actually promises but rather truthy or falsey objects
			// then we can determine the state right now syncrounously after the for loop
			// instead of waiting for inner promise callbacks etc
			if(resolvedCount === promises.length) {
				newDfd.resolve(whenData);
			} else if (handledCount === promises.length) {
				newDfd.reject(whenData);
			}
			return newDfd.promise();
		},
		
		/**
		 * getter for the dfd's promise
		 * 		The promise is the only thing which should be passed
		 * 		to untrusted other functions, and is all that is needed
		 * 		to setup callbacks on notify/resolve/reject events.
		 * 		The promise cannot be used to "escalate" to the deferred
		 * @function
		 * @public on prototype
		 * @return {Promise} promise instance object
		**/
		promise: function(target) {
			var pro = new this.Promise(this, target);
			return pro;
		},

		/**
		 * getter for the internalState property
		 * @function
		 * @public on prototype
		 * @return {int} internalState integer
		**/
		state: function() {
			return this.internalState;
		},

		/**
		 * setter for the internalState property
		 * @function
		 * @public on prototype
		 * @param {int} newState - state int, 0 is pending, 1 is resolved, 2 is rejected
		 * @return {int} internalState integer
		**/
		setState: function(newState) {
			if(newState == 0 || newState == 1 || newState == 2) {
				this.internalState = newState;
			}
			return this.internalState;
		}
	});
	
	//set this to the utility namespace 
	self._u_ = self._u_ || {};
	self._u_.Dfd = Dfd;

	//and also return the Constructor so that it could be saved and used directly
	return Dfd;
})();

