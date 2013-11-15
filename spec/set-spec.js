if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}

describe("Set.js is a class to polyfill the upcoming Set type in ES6", function() {
	it("sets up a global constructor _.Set", function() {
		expect(_.Set).not.toEqual(undefined);
		expect(_.Set).toBeTruthy();
	});

	describe("it exposes a similar functional API to the proposed ES6 Set Object", function() {
		it("has an add function which sets things into the Set by the key", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.find(key)).toEqual(key);
		});

		it("has a find function which can find things in the Set by the key, this one should be really hidden in the real implementation", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.find(key)).toEqual(key);
		});

		it("has a get function which can get back the key from the set", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.get(key)).toEqual(key);
		});

		it("has a 'has' function which can tell you whether the Set contains that key", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.has(key)).toBeTruthy();
		});

		it("has a toJSON function which kinda prints out the Set", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.toJSON()[0]).toEqual(key);
			expect(_.isArray(map.toJSON())).toBeTruthy();
			expect(map.toJSON().length).toEqual(1);
		});

		it("has a size function which tells you the size of the Set", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.size()).toEqual(1);

			map.add(1);
			expect(map.size()).toEqual(2);
		});

		it("has a delete function to remove keys from the Set", function() {
			var key = {foo:"bar"};
			var map = new _.Set();

			map.add(key);
			expect(map.size()).toEqual(1);
			
			map.add(1);
			expect(map.size()).toEqual(2);
			
			map.delete(key);
			expect(map.size()).toEqual(1);
		});

		it('has its own toString override for easy detection', function() {
			var map = new _.Set();
			expect(map.toString()).toEqual("[object Set]");
		})

	});
	
	
});

