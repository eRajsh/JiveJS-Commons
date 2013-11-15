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
						task.run();
						delete tasksByHandle[handle];
						currentlyRunningATask = false;
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