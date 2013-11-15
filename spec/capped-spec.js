if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}

describe("Capped.js is a class to polyfill a capped Array... because that is awesome", function() {
	it("sets up a global constructor _.Capped", function() {
		expect(_.Capped).not.toEqual(undefined);
		expect(_.Capped).toBeTruthy();
	});

	describe("it is constructed with a capped size and whether to rotate or not... and just overrides the push method", function() {
		it("defaults to capped at 1000 and rotate true", function() {
			var capped = new _.Capped();
			for(var i = 0; i < 1001; i++) {
				capped.push(i);
			}
			expect(capped.length).toEqual(1000);
			expect(capped[0]).toEqual(1);
			expect(capped[999]).toEqual(1000);
		});

		it("can be newed up with arguments to change the cap and rotation", function() {
			var capped = new _.Capped({size:50, rotate:false});
			for(var i = 0; i < 51; i++) {
				capped.push(i);
			}
			expect(capped.length).toEqual(50);
			expect(capped[0]).toEqual(0);
			expect(capped[49]).toEqual(49);
		});

	});
	
	
});

