(function() {
	"use strict";

	_.enableRetardMode = function() {
		//begin RetardMode polyfilling

		//object keys
		// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
		if (!Object.keys) {
			Object.keys = (function() {
				'use strict';
				var hasOwnProperty = Object.prototype.hasOwnProperty,
					hasDontEnumBug = !({
						toString: null
					}).propertyIsEnumerable('toString'),
					dontEnums = [
							'toString',
							'toLocaleString',
							'valueOf',
							'hasOwnProperty',
							'isPrototypeOf',
							'propertyIsEnumerable',
							'constructor'
					],
					dontEnumsLength = dontEnums.length;

				return function(obj) {
					if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
						throw new TypeError('Object.keys called on non-object');
					}

					var result = [],
						prop, i;

					for (prop in obj) {
						if (hasOwnProperty.call(obj, prop)) {
							result.push(prop);
						}
					}

					if (hasDontEnumBug) {
						for (i = 0; i < dontEnumsLength; i++) {
							if (hasOwnProperty.call(obj, dontEnums[i])) {
								result.push(dontEnums[i]);
							}
						}
					}
					return result;
				};
			}());
		}

		if (!Object.create) {
			Object.create = (function() {
				function F() {}

				return function(o) {
					if (arguments.length != 1) {
						throw new Error('Object.create implementation only accepts one parameter.');
					}
					F.prototype = o
					return new F()
				}
			})()
		}

		if (!Object.freeze) {
			Object.freeze = function(obj) {
				return obj;
			}
			Object.isFrozen = function() {
				return false
			};
		}

		if (!Object.seal) {
			Object.seal = function(obj) {
				return obj;
			}
			Object.isSealed = function() {
				return false
			};
		}

		if (!Object.preventExtensions) {
			Object.preventExtensions = function(obj) {
				return obj;
			}
			Object.isExtensible = function() {
				return false
			};
		}

		if (!Function.prototype.bind) {
			Function.prototype.bind = function(oThis) {
				if (typeof this !== "function") {
					// closest thing possible to the ECMAScript 5 internal IsCallable function
					throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
				}

				var aArgs = Array.prototype.slice.call(arguments, 1),
					fToBind = this,
					fNOP = function() {},
					fBound = function() {
						return fToBind.apply(this instanceof fNOP && oThis ? this : oThis,
							aArgs.concat(Array.prototype.slice.call(arguments)));
					};

				fNOP.prototype = this.prototype;
				fBound.prototype = new fNOP();

				return fBound;
			};
		}

		// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
		// Production steps of ECMA-262, Edition 5, 15.4.4.18
		// Reference: http://es5.github.com/#x15.4.4.18
		if (!Array.prototype.forEach) {

			Array.prototype.forEach = function forEach(callback, thisArg) {
				'use strict';
				var T, k;

				if (this == null) {
					throw new TypeError("this is null or not defined");
				}

				var kValue,
					// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
					O = Object(this),

					// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
					// 3. Let len be ToUint32(lenValue).
					len = O.length >>> 0; // Hack to convert O.length to a UInt32

				// 4. If IsCallable(callback) is false, throw a TypeError exception.
				// See: http://es5.github.com/#x9.11
				if ({}.toString.call(callback) !== "[object Function]") {
					throw new TypeError(callback + " is not a function");
				}

				// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (arguments.length >= 2) {
					T = thisArg;
				}

				// 6. Let k be 0
				k = 0;

				// 7. Repeat, while k < len
				while (k < len) {

					// a. Let Pk be ToString(k).
					//   This is implicit for LHS operands of the in operator
					// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
					//   This step can be combined with c
					// c. If kPresent is true, then
					if (k in O) {

						// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
						kValue = O[k];

						// ii. Call the Call internal method of callback with T as the this value and
						// argument list containing kValue, k, and O.
						callback.call(T, kValue, k, O);
					}
					// d. Increase k by 1.
					k++;
				}
				// 8. return undefined
			};
		}

		// Production steps of ECMA-262, Edition 5, 15.4.4.19
		// Reference: http://es5.github.com/#x15.4.4.19
		if (!Array.prototype.map) {
			Array.prototype.map = function(callback, thisArg) {

				var T, A, k;

				if (this == null) {
					throw new TypeError(" this is null or not defined");
				}

				// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
				var O = Object(this);

				// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
				// 3. Let len be ToUint32(lenValue).
				var len = O.length >>> 0;

				// 4. If IsCallable(callback) is false, throw a TypeError exception.
				// See: http://es5.github.com/#x9.11
				if (typeof callback !== "function") {
					throw new TypeError(callback + " is not a function");
				}

				// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
				if (thisArg) {
					T = thisArg;
				}

				// 6. Let A be a new array created as if by the expression new Array(len) where Array is
				// the standard built-in constructor with that name and len is the value of len.
				A = new Array(len);

				// 7. Let k be 0
				k = 0;

				// 8. Repeat, while k < len
				while (k < len) {

					var kValue, mappedValue;

					// a. Let Pk be ToString(k).
					//   This is implicit for LHS operands of the in operator
					// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
					//   This step can be combined with c
					// c. If kPresent is true, then
					if (k in O) {

						// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
						kValue = O[k];

						// ii. Let mappedValue be the result of calling the Call internal method of callback
						// with T as the this value and argument list containing kValue, k, and O.
						mappedValue = callback.call(T, kValue, k, O);

						// iii. Call the DefineOwnProperty internal method of A with arguments
						// Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
						// and false.

						// In browsers that support Object.defineProperty, use the following:
						// Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

						// For best browser support, use the following:
						A[k] = mappedValue;
					}
					// d. Increase k by 1.
					k++;
				}

				// 9. return A
				return A;
			};
		}

		if (!Array.prototype.filter) {
			Array.prototype.filter = function(fun /*, thisp*/ ) {
				'use strict';

				if (!this) {
					throw new TypeError();
				}

				var objects = Object(this);
				var len = objects.length >>> 0;
				if (typeof fun !== 'function') {
					throw new TypeError();
				}

				var res = [];
				var thisp = arguments[1];
				for (var i in objects) {
					if (objects.hasOwnProperty(i)) {
						if (fun.call(thisp, objects[i], i, objects)) {
							res.push(objects[i]);
						}
					}
				}

				return res;
			};
		}

		if (!('every' in Array.prototype)) {
			Array.prototype.every= function(tester, that /*opt*/) {
				for (var i= 0, n= this.length; i<n; i++)
					if (i in this && !tester.call(that, this[i], i, this))
						return false;
				return true;
			};
		}
		if (!('some' in Array.prototype)) {
			Array.prototype.some= function(tester, that /*opt*/) {
				for (var i= 0, n= this.length; i<n; i++)
					if (i in this && tester.call(that, this[i], i, this))
						return true;
				return false;
			};
		}

		if (!Array.prototype.indexOf) {
			Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
				'use strict';
				if (this == null) {
					throw new TypeError();
				}
				var n, k, t = Object(this),
					len = t.length >>> 0;

				if (len === 0) {
					return -1;
				}
				n = 0;
				if (arguments.length > 1) {
					n = Number(arguments[1]);
					if (n != n) { // shortcut for verifying if it's NaN
						n = 0;
					} else if (n != 0 && n != Infinity && n != -Infinity) {
						n = (n > 0 || -1) * Math.floor(Math.abs(n));
					}
				}
				if (n >= len) {
					return -1;
				}
				for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
					if (k in t && t[k] === searchElement) {
						return k;
					}
				}
				return -1;
			};
		}

		if (!String.prototype.trim) {
			String.prototype.trim = function() {
				return this.replace(/^\s+|\s+$/g, '');
			};
		}

		if (!('lastIndexOf' in Array.prototype)) {
			Array.prototype.lastIndexOf= function(find, i /*opt*/) {
				if (i===undefined) i= this.length-1;
				if (i<0) i+= this.length;
				if (i>this.length-1) i= this.length-1;
				for (i++; i-->0;) /* i++ because from-argument is sadly inclusive */
					if (i in this && this[i]===find)
						return i;
				return -1;
			};
		}


		//end RetardMode polyfilling
	};
})();
