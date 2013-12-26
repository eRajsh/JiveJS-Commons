

(function () {
	"use strict";

	WeakMap.prototype = Object.create(Object.prototype);
	WeakMap.prototype.get = function (key) {
		var res = (this.find(key));
		if (res) return res.val;
	};
	WeakMap.prototype.has = function (key) {
		if (this.find(key)) return true;
		else return false;
	};
	WeakMap.prototype.toString = function () {
		return "[object WeakMap]";
	};

	if(Object.defineProperties) {
		Object.defineProperty(WeakMap.prototype, "get",      { enumerable:false, writable:false });
		Object.defineProperty(WeakMap.prototype, "has",      { enumerable:false, writable:false });
		Object.defineProperty(WeakMap.prototype, "toString", { enumerable:false, writable:false });
	}
	
	function WeakMap(seed) {
		var innerData = [];
		var that = this;
		
		that.explanation = "This is a Shim polyfil for the concept of a ES6.WeakMap.";
		that.find = function (key) {
			var ret = undefined;
			for(var i = 0; i < innerData.length; i++) {
				if (innerData[i].key === key) {
					ret = innerData[i];
					break;
				}
			}
			return ret;
		}

		that.size = function () {
			return innerData.length;
		};

		that.set = function (key, val) {
			var res = this.find(key);
			if (res != undefined) {
				res.val = val;
			} else {
				innerData.push({ key: key, val: val });
			}
			return;
		};

		that["delete"] = function (key) {
			var i = 0;
			for(i; i < innerData.length; i++) {
				if (innerData[i].key === key);
				break;
			}
			innerData.splice(i, 1);
		};
		
		that.toJSON = function () {
			return innerData;
		};

		if(Object.defineProperties) {
			Object.defineProperty(that, "find",   { enumerable:false, writable:false });
			Object.defineProperty(that, "size",   { enumerable:false, writable:false });
			Object.defineProperty(that, "set",    { enumerable:false, writable:false });
			Object.defineProperty(that, "delete", { enumerable:false, writable:false });
			Object.defineProperty(that, "toJSON", { enumerable:false, writable:false });
		}
		
		if (!_.isArray(seed)) seed = _.pairs(seed);
		for(var i = 0; i < seed.length; i++) {
			var val = seed[i];
			if (_.isArray(val)) {
				this.set(val[0], val[1]);
			} else {
				for(var prop in val) {
					this.set(prop, val[prop]);
				}
			}
		}

		return that;
	};
	_.WeakMap = WeakMap;
})();

