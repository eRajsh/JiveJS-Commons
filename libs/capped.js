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
			if (this.length < args.size && args.rotate === false) {
				Array.prototype.push.apply(this, ms);
			} else if ( args.rotate == true) {
				Array.prototype.push.apply(this, ms);
			} else {
				return false;
			}
			var toShift = this.length - args.size;
			
			if (toShift > 0) {
				for (var i = toShift-1; i >= 0; i--) {
					this.shift();
				}
			}
			return this;
		};
		if(Object.defineProperties) {
			Object.defineProperty(that, "push", { enumerable:false, writable:false, configurable:false });
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
