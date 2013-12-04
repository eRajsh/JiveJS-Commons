(function () {
	"use strict";

	Capped.prototype = Object.create(Array.prototype);
	Capped.prototype.toString = function () {
			return "[object Capped]";
		};

	if(Object.defineProperties) {
		Object.defineProperty(Capped.prototype, "toString", { enumerable:false, writable:false });
	}
	
	function Capped(args, seed) {
		args = args || {};
		
		_.defaults(args,{size:1000, rotate:true});
		
		var that = this;
		that.push = function () {
			var ms = Array.prototype.slice.call(arguments, 0);

			if(args.rotate === true) {
				Array.prototype.push.apply(this, ms);
				var over = this.length - args.size;
				if (over > 0) {
					Array.prototype.splice.call(this, 0, over);
				}
			} else {
				var that = this;
				var diff = args.size - this.length;
				var toPush = ms.splice(0, diff);
				Array.prototype.push.apply(that, toPush);
			}
			
			return this.length;
		};

		that.unshift = function() {
			var ms = Array.prototype.slice.call(arguments, 0);

			if(args.rotate === true) {
				Array.prototype.unshift.apply(this, ms);
				var over = this.length - args.size;
				if (over > 0) {
					Array.prototype.splice.call(this, -over, over);
				}
			} else {
				var that = this;
				var diff = args.size - this.length;
				var toShift = ms.splice(0, diff);
				Array.prototype.unshift.apply(that, toShift);
			}
			
			return this.length;
		};

		that.splice = function() {
			var ms = Array.prototype.slice.call(arguments, 0);
			var where = ms.shift();
			var howMany = ms.shift();
			var toAdd = ms;

			var ret = Array.prototype.splice.call(this, where, howMany);

			if(args.rotate === true) {
				toAdd.unshift(0);
				toAdd.unshift(where);
				
				Array.prototype.splice.apply(this, toAdd);
				
				var over = this.length - args.size;
				if (over > 0) {
					Array.prototype.splice.call(this, -over, over);
				}
			} else {
				var that = this;
				var diff = args.size - this.length;
				var toSplice = toAdd.splice(0, diff);
				toSplice.unshift(0);
				toSplice.unshift(where);
				Array.prototype.splice.apply(this, toSplice);
			}
			
			return ret;
		};

		if(Object.defineProperties) {
			Object.defineProperty(that, "push", { enumerable:false, writable:false, configurable:false });
		}
		if(Object.defineProperties) {
			Object.defineProperty(that, "unshift", { enumerable:false, writable:false, configurable:false });
		}
		if(Object.defineProperties) {
			Object.defineProperty(that, "splice", { enumerable:false, writable:false, configurable:false });
		}
		
		if(seed) {
			for(var i = 0; i < seed.length; i++) {
				that.push(seed[i])
			}
		}
		
		return that;
	}
	
	_.Capped = Capped;
})();
