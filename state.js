"use strict";

/**
 * State.js returns a finite state machine kinda building upon the promise pattern 
 * 		while removing the artificial constraints of promise that you can't move from state to 
 * 		state freely etc.
 * @closure returns a State @constructor
 * @notes Read this if you don't understand public/private/privelege in JS 
 *        http://javascript.crockford.com/private.html
 *        there is a cost to defining all of these functions in the constructor... 
 *        but that cost in very few instnaces is merited by the encapsulation gains
 * @returns {State} State constructor
**/
(function() {
	if (typeof exports !== 'undefined') {
		var self = exports;
	}

	//setImmediate Poly
	(function (global, undefined) {
		"use strict";

		var tasks = (function () {
			function Task(handler, args) {
				this.handler = handler;
				this.args = args;
			}
			Task.prototype.run = function () {
				if (typeof this.handler === "function") {
					this.handler.apply(undefined, this.args);
				} else {
					var scriptSource = "" + this.handler;
					eval(scriptSource);
				}
			};

			var nextHandle = 1; 
			var tasksByHandle = {};
			var currentlyRunningATask = false;

			return {
				addFromSetImmediateArguments: function (args) {
					var handler = args[0];
					var argsToHandle = Array.prototype.slice.call(args, 1);
					var task = new Task(handler, argsToHandle);

					var thisHandle = nextHandle++;
					tasksByHandle[thisHandle] = task;
					return thisHandle;
				},
				runIfPresent: function (handle) {
					if (!currentlyRunningATask) {
						var task = tasksByHandle[handle];
						if (task) {
							currentlyRunningATask = true;
							try {
								task.run();
							} catch(e) {
							} finally {
								delete tasksByHandle[handle];
								currentlyRunningATask = false;
							}
						}
					} else {
						global.setTimeout(function () {
							tasks.runIfPresent(handle);
						}, 0);
					}
				},
				remove: function (handle) {
					delete tasksByHandle[handle];
				}
			};
		}());

		function canUseNextTick() {
			return typeof process === "object" &&
				   Object.prototype.toString.call(process) === "[object process]";
		}

		function canUseMessageChannel() {
			return !!global.MessageChannel;
		}

		function canUsePostMessage() {
			if (!global.postMessage || global.importScripts) {
				return false;
			}

			var postMessageIsAsynchronous = true;
			var oldOnMessage = global.onmessage;
			global.onmessage = function () {
				postMessageIsAsynchronous = false;
			};
			global.postMessage("", "*");
			global.onmessage = oldOnMessage;

			return postMessageIsAsynchronous;
		}

		function canUseReadyStateChange() {
			return "document" in global && "onreadystatechange" in global.document.createElement("script");
		}

		function installNextTickImplementation(attachTo) {
			attachTo.setImmediate = function () {
				var handle = tasks.addFromSetImmediateArguments(arguments);

				process.nextTick(function () {
					tasks.runIfPresent(handle);
				});

				return handle;
			};
		}

		function installMessageChannelImplementation(attachTo) {
			var channel = new global.MessageChannel();
			channel.port1.onmessage = function (event) {
				var handle = event.data;
				tasks.runIfPresent(handle);
			};
			attachTo.setImmediate = function () {
				var handle = tasks.addFromSetImmediateArguments(arguments);

				channel.port2.postMessage(handle);

				return handle;
			};
		}

		function installPostMessageImplementation(attachTo) {
			var MESSAGE_PREFIX = "com.setImmediate" + Math.random();

			function isStringAndStartsWith(string, putativeStart) {
				return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
			}

			function onGlobalMessage(event) {
				if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
					var handle = event.data.substring(MESSAGE_PREFIX.length);
					tasks.runIfPresent(handle);
				}
			}
			if (global.addEventListener) {
				global.addEventListener("message", onGlobalMessage, false);
			} else {
				global.attachEvent("onmessage", onGlobalMessage);
			}

			attachTo.setImmediate = function () {
				var handle = tasks.addFromSetImmediateArguments(arguments);

				global.postMessage(MESSAGE_PREFIX + handle, "*");

				return handle;
			};
		}

		function installReadyStateChangeImplementation(attachTo) {
			attachTo.setImmediate = function () {
				var handle = tasks.addFromSetImmediateArguments(arguments);

				var scriptEl = global.document.createElement("script");
				scriptEl.onreadystatechange = function () {
					tasks.runIfPresent(handle);

					scriptEl.onreadystatechange = null;
					scriptEl.parentNode.removeChild(scriptEl);
					scriptEl = null;
				};
				global.document.documentElement.appendChild(scriptEl);

				return handle;
			};
		}

		function installSetTimeoutImplementation(attachTo) {
			attachTo.setImmediate = function () {
				var handle = tasks.addFromSetImmediateArguments(arguments);

				global.setTimeout(function () {
					tasks.runIfPresent(handle);
				}, 0);

				return handle;
			};
		}

		if (!global.setImmediate) {
			var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ?
							  Object.getPrototypeOf(global)
							: global;

			if ((typeof self !== "undefined" && self.Jive && self.Jive.Features && self.Jive.Features.RetardMode) || (typeof Worker === "undefined" || typeof WebSocket === "undefined")) {
				installSetTimeoutImplementation(attachTo);
			} else {
				if (canUseNextTick()) {
					installNextTickImplementation(attachTo);
				} else if (canUsePostMessage()) {
					installPostMessageImplementation(attachTo);
				} else if (canUseMessageChannel()) {
					installMessageChannelImplementation(attachTo);
				} else if (canUseReadyStateChange()) {
					installReadyStateChangeImplementation(attachTo);
				} else {
					installSetTimeoutImplementation(attachTo);
				}
			}

			attachTo.clearImmediate = tasks.remove;
		}
	}(typeof self === "object" && self ? self : this));



	//temp helper function since this state machine lib should be stand alone and not dependant on any
	//unerscore or utility library
	function extend(dest, source) {	for(var prop in source) {	dest[prop] = source[prop]; } return dest; }

	/**
	 * callback recieves a scope and data as well as a list of callbacks to execute
	 * 		it proceeds to call all of those callbacks with the scope and data provided
	 * @function
	 * @private to this closure
	 * @param {object} scope - the scope with which to call the callback
	 * @param {object} data - data to pass as the argument of the callback
	 * @param {array[function]} cbs - an array of callback functions
	 * @return {null} null
	**/
	function callback(scope, data, cbs) {
		cbs = cbs || [];
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
	 * @param {array[functions] || function} - cbs, either an array of functions or a single function
	 * @return {array[function]} - returns an array of functions
	**/
	function sanitizeCbs(cbs) {
		if(cbs && {}.toString.call(cbs) !== '[object Array]') {
			cbs = [cbs];
		}
		return cbs;
	}

	/**
	 * Represents a State Object
	 * @constructor
	 * @param {object} options - an options argument that defines the state machine
	 *                         both its initState as a string and an array of possible
	 *                         states.
	 * @returns {deferred} the deferred instance object
	**/
	var State = function(options) {
		var that = this;
		options = options || {
			initState : "new",
			states    : ["new"]
		};

		options.sync = options.sync || false;

		this.data = null;

		//setup some instance parameters
		this.internalState = options.initState;
		this.states = [];
		this.callbacks = {
			all  : {
				enter : [],
				leave : [],
				on    : []
			}
		};

		this.addStates(options.states);

		this.trigger = function(data, cbs) {
			callback(that, data, cbs);
		};

		if(Object.defineProperties) {
			Object.defineProperties(this, {
			  "internalState" : {enumerable:false, writable:true, configurable:false},
			  "states"        : {enumerable:false, writable:false, configurable:false},
			  "callbacks"     : {enumerable:false, writable:false, configurable:false}
			});
		}
		
    if(Object.seal) {
	    //Freeze the this so that the functions cannot be changed/overridden nor modified
			Object.seal(this);
		}
 		if(Object.freeze) {
	 		//Freeze the prototype so that the functions cannot be changed/overridden nor modified
			Object.freeze(State.prototype);
		}
		return this;
	};

	//extend the State prototype with the functions that it needs.
	//This is a performance/security tradeoff in tht these functions are 
	//kinda exposed (even though we freeze them below), but they are on
	//the prototype chain so tht you could extend this object and add things
	//or overload some prototype methods
	extend(State.prototype, {
		toString: function() {
			return "[object StateMachine]";
		},

		Promise: function(fsm, target) {
			this.toString = function() {
				return "[object StatePromise]";
			}
			this.on        = fsm.done.bind(fsm);
			this.state     = fsm.state.bind(fsm);
			this.getStates = fsm.getStates.bind(fsm);
			return this;
		},

		on: function(state, cbs, constraint) {
			constraint = constraint || "on";
			cbs = sanitizeCbs(cbs);
			if(cbs.length > 0) {
				var currentState = this.state();
				this.callbacks[state][constraint] = this.callbacks[state][constraint].concat(cbs)
			}
			return;
		},

		go: function(state, data) {
			data = data || {};
			this.data = data;
			if(state != this.state()) {
				var args = {
					leavingState  : this.state(),
					enteringState : state,
					data          : data
				};

				var cbs = [];
				
				//gather and trigger the "leave" callbacks... these are still sync its just a courtesy issue of ordering... 
				//you don't get to block or stop the state change in the callback
				cbs = cbs.concat(this.callbacks.all.leave).concat(this.callbacks[this.state()].leave);
				this.trigger(args, cbs);

				//now gather and trigger the "enter" callbacks... same constraints as leave
				cbs = [];
				cbs = cbs.concat(this.callbacks.all.enter).concat(this.callbacks[state].enter);
				this.trigger(args, cbs);
				
				this.setState(state);
				
				//now gather and trigger the "on" callbacks.
				cbs = [];
				cbs = cbs.concat(this.callbacks.all.on).concat(this.callbacks[state].on);
				this.trigger(args, cbs);
			}
			return;
		},

		addStates: function(states) {
			if(!(states && {}.toString.call(states) === '[object Array]')) {
				states = [states];
			}
			states.forEach(function(state) {
				this.states.push(state);
				this.callbacks[state] = this.callbacks[state] || {enter: [], leave: [], on: []};
			}, this);
		},

		removeStates: function(states) {
			if(!(states && {}.toString.call(states) === '[object Array]')) {
				states = [states];
			};
			var toKill = [];

			for(var i = 0; i < this.states.length; i++) {
				if(this.states[i] in states) {
					toKill.push(i);
					delete this.callbacks[this.states[i]];
				}
			};

			toKill.forEach(function(index) {
				this.states.splice(index, 1);
			}, this);
		},

		getStates: function() {
			return this.states;
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
			if(this.states.indexOf(newState) > -1) {
				this.internalState = newState;
			}
			return this.state();
		},

		promise: function() {
			var pro = new this.Promise(this);
			return pro;
		}
	});
	
	//set this to the utility namespace 
	self._u_ = self._u_ || {};
	self._u_.State = State;

	//and also return the Constructor so that it could be saved and used directly
	return State;
})();

