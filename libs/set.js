

(function () {
	"use strict";

	Set.prototype = Object.create(Object.prototype);
	
	Set.prototype.get = function (key) {
		return this.find(key);
	};
	
	Set.prototype.has = function (key) {
		if (this.find(key)) {
			return true;
		} 
		return false;
	};
	
	Set.prototype.toString = function () {
		return "[object Set]";
	};

	if(Object.defineProperties) {
		Object.defineProperty(Set.prototype, "get",      { enumerable:false, writable:false });
		Object.defineProperty(Set.prototype, "has",      { enumerable:false, writable:false });
		Object.defineProperty(Set.prototype, "toString", { enumerable:false, writable:false });
	}
	
	function Set(seed) {
		var innerData = [];
		
		if ((seed !== null && seed != undefined) && typeof seed !== "undefined") innerData = seed;
		
		this.add = function (key) {
			if (this.find(key) === undefined) innerData.push(key);
		};

		this["delete"] = function (key) {
			var i = 0;
			for(i; i < innerData.length; i++) {
				if (innerData[i] === key) {
					innerData.splice(i, 1);
					break;
				}
			}
		};
		
		this.size = function () {
			return innerData.length;
		};

		this.find = function (key) {
			var ret = undefined;
			for(var i = 0; i < innerData.length; i++) {
				if (innerData[i] === key) {
					ret = innerData[i];
					break;
				}
			}
			return ret;
		}
		this.toJSON = function () {
			return innerData;
		};
		if(Object.defineProperties) {
			Object.defineProperty(this, "add",    { enumerable:false, writable:false });
			Object.defineProperty(this, "delete", { enumerable:false, writable:false });
			Object.defineProperty(this, "size",   { enumerable:false, writable:false });
			Object.defineProperty(this, "toJSON", { enumerable:false, writable:false });
		}
		return this;
	};
	_.Set = Set;
})();

