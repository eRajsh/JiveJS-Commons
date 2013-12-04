if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}
describe("Capped.js is a class to polyfill a capped Array... because that is awesome", function() {
	it("sets up a global constructor _.Capped", function() {
		expect(_.Capped).not.toEqual(undefined);
		expect(_.Capped).toBeTruthy();
	});

	describe("it is constructed with a capped size and whether to rotate or not", function() {
		it("defaults to capped at 1000 and rotate true", function() {
			var capped = new _.Capped();
			for(var i = 0; i < 1005; i++) {
				capped.push(i);
			}
			expect(capped.length).toEqual(1000);
			expect(capped[0]).toEqual(5);
			expect(capped[999]).toEqual(1004);
		});

		it("can be newed up with arguments to change the cap and rotation", function() {
			var capped = new _.Capped({size:50, rotate:false});
			for(var i = 0; i < 55; i++) {
				capped.push(i);
			}
			expect(capped.length).toEqual(50);
			expect(capped[0]).toEqual(0);
			expect(capped[49]).toEqual(49);
		});

		it("has push that is awesome sauce for both rotated and non rotated", function() {
			var capped = new _.Capped({size:5, rotate:false});
			
			var len = capped.push(1);
			expect(len).toEqual(1);
			expect(capped.length).toEqual(1);

			len = capped.push(2,3,4,5,6);
			expect(len).toEqual(5);
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(1);
			expect(capped[4]).toEqual(5);

			capped = new _.Capped({size:5, rotate:true});

			len = capped.push(1);
			expect(len).toEqual(1);
			expect(capped.length).toEqual(1);

			len = capped.push(2,3,4,5,6);
			expect(len).toEqual(5);
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(2);
			expect(capped[4]).toEqual(6);
		});

		it("has unshift that is awesome sauce for both rotated and non rotated", function() {
			var capped = new _.Capped({size:5, rotate:false});
			var len = capped.unshift(1);
			expect(len).toEqual(1);
			expect(capped.length).toEqual(1);

			len = capped.unshift(2,3,4,5,6);
			expect(len).toEqual(5);
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(2);
			expect(capped[4]).toEqual(1);
			capped = new _.Capped({size:5, rotate:true});

			len = capped.unshift(1);
			expect(len).toEqual(1);
			expect(capped.length).toEqual(1);

			len = capped.unshift(2,3,4,5,6);
			expect(len).toEqual(5);
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(2);
			expect(capped[4]).toEqual(6);
		});

		it("has splice that is awesome sauce for both rotated and non rotated", function() {
			var capped = new _.Capped({size:5, rotate:false}, [1,2,3,4,5]);
			var len = capped.splice(0,1,6,7);
			expect(len).toEqual([1]);
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(6);
			expect(capped[4]).toEqual(5);

			capped = new _.Capped({size:5, rotate:true}, [1,2,3,4,5]);
			var len = capped.splice(0,1,6,7);
			expect(len).toEqual([1]);
			
			expect(capped.length).toEqual(5);
			expect(capped[0]).toEqual(6);
			expect(capped[4]).toEqual(4);
		});

	});
	
	
});

