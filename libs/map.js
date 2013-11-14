

(function () {
	"use strict";
	
	Map.prototype = Object.create(Object.prototype);
	Map.prototype.get = function (key) {
		var res = (this.find(key));
		if (res) {
			return res.val;
		} 
		return null;
	};
	Map.prototype.has = function (key) {
		if (this.find(key)) {
			return true;
		}
		return false;
	};
	Map.prototype.toString = function () {
		return "[object Map]";
	};

	if(Object.defineProperties) {
		Object.defineProperty(Map.prototype, "get",      { enumerable:false, writable:false });
		Object.defineProperty(Map.prototype, "has",      { enumerable:false, writable:false });
		Object.defineProperty(Map.prototype, "toString", { enumerable:false, writable:false });
	}
	
	function Map(seed) {
		var innerData = [];
		
		this.find = function (key) {
			var ret = undefined;
			for(var i = 0; i < innerData.length; i++) {
				if (innerData[i].key === key) {
					ret = innerData[i];
					break;
				}
			}
			return ret;
		}

		this.size = function () {
			return innerData.length;
		};

		this.set = function (key, val) {
			var res = this.find(key);
			if (res != undefined) {
				res.val = val;
			} else {
				innerData.push({ key: key, val: val });
			}
			return;
		};

		this["delete"] = function (key) {
			var i = 0;
			for(i; i < innerData.length; i++) {
				if (innerData[i].key === key) {
					innerData.splice(i, 1);
					break;
				}
			}
		};
		
		this.toJSON = function () {
			return innerData;
		};
		if(Object.defineProperties) {
			Object.defineProperty(this, "find",   { enumerable:false, writable:false });
			Object.defineProperty(this, "size",   { enumerable:false, writable:false });
			Object.defineProperty(this, "set",    { enumerable:false, writable:false });
			Object.defineProperty(this, "delete", { enumerable:false, writable:false });
			Object.defineProperty(this, "toJSON", { enumerable:false, writable:false });
		}
		
		if (!_.isArray(seed)) {
			seed = _.pairs(seed);
		}
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

		return this;
	};
	_.Map = Map;
})();

