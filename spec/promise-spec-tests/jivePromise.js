var jiveJS = require('../../jive.js')
  , _ = jiveJS._;

module.exports = function () {

	return {
		resolved: function(value) {
			var dfd = new _.Dfd();
			dfd.resolve(value);
			return dfd.promise();
		},
		rejected: function(reason) {
			var dfd = new _.Dfd();
			dfd.reject(reason);
			return dfd.promise();
		},
		deferred: function() {
			var dfd = new _.Dfd();
			var ret = {
				promise: dfd.promise(),
				resolve: dfd.resolve.bind(dfd),
				reject: dfd.reject.bind(dfd)
			}
			return ret;
		}
	}

}();