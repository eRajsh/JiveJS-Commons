if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}

describe("Util.js Utility class", function() {

	it("sets up a global variable _", function() {
		expect(_).not.toEqual(undefined);
		expect(_).toBeTruthy();
	});

	describe("exposes some utility functions for working with object properties", function() {
		it("has a lockProperty function which makes this writeable:false and configurable:false", function() {
			var obj = {};
			obj.foo = "bar";
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(1);
			_.lockProperty(obj, "foo");
			obj.foo = "baz";
			expect(obj.foo).toEqual("bar");
			delete obj;
		});

		it("has a createProp function adds a property with the configuration you provide", function() {
			var obj
			obj = {};
			_.createProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: false,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);
			obj.foo = "baz";
			expect(obj.foo).toEqual("bar");
			delete obj;

			obj = {};
			_.createProp(obj, {
				name: "foo",
				attrs: {
					writable: true,
					value: "bar",
					configurable: false,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);
			obj.foo = "baz";
			expect(obj.foo).toEqual("baz");
			delete obj;

			obj = {};
			_.createProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: false,
					enumerable: true
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(1);
			obj.foo = "baz";
			expect(obj.foo).toEqual("bar");
			delete obj;

			obj = {};
			_.createProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: true,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);

			_.updateProp(obj, {
				name: "foo",
				attrs: {
					get: function() {
						return "baz"
					}
				}
			});
			expect(obj.foo).toEqual("baz");
			delete obj;
		});

		it("has a createProps function adds an array of properties with the configuration you provide for each", function() {
			var obj
			obj = {};
			_.createProps(obj, [{
					name: "foo",
					attrs: {
						writable: false,
						value: "bar",
						configurable: false,
						enumerable: false
					}
				}, {
					name: "bar",
					attrs: {
						writable: true,
						value: "buz",
						configurable: false,
						enumerable: true
					}
				}
			]);
			expect(obj.foo).toEqual("bar");
			expect(obj.bar).toEqual("buz");
			expect(Object.keys(obj).length).toEqual(1);
			obj.foo = "baz";
			obj.bar = "baz";
			expect(obj.foo).toEqual("bar");
			expect(obj.bar).toEqual("baz");
			delete obj;
		});

		it("has an updateProp function which is essentially identical to the create prop bunction", function() {
			var obj
			obj = {};
			_.updateProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: false,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);
			obj.foo = "baz";
			expect(obj.foo).toEqual("bar");
			delete obj;

			obj = {};
			_.updateProp(obj, {
				name: "foo",
				attrs: {
					writable: true,
					value: "bar",
					configurable: false,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);
			obj.foo = "baz";
			expect(obj.foo).toEqual("baz");
			delete obj;

			obj = {};
			_.updateProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: false,
					enumerable: true
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(1);
			obj.foo = "baz";
			expect(obj.foo).toEqual("bar");
			delete obj;

			obj = {};
			_.updateProp(obj, {
				name: "foo",
				attrs: {
					writable: false,
					value: "bar",
					configurable: true,
					enumerable: false
				}
			});
			expect(obj.foo).toEqual("bar");
			expect(Object.keys(obj).length).toEqual(0);

			_.updateProp(obj, {
				name: "foo",
				attrs: {
					get: function() {
						return "baz"
					}
				}
			});
			expect(obj.foo).toEqual("baz");
			delete obj;
		});
	});

	describe("exposes some utility functions for working with OSGI version strings", function() {
		it("has a parseVersion function that takes a osgi version string and range and reduces it to operateable json", function() {
			var v1 = "01.01.01";
			var v2 = "[01.01.01,02.02.02]";
			var v3 = "[01.01.01,02.02.02)";
			var v4 = "(01.01.01,02.02.02]";
			var v5 = "(01.01.01,02.02.02)";

			var v1p = _.parseVersion(v1);
			expect(v1p.eq).toEqual("01.01.01");

			var v2p = _.parseVersion(v2);
			expect(v2p.gte).toEqual("01.01.01");
			expect(v2p.lte).toEqual("02.02.02");

			var v3p = _.parseVersion(v3);
			expect(v3p.gte).toEqual("01.01.01");
			expect(v3p.lt).toEqual("02.02.02");

			var v4p = _.parseVersion(v4);
			expect(v4p.gt).toEqual("01.01.01");
			expect(v4p.lte).toEqual("02.02.02");

			var v5p = _.parseVersion(v5);
			expect(v5p.gt).toEqual("01.01.01");
			expect(v5p.lt).toEqual("02.02.02");
		});

		it("has a sanitizeVersion function which turns string versions into easily comparable version numbers", function() {
			var v1 = "01.01.01";
			var v2 = "02.02.02";

			var v1s = _.sanitizeVersion(v1);
			var v2s = _.sanitizeVersion(v2);

			expect(v1s).toEqual(1001001);
			expect(v2s).toEqual(2002002);
		});

		it("has a versionMatch function which determines if a concrete version is within a range", function() {
			var exp1 = _.parseVersion("01.01.03");
			var exp2 = _.parseVersion("01.01.00");

			var imp1 = _.parseVersion("[01.01.01,02.02.02]");
			var imp2 = _.parseVersion("(01.01.03,02.02.02]");
			var imp3 = _.parseVersion("01.01.03");

			expect(_.versionMatch(exp1, imp1)).toBeTruthy();
			expect(_.versionMatch(exp2, imp1)).toBeFalsy();

			expect(_.versionMatch(exp1, imp2)).toBeFalsy();
			expect(_.versionMatch(exp2, imp2)).toBeFalsy();

			expect(_.versionMatch(exp1, imp3)).toBeTruthy();
			expect(_.versionMatch(exp2, imp3)).toBeFalsy();
		})
	});

	describe("exposes type matching utility functions exist for Array, Number, String, Function, and Object", function() {
		it("has a isArray function that matches array literals and constructed arrays", function() {
			expect(_.isArray([])).toBeTruthy();
			expect(_.isArray({})).toBeFalsy();
			expect(_.isArray(123)).toBeFalsy();
			expect(_.isArray("asdf")).toBeFalsy();
			expect(_.isArray(function() {})).toBeFalsy();
			expect(_.isArray(new Array)).toBeTruthy();
			expect(_.isArray(new Object)).toBeFalsy();
			expect(_.isArray(new String)).toBeFalsy();
			expect(_.isArray(new Function)).toBeFalsy();
			expect(_.isArray(new Number)).toBeFalsy();
			expect(_.isArray()).toEqual(false);
		});

		it("has a isNormalObject function that matches object literals and constructed objects", function() {
			expect(_.isNormalObject([])).toBeFalsy();
			expect(_.isNormalObject({})).toBeTruthy();
			expect(_.isNormalObject(123)).toBeFalsy();
			expect(_.isNormalObject("asdf")).toBeFalsy();
			expect(_.isNormalObject(function() {})).toBeFalsy();
			expect(_.isNormalObject(new Array)).toBeFalsy();
			expect(_.isNormalObject(new Object)).toBeTruthy();
			expect(_.isNormalObject(new String)).toBeFalsy();
			expect(_.isNormalObject(new Function)).toBeFalsy();
			expect(_.isNormalObject(new Number)).toBeFalsy();
			expect(_.isNormalObject()).toEqual(false);
		});

		it("has a isString function that matches string literals and constructed strings", function() {
			expect(_.isString([])).toBeFalsy();
			expect(_.isString({})).toBeFalsy();
			expect(_.isString(123)).toBeFalsy();
			expect(_.isString("asdf")).toBeTruthy();
			expect(_.isString(function() {})).toBeFalsy();
			expect(_.isString(new Array)).toBeFalsy();
			expect(_.isString(new Object)).toBeFalsy();
			expect(_.isString(new String)).toBeTruthy();
			expect(_.isString(new Function)).toBeFalsy();
			expect(_.isString(new Number)).toBeFalsy();
			expect(_.isString()).toEqual(false);
		});

		it("has a isFunction function that matches function literals and constructed functions", function() {
			expect(_.isFunction([])).toBeFalsy();
			expect(_.isFunction({})).toBeFalsy();
			expect(_.isFunction(123)).toBeFalsy();
			expect(_.isFunction("asdf")).toBeFalsy();
			expect(_.isFunction(function() {})).toBeTruthy();
			expect(_.isFunction(new Array)).toBeFalsy();
			expect(_.isFunction(new Object)).toBeFalsy();
			expect(_.isFunction(new String)).toBeFalsy();
			expect(_.isFunction(new Function)).toBeTruthy();
			expect(_.isFunction(new Number)).toBeFalsy();
			expect(_.isFunction()).toEqual(false);
		});

		it("has a isNumber function that matches number literals and constructed numbers", function() {
			expect(_.isNumber([])).toBeFalsy();
			expect(_.isNumber({})).toBeFalsy();
			expect(_.isNumber(123)).toBeTruthy();
			expect(_.isNumber("asdf")).toBeFalsy();
			expect(_.isNumber(function() {})).toBeFalsy();
			expect(_.isNumber(new Array)).toBeFalsy();
			expect(_.isNumber(new Object)).toBeFalsy();
			expect(_.isNumber(new String)).toBeFalsy();
			expect(_.isNumber(new Function)).toBeFalsy();
			expect(_.isNumber(new Number)).toBeTruthy();
			expect(_.isNumber()).toEqual(false);
		});
	});

	describe("exposes other sundry utility functions for magic and joy", function() {
		it("has a fileSystemError function which just masks error callbacks for the fileSystem Apis", function() {
			spyOn(console, "log");
			var e = {};
			var msg = "";

			e.name = "QUOTA_EXCEEDED_ERR";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: QUOTA_EXCEEDED_ERR');

			e.name = "NOT_FOUND_ERR";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: NOT_FOUND_ERR');

			e.name = "SECURITY_ERR";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: SECURITY_ERR');

			e.name = "INVALID_MODIFICATION_ERR";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: INVALID_MODIFICATION_ERR');

			e.name = "INVALID_STATE_ERR";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: INVALID_STATE_ERR');

			e.name = "OTHER BLAH BLAH";
			_.fileSystemError(e);
			expect(console.log).toHaveBeenCalledWith('Error: Unknown Error');
		});

		it("has a hash function which makes short awesome numeric hashes from strings", function() {
			expect(_.hash("this is a standard string")).toEqual(-1695061268);
			expect(_.hash("this is a standard string")).toEqual(-1695061268);
			expect(_.hash("this is a different string")).toEqual(415781971);
		});

		it("has an encode_utf8 function that smartly mashes several native javascript functions", function() {
			expect(_.encode_utf8("this is a standard string")).toEqual("this%2520is%2520a%2520standard%2520string");
			expect(_.encode_utf8("this is a crazy string <>?!@#$%^&*()_+=`~")).toEqual("this%2520is%2520a%2520crazy%2520string%2520%253C%253E%253F%2521%40%2523%2524%2525%255E%2526*%2528%2529_%2B%253D%2560%257E");
			expect(_.encode_utf8("this is a accented Peneda-GerÃªs")).toEqual("this%2520is%2520a%2520accented%2520Peneda-Ger%25C3%25AAs");
		});

		it("has a decode_utf8 function that smartly mashes several native javascript functions", function() {
			expect(_.decode_utf8("this%2520is%2520a%2520standard%2520string")).toEqual("this is a standard string");
			expect(_.decode_utf8("this%2520is%2520a%2520crazy%2520string%2520%253C%253E%253F%2521%40%2523%2524%2525%255E%2526*%2528%2529_%2B%253D%2560%257E")).toEqual("this is a crazy string <>?!@#$%^&*()_+=`~");
			expect(_.decode_utf8("this is a accented Peneda-GerÃªs")).toEqual("this is a accented Peneda-GerÃªs");
		});

		it("has a decode_utf8 and encode_utf8 functions are inverses", function() {
			var string = "this is a crazy string <>?!@#$%^&*()_+=`~ & this is a accented Peneda-GerÃªs";
			expect(_.decode_utf8(_.encode_utf8(string))).toEqual(string);
		});

		it("has a query string encode that encodes an object into a URL encoded string.", function() {
			expect(_.queryStringEncode({
				foo: "bar",
				test: "cheese",
				utf8: "this is a accented Peneda-GerÃªs"
			})).toEqual("foo=bar&test=cheese&utf8=this%20is%20a%20accented%20Peneda-Ger%C3%83%C2%AAs");
		});

		it("has a query string decode that decodes a URL encoded string into an object.", function() {
			expect(_.queryStringDecode("foo=bar&test=cheese&utf8=this%20is%20a%20accented%20Peneda-Ger%C3%83%C2%AAs")).toEqual({
				foo: "bar",
				test: "cheese",
				utf8: "this is a accented Peneda-GerÃªs"
			});
		});

		it("has a function that escapes HTML", function() {
			expect(_.escape('<span>test</span>')).toEqual("&lt;span&gt;test&lt;/span&gt;");
		});

		it("has a method that wraps links in anchor tags", function() {
			tests = [
				{
					string: "www.jive.com",
					result: "<a target=\"_blank\" href=\"http://www.jive.com\">www.jive.com</a>"
				}, {
					string: "user@getjive.com",
					result: "<a target=\"_blank\" href=\"mailto:user@getjive.com\">user@getjive.com</a>"
				}, {
					string: "<span style=\"color:red\">test</span>",
					result: "<span style=\"color:red\">test</span>"
				}, {
					string: "Email user@getjive.com from www.jive.com.",
					result: "Email <a target=\"_blank\" href=\"mailto:user@getjive.com\">user@getjive.com</a> from <a target=\"_blank\" href=\"http://www.jive.com\">www.jive.com</a>."
				},
			];

			for (var i = 0; i < tests.length; i++) {
				var test = tests[i];

				expect(_.htmlLinkify(test.string)).toEqual(test.result);
			}
		});

		describe("it has a function that creates a regex for URN matching", function() {
			it("should create regexs that match the way I expect", function() {
				var regex1 = _.createRegex({
					urn: "test:me"
				});
				var regex2 = _.createRegex({
					urn: "test:*:you:*:me"
				});
				var regex3 = _.createRegex({
					urn: "test:#:hello"
				});
				var regex4 = _.createRegex({
					urn: "(test|what):#:hello"
				});
				var regex5 = _.createRegex({
					urn: "test:entities:*:foo:*"
				});
				var regex6 = _.createRegex({
					urn: "test:entities:#"
				});
				var regex7 = _.createRegex({
					urn: "test:entities:*:foo"
				});

				expect(JSON.stringify("test:me".match(regex1))).toEqual('["test:me","test","me"]');
				expect("test:us:hello".match(regex2)).toEqual(null);
				expect(JSON.stringify("test:all:you:and:me".match(regex2))).toEqual('["test:all:you:and:me","test","all","you","and","me"]');
				expect(JSON.stringify("test:me:always:hello".match(regex3))).toEqual('["test:me:always:hello","test","me:always","hello"]');
				expect(JSON.stringify("test:me:hello".match(regex3))).toEqual('["test:me:hello","test","me","hello"]');
				expect(JSON.stringify("test:me:hello".match(regex4))).toEqual('["test:me:hello","test","test","me","hello"]');
				expect(JSON.stringify("what:me:hello".match(regex4))).toEqual('["what:me:hello","what","what","me","hello"]');
				expect(JSON.stringify("test:entities:johnsmith@google.com:foo:blarg".match(regex5))).toEqual('["test:entities:johnsmith@google.com:foo:blarg","test","entities","johnsmith@google.com","foo","blarg"]');
				expect(JSON.stringify("test:entities:johnsmith@google.com:foo:blarg".match(regex6))).toEqual('["test:entities:johnsmith@google.com:foo:blarg","test","entities","johnsmith@google.com:foo:blarg"]');
				expect("test:entities:johnsmith@google.com:foo:blarg".match(regex7)).toBeNull();
			});

			it("shouldn't be case sensitive", function(){
				var regex1 = _.createRegex({
					urn: "test:me"
				});

				expect(JSON.stringify("Test:Me".match(regex1))).toEqual('["Test:Me","Test","Me"]');
			});
		});

		it("has a function that measures how many bytes are in a function", function() {
			var length = _.getByteLength("1234567890");
			expect(length).toEqual(10);
		});

		it("has a function that clones an object and derefrences it and removes non-iterable keys", function() {
			function testObject() {
				function privateFunc() {
					this.innerPublic1 = "inner public guy";
				}

				this.public1 = "publicy1 guy";
				this.public2 = new privateFunc();
				this.public3 = [(new privateFunc())];
			}

			var instance = new testObject();


			var copy = _.clone(instance);
			expect(JSON.stringify(copy)).toEqual('{"public1":"publicy1 guy","public2":{"innerPublic1":"inner public guy"},"public3":[{"innerPublic1":"inner public guy"}]}');
			copy.public1 = "new publicy";
			expect(instance.public1).toEqual("publicy1 guy");
		});

		it("has a getOption function that reads for an option from an object or the object's option property", function() {
			var obj = {}
			obj.foo = "bar";
			obj.bing = "bong"
			obj.options = {};
			obj.options.bar = "buz";
			obj.options.bing = "boooga"

			expect(_.getOption(obj, "foo")).toEqual("bar");
			expect(_.getOption(obj, "bar")).toEqual("buz");
			expect(_.getOption(obj, "bing")).toEqual("boooga");
		});

		it("has a defaults option that safely copies properties from one object to another", function() {
			var dest = {
				foo: "bar"
			};
			var source = {
				foo: "baz",
				bar: "buz"
			};

			_.defaults(dest, source);

			expect(dest.foo).toEqual("bar");
			expect(dest.bar).toEqual("buz");
		});

		it("has an extend option that copies properties from one object to another overriding duplicates", function() {
			var dest = {
				foo: "bar"
			};
			var source = {
				foo: "baz",
				bar: "buz"
			};

			_.extend(dest, source);

			expect(dest.foo).toEqual("baz");
			expect(dest.bar).toEqual("buz");
		});

		it("has a pairs function that takes an object and rips it to a two dimensional array", function() {
			var obj = {
				foo: "bar",
				bar: "buz"
			};
			var arr = _.pairs(obj);

			expect(arr.length).toEqual(2);
			expect(_.isArray(arr[0])).toBeTruthy();
			expect(arr[0][0]).toEqual("foo");
			expect(arr[0][1]).toEqual("bar");
			expect(arr[1][0]).toEqual("bar");
			expect(arr[1][1]).toEqual("buz");
			expect(arr[1][1]).toEqual("buz");
		});

	});

	describe("has a diff function that is awesome", function(){
		it("should tell me that there were no diffs if the same thing was passed", function() {
			var a = ["entities:andrew", "entities:jmorris"];

			var ret = _.diffValues(a, a);

			expect(ret.removed.length).toEqual(0);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(0);
		});

		it("should tell me that some items were removed in an array", function() {
			var a = ["entities:andrew", "entities:jmorris"];
			var b = ["entities:andrew"];

			var ret = _.diffValues(a, b);

			expect(ret.removed.length).toEqual(1);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(0);
		});

		it("should tell me that nothing changed if values are the same but order is different", function() {
			var a = ["entities:jmorris", "entities:andrew"];
			var b = ["entities:andrew", "entities:jmorris"];

			var ret = _.diffValues(a, b);

			expect(ret.removed.length).toEqual(0);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(0);
		});

		it("should tell me that some items were removed in an array", function() {
			var a = ["entities:andrew", "entities:jmorris"];
			var b = ["entities:andrew"];

			var ret = _.diffValues(a, b);

			expect(ret.removed.length).toEqual(1);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(0);
		});

		it("should tell me that some items were removed in an object", function() {
			var a = {"Blarg": "bazz", "foo": {"cheese": "asiago"}};
			var b = {"Blarg": "bing", "test": {"cheese": "cheddar"}};

			var ret = _.diffValues(a, b);

			expect(ret.objectChange.Blarg.diff.from.value).toEqual("bazz");
			expect(ret.objectChange.Blarg.diff.to.value).toEqual("bing");

			expect(ret.objectChange.foo.diff.from.value.cheese).toEqual("asiago");
			expect(ret.objectChange.foo.diff.to.value).toEqual(undefined);

			expect(ret.objectChange.test.diff.from.value).toEqual(undefined);
			expect(ret.objectChange.test.diff.to.value.cheese).toEqual("cheddar");
		});

		it("should tell me that nothing changed for the same object", function() {
			var a = {"Blarg": "bazz", "bool": true, "otherBool": false, "foo": {"cheese": "asiago"}};

			var ret = _.diffValues(a, a);

			expect(ret.objectChange).toEqual({});
		});

		it("should tell me that some items were added", function() {
			var a = ["entities:andrew"];
			var b = ["entities:andrew", "entities:jmorris"];

			var ret = _.diffValues(a, b);

			expect(ret.removed.length).toEqual(0);
			expect(ret.added.length).toEqual(1);
			expect(ret.changed.length).toEqual(0);
		});

		xit("should tell me things were removed when order matters", function() {
			var a = ["entities:andrew", "entities:jmorris"];
			var b = ["entities:andrew"];

			var ret = _.diffValues(a, b, {arrayOrderMatters: true});

			expect(ret.removed.length).toEqual(1);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(0);
		});

		xit("should tell me things were added when order matters", function() {
			var a = ["entities:andrew"];
			var b = ["entities:andrew", "entities:jmorris"];

			var ret = _.diffValues(a, b, {arrayOrderMatters: true});

			expect(ret.removed.length).toEqual(0);
			expect(ret.added.length).toEqual(1);
			expect(ret.changed.length).toEqual(0);
		});

		xit("should tell me things were changed when order matters", function() {
			var b = ["entities:andrew", "entities:jmorris"];
			var a = ["entities:jmorris", "entities:andrew"];

			var ret = _.diffValues(a, b, {arrayOrderMatters: true});

			expect(ret.removed.length).toEqual(0);
			expect(ret.added.length).toEqual(0);
			expect(ret.changed.length).toEqual(2);
		});
	});


	describe("has an isEqual function that compares two values to see if they're qualitatively (softly) equal", function(){
		it("should work with strings", function() {
			expect(_.isEqual("foo", "foo")).toEqual(true);
			expect(_.isEqual("foo", "bar")).toEqual(false);
		});

		it("should work with bools", function() {
			expect(_.isEqual(false, false)).toEqual(true);
			expect(_.isEqual(true, true)).toEqual(true);
			expect(_.isEqual(true, false)).toEqual(false);
			expect(_.isEqual(false, true)).toEqual(false);
		});

		it("should work with dates", function() {
			var date1 = new Date();
			var date2 = new Date(date1.getTime() - 1000);
			var date3 = new Date(date1.getTime());

			expect(_.isEqual(date1, date1)).toEqual(true);
			expect(_.isEqual(date1, date3)).toEqual(true);
			expect(_.isEqual(date1, date2)).toEqual(false);
			expect(_.isEqual(date3, date2)).toEqual(false);
		});

		it("should work with arrays", function() {
			var array1 = ["foo", "bar"];
			var array2 = ["foo", "bar"];
			var array3 = ["fing", "baz"];

			expect(_.isEqual(array1, array1)).toEqual(true);
			expect(_.isEqual(array1, array2)).toEqual(true);
			expect(_.isEqual(array1, array3)).toEqual(false);
			expect(_.isEqual(array3, array2)).toEqual(false);
		});

		it("should work with objects", function() {
			var obj1 = {foo:"bar", bing: {baz:"bur"}};
			var obj2 = {foo:"bar", bing: {baz:"bur"}};
			var obj3 = {foo:"bar", bing: {ber:"bur"}};

			expect(_.isEqual(obj1, obj1)).toEqual(true);
			expect(_.isEqual(obj1, obj2)).toEqual(true);
			expect(_.isEqual(obj1, obj3)).toEqual(false);
			expect(_.isEqual(obj2, obj3)).toEqual(false);
		});
	});

	describe("has dirty keys method that allows us to get the differences", function(){
		it("should work with strings", function() {

			var foo = {
				__v: 0,
				_id: 'presence:entities:jmorris',
				entity: 'entities:jmorris',
				lastModified: 1384295829941,
				createdDate: 1384292763705,
				interactions: { chat: { manuallySet: 2, code: 2 } },
				urn: 'presence:entities:jmorris',
				id: 'presence:entities:jmorris',
				ETag: undefined
			};

			var bar = {
				__v: 0,
				_id: 'presence:entities:jmorris',
				createdDate: "Tue Nov 12 2013 14:46:03 GMT-0700 (MST)",
				entity: 'entities:jmorris',
				interactions: { chat: { manuallySet: 1, code: 1 } },
				lastModified: "Tue Nov 12 2013 15:34:25 GMT-0700 (MST)"
			};

			expect(_.dirtyKeys(foo, foo)).toEqual([]);
			expect(Object.keys(_.dirtyKeys(foo, bar))).toEqual(["lastModified", "createdDate", "interactions", "urn", "id", "ETag"]);
		});
	});

	describe("has isDirtyEquals method that allows us to see if there are any differences", function(){
		it("should work with arrays inside objects", function() {
			var initial = {
				"__v":0,
				"_id":"nodes:3963",
				"company":"company:jive",
				"createdDate":"2013-12-09T15:35:12.430Z",
				"entity":"entities:jivetesting10",
				"lastModified":"2013-12-09T15:35:13.774Z",
				"location":[0,0],
				"type":"Android"
			};

			var modified = {
				"__v":0,
				"_id":"nodes:3963",
				"entity":"entities:jivetesting10",
				"lastModified":1386603314821,
				"type":"Android",
				"createdDate":1386603312430,
				"company":"company:jive",
				"location":[85,1386603314825],
				"urn":"nodes:3963",
				"id":"nodes:3963"
			};


			expect(_.isDirtyEqual(initial, _.clone(initial))).toEqual(true);
			expect(_.isDirtyEqual(initial, modified, ['location'])).toEqual(false);
		});

		it("should work with undefineds inside objects", function() {

			var initial = {
				"__v":0,
				"test": undefined,
				"_id":"nodes:3963",
				"company":"company:jive",
				"createdDate":"2013-12-09T15:35:12.430Z",
				"entity":"entities:jivetesting10",
				"lastModified":"2013-12-09T15:35:13.774Z",
				"location":[0,0],
				"type":"Android"
			};

			var modified = {
				"__v":0,
				"_id":"nodes:3963",
				"entity":"entities:jivetesting10",
				"lastModified":1386603314821,
				"type":"Android",
				"createdDate":1386603312430,
				"company":"company:jive",
				"location":[85,1386603314825],
				"urn":"nodes:3963",
				"id":"nodes:3963"
			};

			expect(_.isDirtyEqual(initial, _.clone(initial))).toEqual(true);
			expect(_.isDirtyEqual(initial, modified)).toEqual(false);
			expect(_.isDirtyEqual(initial, modified, ['test'], {ignoreKeys: true})).toEqual(true);
		});

		it("should work with undefineds inside objects", function() {

			var initial ={
				__v: 2,
				_id: 'conversations:1505',
				lastModified: 1391722102270,
				createdDate: 1391722079649,
				metas: [
					'meta:conversations:1505:entities:jivetesting10@gmail.com',
					'meta:conversations:1505:entities:jmorris'
				],
				entries: [ 'conversations:1505:entries:1515' ],
				entities: [ 'entities:jivetesting10@gmail.com', 'entities:jmorris' ],
				urn: 'conversations:1505',
				id: 'conversations:1505',
				name: undefined,
				ETag: undefined
			};

			var modified = {
				__v: 1,
				_id: 'conversations:1505',
				createdDate: "Thu Feb 06 2014 14:27:59 GMT-0700 (MST)",
				entities: [ 'entities:jivetesting10@gmail.com', 'entities:jmorris' ],
				entries: [],
				lastModified: "Thu Feb 06 2014 14:27:59 GMT-0700 (MST)",
				metas: [
					'meta:conversations:1505:entities:jivetesting10@gmail.com',
					'meta:conversations:1505:entities:jmorris'
				],
			};

			expect(_.isDirtyEqual(initial, _.clone(initial))).toEqual(true);
			expect(_.isDirtyEqual(initial, modified)).toEqual(false);
			expect(_.isDirtyEqual(initial, modified, ['group'], {ignoreKeys: true})).toEqual(true);
		});
	});

	describe("indexBy takes an array and a path and converts it into an object", function(){
		it("should return an object", function() {
			var test = [
				{
					test2: 1,
					test: {
						test3: 1
					},
					test4: "outer cheese 1"
				},
				{
					test2: 2,
					test: {
						test3: 2
					},
					test4: "outer cheese 2"
				},
				{
					test2: "tester",
					test: {
						test3: "tester"
					},
					test4: "outer cheese tester"
				}
			];

			var ret = _.indexBy(test, "test2");

			expect(JSON.stringify(ret)).toEqual('{"1":{"test2":1,"test":{"test3":1},"test4":"outer cheese 1"},"2":{"test2":2,"test":{"test3":2},"test4":"outer cheese 2"},"tester":{"test2":"tester","test":{"test3":"tester"},"test4":"outer cheese tester"}}');
		});
	});

	describe("has a function that determines if an object is a date or not", function() {
		it("should work with a new date", function() {
			var date = new Date();

			expect(_.isDate(date)).toEqual(true);
		});

		it("should work with a new date that was inited to the past", function() {
			var date = new Date("2013-10-12T09:07:24.594Z");

			expect(_.isDate(date)).toEqual(true);
		});

		it("shouldn't work with a string that looks like a date", function() {
			var date = "2013-10-12 09:07:11";

			expect(_.isDate(date)).toEqual(false);
		});
	});

	describe("has a function that prettifies dates", function(){
		var now = new Date();
		it("should not ignore seconds", function() {
			var date = new Date(now.getTime() + 8000); // eight seconds in the "future";
			var seconds = _.viewHelpers.prettifyDate(now, date);

			expect(seconds).toEqual("8s");
		});

		it("should give back minutes", function() {
			var date = new Date(now.getTime() + (5 * 60 * 1000)); // five minutes in the "future";
			var minutes = _.viewHelpers.prettifyDate(now, date);

			expect(minutes).toEqual("5m");
		});

		it("should give back minutes and seconds if less then 10 minutes", function() {
			var date = new Date(now.getTime() + (5 * 60 * 1000) + (10 * 1000)); // five minutes and ten seconds in the "future";
			var minutes = _.viewHelpers.prettifyDate(now, date);

			expect(minutes).toEqual("5m 10s");

			date = new Date(now.getTime() + (10 * 60 * 1000) + (10 * 1000)); // ten minutes and ten seconds in the "future";
			minutes = _.viewHelpers.prettifyDate(now, date);

			expect(minutes).toEqual("10m");
		});

		it("should give back hours and minutes", function() {
			var date = new Date(now.getTime() + ((8 * 60 * 60 * 1000) + (10 * 60 * 1000))); // eight hours and ten minutes in the "future";
			var hours = _.viewHelpers.prettifyDate(now, date);

			expect(hours).toEqual("8hr 10m");
		});

		it("should give back days and hours", function() {
			var date = new Date(now.getTime() + (30 * 60 * 60 * 1000)); // thirty hours in the "future";
			var days = _.viewHelpers.prettifyDate(now, date);

			expect(days).toEqual("1d 6hr");
		});
	});

	describe("has a function that formats dates", function(){
		it("should return the correct format", function() {
			var date = new Date("2013-10-12T15:07:24.594Z");

			var ret = _.viewHelpers.formatTime("%l:%M %p", date, true);

			expect(ret).toEqual("3:07 PM");
		});

		it("should default to now", function() {
			var date = new Date();

			var ret = _.viewHelpers.formatTime("%l:%M %p");

			expect(ret).toNotEqual(null);
		});
	});

	describe("has a function that can round and pad numbers and", function(){
		it("should round numbers down", function() {
			var ret = _.viewHelpers.roundAndPad(120.123456, 1, 0, 'ceil');

			expect(ret).toEqual("120.2");
		});

		it("should pad numbers with 0's", function(){
			var ret = _.viewHelpers.roundAndPad(120, 0, 2, 'ceil');

			expect(ret).toEqual("120.00");
		});

		it("should be able to accept 'ceil' and alter return value appropriately", function(){
			var ret = _.viewHelpers.roundAndPad(120.01, 0, 0, 'ceil');

			expect(ret).toEqual("121");
		});

		it("should be able to accept 'floor' and alter return value appropriately", function(){
			var ret = _.viewHelpers.roundAndPad(120.01, 0, 0, 'floor');

			expect(ret).toEqual("120");
		});

		it("should return 0 for undefineds and NaNs", function() {
			var ret = _.viewHelpers.roundAndPad(undefined, 1, 1, 'round');
			expect(ret).toEqual("0.0");

			ret = _.viewHelpers.roundAndPad(NaN, 1, 1, 'round');
			expect(ret).toEqual("0.0");
		});
	});

	describe("has a function that takes a length and turns it into something like HH:MM:SS format", function(){
		it("should default to zero for wonky inputs", function() {
			var formatted = _.viewHelpers.formatDuration(0);
			expect(formatted).toEqual("0:00");

			formatted = _.viewHelpers.formatDuration(-1);
			expect(formatted).toEqual("0:00");

			formatted = _.viewHelpers.formatDuration(undefined);
			expect(formatted).toEqual("0:00");

			formatted = _.viewHelpers.formatDuration();
			expect(formatted).toEqual("0:00");

			formatted = _.viewHelpers.formatDuration("10");
			expect(formatted).toEqual("0:10");

			formatted = _.viewHelpers.formatDuration("This is not a number");
			expect(formatted).toEqual("0:00");
		});

		it("should work for just a second or two", function() {
			var formatted = _.viewHelpers.formatDuration(1);
			expect(formatted).toEqual("0:01");

			formatted = _.viewHelpers.formatDuration(10);
			expect(formatted).toEqual("0:10");
		});

		it("should work for a minute", function() {
			var formatted = _.viewHelpers.formatDuration(59);
			expect(formatted).toEqual("0:59");

			formatted = _.viewHelpers.formatDuration(60);
			expect(formatted).toEqual("1:00");
		});

		it("should work for 10 minutes", function() {
			var formatted = _.viewHelpers.formatDuration((60 * 10) - 1);
			expect(formatted).toEqual("9:59");

			formatted = _.viewHelpers.formatDuration((60 * 10));
			expect(formatted).toEqual("10:00");
		});

		it("should work for 60 minutes", function() {
			var formatted = _.viewHelpers.formatDuration((60 * 60) - 1);
			expect(formatted).toEqual("59:59");

			formatted = _.viewHelpers.formatDuration((60 * 60));
			expect(formatted).toEqual("60:00");

			formatted = _.viewHelpers.formatDuration((60 * 60) - 1, {hours: true});
			expect(formatted).toEqual("59:59");

			formatted = _.viewHelpers.formatDuration((60 * 60), {hours: true});
			expect(formatted).toEqual("01:00:00");
		});

		it("should work for 24 hours", function() {
			formatted = _.viewHelpers.formatDuration((60 * 60 * 24) - 1);
			expect(formatted).toEqual("1439:59");

			formatted = _.viewHelpers.formatDuration((60 * 60 * 24));
			expect(formatted).toEqual("1440:00");

			var formatted = _.viewHelpers.formatDuration((60 * 60 * 24) - 1, {hours: true, days: true});
			expect(formatted).toEqual("23:59:59");

			formatted = _.viewHelpers.formatDuration((60 * 60 * 24), {hours: true, days: true});
			expect(formatted).toEqual("01:00:00:00");
		});
	});

	describe("textToDate function", function() {
		var now = new Date(Date.UTC(2012, 0, 1, 1, 1));

		it("should be able to calculate today", function() {
			var ret = _.textToDate("today", now);

			expect(ret.start).toEqual(1325376000000);
			expect(ret.stop).toEqual(1325462399999);
		});

		it("should be able to calculate yesterday", function() {
			var ret = _.textToDate("yesterday", now);

			expect(ret.start).toEqual(1325289600000);
			expect(ret.stop).toEqual(1325375999999);
		});

		it("should be able to calculate the last n days", function() {
			var ret = _.textToDate("lastDays1", now);

			expect(ret.start).toEqual(1325289600000);
			expect(ret.stop).toEqual(1325462399999);

			ret = _.textToDate("lastDays3", now);

			expect(ret.start).toEqual(1325116800000);
			expect(ret.stop).toEqual(1325462399999);
		});

		it("should be able to calculate the last week", function() {
			var ret = _.textToDate("lastWeek", now);

			expect(ret.start).toEqual(1324771200000);
			expect(ret.stop).toEqual(1325375999999);
		});

		it("should be able to calculate the last month", function() {
			var ret = _.textToDate("lastMonth", now);

			expect(ret.start).toEqual(1322697600000);
			expect(ret.stop).toEqual(1325375999999);
		});

		it("should be able to calculate the last 3 months", function() {
			var ret = _.textToDate("lastMonth3", now);

			expect(ret.start).toEqual(1317427200000);
			expect(ret.stop).toEqual(1325375999999);
		});

		it("should be able to calculate the last year", function() {
			var ret = _.textToDate("lastYear", now);

			expect(ret.start).toEqual(1293840000000);
			expect(ret.stop).toEqual(1325375999999);
		});
	});

});
