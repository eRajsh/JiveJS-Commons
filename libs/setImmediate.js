(function (global, undefined) {
	"use strict";

	var nextHandle = 1; 
	var freeHandle;

	var cbsByHandle = [];
	var argsByHandle = [];

	var howMany = 0;

	global.setImmediateDebug = function() {
		return {
			nextHandle: nextHandle,
			freeHandle: freeHandle,
			cbsByHandle: cbsByHandle,
			argsByHandle: argsByHandle,
			howMany: howMany
		}
	};

	var handle;
	function addFromSetImmediate(cb, args) {
		handle = (freeHandle !== undefined) ? freeHandle : nextHandle++;
		cbsByHandle[handle] = cb;
		argsByHandle[handle] = args;

		freeHandle = undefined;

		return handle;
	}

	function runIfPresent(key) {
		key = parseInt(key, 10);
		cbsByHandle[key] ? cbsByHandle[key].apply(undefined, argsByHandle[key]) : false;
		freeHandle = key;
		howMany++;
	}

	function canUseNextTick() {
		return typeof process === "object" &&
			   Object.prototype.toString.call(process) === "[object process]";
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

	function canUseMessageChannel() {
		return !!global.MessageChannel;
	}

	function installNextTickImplementation(attachTo) {
		attachTo.setImmediate = function () {
			var args = arguments;

			process.nextTick(function () {
				args[0].call(undefined, Array.prototype.slice.call(args, 1));
			});
		};
	}

	function installPostMessageImplementation(attachTo) {
		var MESSAGE_PREFIX = "com.setImmediate" + Math.random();
		var MESSAGE_PREFIX_LENGTH = MESSAGE_PREFIX.length;

		function isStringAndStartsWith(string) {
			return typeof string === "string" && string.substring(0, MESSAGE_PREFIX_LENGTH) === MESSAGE_PREFIX;
		}

		function onGlobalMessage(event) {
			if (event.source === global && isStringAndStartsWith(event.data)) {
				runIfPresent(event.data.substring(MESSAGE_PREFIX_LENGTH));
			}
		}
		if (global.addEventListener) {
			global.addEventListener("message", onGlobalMessage, false);
		} else {
			global.attachEvent("onmessage", onGlobalMessage);
		}

		attachTo.setImmediate = function () {
			var cb = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);

			global.postMessage(MESSAGE_PREFIX + addFromSetImmediate(cb, args), "*");
		};
	}

	function installMessageChannelImplementation(attachTo) {
		var channel = new global.MessageChannel();
		channel.port1.onmessage = function (event) {
			runIfPresent(event.data);
		};
		attachTo.setImmediate = function () {
			var cb = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);

			channel.port2.postMessage(addFromSetImmediate(cb, args));
		};
	}

	function installSetTimeoutImplementation(attachTo) {
		attachTo.setImmediate = function () {
			var cb = arguments[0];
			var args = Array.prototype.slice.call(arguments, 1);

			global.setTimeout(function () {
				cb.call(undefined, args);
			}, 0);
		};
	}

	if (!global.setImmediate) {
		var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ?
						  Object.getPrototypeOf(global)
						: global;

		if (canUseNextTick()) {
			installNextTickImplementation(attachTo);
		} else if (canUsePostMessage()) {
			installPostMessageImplementation(attachTo);
		} else if (canUseMessageChannel()) {
			installMessageChannelImplementation(attachTo);
		} else {
			installSetTimeoutImplementation(attachTo);
		}
	}
}(typeof self === "object" && self ? self : this));
