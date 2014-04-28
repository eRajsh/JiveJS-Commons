if(!_ && typeof require === "function") {
	GLOBAL.self = {
		Jive: {
			Jazz: {}
		}
	};

	var _ = require('../jive.js');

	self.Jive.Jazz = new _.Fabric();
}

describe("dataModels.js is an awesome library that fulfills our needs of a much less shitty dataModels", function() {
	it("sets up a global constructor _.Model", function() {
		expect(_.Model).not.toEqual(undefined);
		expect(_.Model).toBeTruthy();
	});

	describe("it is constructed with a schema and is awesome", function() {
		var collectionSchema = {
			name: "Presences",
			store: {
				localStorage: "test",
				remote: "/urn/"
			},
			urn: "test",
			vms: {
				default: "*"
			},
			refs: {
				"entries": [{type: "urn"}]
			}
		};

		var modelSchema = {
			name: "test",
			store: {
				localStorage: "test:*",
				remote: "/urn/"
			},
			urn: "test:*",
			vms: {
				default: "*",
				chat: [
					"interactions.chat"
				],
			},
			refs: {
			},
			keys: {}
		};

		describe("it has a query function", function() {
			var Collection = _.Model.create(collectionSchema);
			var collection = new Collection();

			var Model = _.Model.create(modelSchema);

			for(var i = 0; i < 1001; i++) {
				collection.entries.push(new Model({urn: "test:" + i, i: i, presence: { chat: { code: (i % 4)}}}));
			}

			it("can be limited", function() {
				var results = collection.query({
					limit: 20
				});

				expect(results.length).toEqual(20);
				expect(results[0].toJSON()).toEqual({urn: "test:0", i: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[19].toJSON()).toEqual({urn: "test:19", i: 19, presence: { chat: { code: (19 % 4) }}});
			});

			it("can be offsetted", function(){
				var results = collection.query({
					limit: 5,
					offset: 5
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({urn: "test:5", i: 5, presence: { chat: { code: (5 % 4) }}});
				expect(results[4].toJSON()).toEqual({urn: "test:9", i: 9, presence: { chat: { code: (9 % 4) }}});
			});

			it("can be ordered-by", function(){
				var results = collection.query({
					limit: 5,
					order: [
						{"key": "presence.chat.code", "order": "asc"},
						{"key": "i", "order": "asc"}
					]
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({urn: "test:0", i: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({urn: "test:4", i: 4, presence: { chat: { code: (4 % 4) }}});
			});

			it("has dot notation for accessing shit", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(results.length).toEqual(251);
				expect(results[0].toJSON()).toEqual({urn: "test:0", i: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({urn: "test:4", i: 4, presence: { chat: { code: (4 % 4) }}});
			});

			it("has dot notation for accessing shit that accepts regexps", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": /0|1/
					}
				});

				expect(results.length).toEqual(501);
				expect(results[0].toJSON()).toEqual({urn: "test:0", i: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({urn: "test:1", i: 1, presence: { chat: { code: (1 % 4) }}});
			});

			it("has the ability to find URNs or Objects", function(){
				var collection;

				runs(function() {
					var Model = _.Model.create({
						name: "testUrnRef",
						store: {
							localStorage: false,
							remote: false,
						},
						urn: "testUrnRef:*",
						vms: {
							default: "*"
						},
						refs: {
							entity: {type: "urn"}
						},
						keys: {}
					});

					collection = _.Model.getCollections().testUrnRef.collection;

					collection.entries.push(new Model({urn: "testRefUrn:0", entity: "test:0"}));
				});

				waitsFor(function() {
					return collection.entries[0]._options.inited.state() === 1;
				}, 1000);

				runs(function() {
					var results = collection.query({
						filter: {
							entity: "test:0"
						}
					});

					expect(results.length).toEqual(1);
					expect(results[0].urn).toEqual("testRefUrn:0");
					expect(_.isObject(results[0].entity)).toEqual(true);

					results = collection.query({
						filter: {
							"entity.urn": "test:0"
						}
					});

					expect(results.length).toEqual(1);
					expect(results[0].urn).toEqual("testRefUrn:0");
				});
			});

			it("will chain view models (vm's) along down the chain", function(){
				var collection;

				runs(function() {
					var schema = _.clone(modelSchema, true);
					schema.name = "testNestedToVM";
					schema.urn = "testNestedToVM:*";
					schema.vms = {
						default: ["*"],
						foobar: ["*", "foobar"]
					};
					schema.virtuals = {
						foobar: {
							getter: function(args, scope){
								return "im a little virtual short and stout";
							}
						}
					};
					var VirtualizedModel = _.Model.create(schema);
					
					_.Model.getCollections().testNestedToVM.collection.entries.push(new VirtualizedModel({urn: "testNestedToVM:0"}));

					var Model = _.Model.create({
						name: "testNestedToVM2",
						store: {
							localStorage: false,
							remote: false,
						},
						urn: "testNestedToVM2:*",
						vms: {
							default: "*",
							foobar: ["*"]
						},
						refs: {
							entities: [{type: "urn"}]
						},
						keys: {}
					});

					collection = _.Model.getCollections().testNestedToVM2.collection;

					collection.entries.push(new Model({urn: "testNestedToVM2:0", entities: ["testNestedToVM:0"]}));
				});

				waitsFor(function() {
					return collection.entries[0]._options.inited.state() === 1;
				}, 1000);

				runs(function() {
					var results = collection.query({vm: "default"});

					expect(results.length).toEqual(1);
					expect(results[0].entities[0].foobar).toEqual(undefined);

					results = collection.query({vm: "foobar"});

					expect(results.length).toEqual(1);
					expect(results[0].entities[0].foobar).toEqual("im a little virtual short and stout");
				});
			});

			it("has $lt, $gt, $lte, $gte, $between, and $betweene functionality for querying", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				for(var i = 0; i < 1001; i++) {
					collection.entries.push({
						test: i
					});
				}

				var results = collection.query({
					filter: {
						test: {
							$lt: 10
						}
					}
				});

				expect(results.length).toEqual(10);
				expect(results[0]).toEqual({test: 0});
				expect(results[1]).toEqual({test: 1});

				results = collection.query({
					filter: {
						test: {
							$gt: 990
						}
					}
				});

				expect(results.length).toEqual(10);
				expect(results[0]).toEqual({test: 991});
				expect(results[1]).toEqual({test: 992});

				results = collection.query({
					filter: {
						test: {
							$lte: 10
						}
					}
				});

				expect(results.length).toEqual(11);
				expect(results[0]).toEqual({test: 0});
				expect(results[1]).toEqual({test: 1});
				expect(results[10]).toEqual({test: 10});

				results = collection.query({
					filter: {
						test: {
							$gte: 990
						}
					}
				});

				expect(results.length).toEqual(11);
				expect(results[0]).toEqual({test: 990});
				expect(results[1]).toEqual({test: 991});
				expect(results[10]).toEqual({test: 1000});

				results = collection.query({
					filter: {
						test: {
							$btw: [500, 510]
						}
					}
				});

				expect(results.length).toEqual(9);
				expect(results[0]).toEqual({test: 501});
				expect(results[1]).toEqual({test: 502});
				expect(results[8]).toEqual({test: 509});

				results = collection.query({
					filter: {
						test: {
							$btwe: [500, 510]
						}
					}
				});

				expect(results.length).toEqual(11);
				expect(results[0]).toEqual({test: 500});
				expect(results[1]).toEqual({test: 501});
				expect(results[10]).toEqual({test: 510});
			});

			it("has a $search capability that searches for that key inside the value", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				for(var i = 0; i < 1001; i++) {
					collection.entries.push({
						test: "I'm a little tea " + i + " pot"
					});
				}

				var results = collection.query({
					filter: {
						test: {
							$search: "10"
						}
					}
				});

				expect(results.length).toEqual(21);
				expect(results[0]).toEqual({test: "I'm a little tea 10 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 100 pot"});

				collection = new Collection();

				for(var i = 0; i < 1001; i++) {
					collection.entries.push({
						test: i
					});
				}

				var results = collection.query({
					filter: {
						test: {
							$search: 10
						}
					}
				});

				expect(results.length).toEqual(21);
				expect(results[0]).toEqual({test: 10});
				expect(results[1]).toEqual({test: 100});
			});

			it("has a $alphaNumSearch capability that searches for the key inside the value stripping special characters and case sensitivity", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				for(var i = 0; i < 1001; i++) {
					collection.entries.push({
						test: "I'm a little tea " + i + " pot"
					});
				}

				var results = collection.query({
					filter: {
						test: {
							$alphaNumSearch: "1+0"
						}
					}
				});

				expect(results.length).toEqual(21);
				expect(results[0]).toEqual({test: "I'm a little tea 10 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 100 pot"});

				results = collection.query({
					filter: {
						test: {
							$alphaNumSearch: "im a little tea 1+0"
						}
					}
				});

				expect(results.length).toEqual(12);
				expect(results[0]).toEqual({test: "I'm a little tea 10 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 100 pot"});

				collection = new Collection();

				for(var i = 0; i < 1001; i++) {
					collection.entries.push({
						test: i
					});
				}

				results = collection.query({
					filter: {
						test: {
							$alphaNumSearch: 10
						}
					}
				});

				expect(results.length).toEqual(21);
				expect(results[0]).toEqual({test: 10});
				expect(results[1]).toEqual({test: 100});
			});

			it("has a $fuzzySearch capability that searches without regard for case inside the value only at the beginning and end of words", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				for(var i = 0; i < 11; i++) {
					collection.entries.push({
						test: "I'm a little tea " + i + " pot"
					});
				}

				var results = collection.query({
					filter: {
						test: {
							$fuzzySearch: "litt"
						}
					}
				});

				expect(results.length).toEqual(11);
				expect(results[0]).toEqual({test: "I'm a little tea 0 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 1 pot"});

				results = collection.query({
					filter: {
						test: {
							$fuzzySearch: "LITt"
						}
					}
				});

				expect(results.length).toEqual(11);
				expect(results[0]).toEqual({test: "I'm a little tea 0 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 1 pot"});

				results = collection.query({
					filter: {
						test: {
							$fuzzySearch: "0"
						}
					}
				});

				expect(results.length).toEqual(2);
				expect(results[0]).toEqual({test: "I'm a little tea 0 pot"});
				expect(results[1]).toEqual({test: "I'm a little tea 10 pot"});

				results = collection.query({
					filter: {
						test: {
							$fuzzySearch: "tt"
						}
					}
				});

				expect(results.length).toEqual(0);
			});

			it("has $in functionality for querying", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test2:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: {
						entities: {
							$in: [0]
						}
					}
				});

				expect(results.length).toEqual(251);
				expect(results[0].toJSON()).toEqual({urn: "test2:0", entities: [0, 0]});
				expect(results[1].toJSON()).toEqual({urn: "test2:4", entities: [0, 4]});
			});

			it("has $in functionality for querying when the key is a value not an array", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test2:" + i, entities: i % 4}));
				}

				var results = collection.query({
					filter: {
						entities: {
							$in: [0]
						}
					}
				});

				expect(results.length).toEqual(251);
				expect(results[0].toJSON()).toEqual({urn: "test2:0", entities: [0, 0]});
				expect(results[1].toJSON()).toEqual({urn: "test2:4", entities: [0, 4]});
			});

			it("has $all functionality for querying", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test3:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: {
						entities: {
							$all: [0, 8]
						}
					}
				});

				expect(results.length).toEqual(1);
				expect(results[0].toJSON()).toEqual({urn: "test3:8", entities: [0, 8]});
			});

			it("has $eq functionality for querying", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test3:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: {
						entities: {
							$eq: [1, 5]
						}
					}
				});

				expect(results.length).toEqual(1);
				expect(results[0].toJSON()).toEqual({urn: "test3:5", entities: [1, 5]});
			});

			it("has $neq functionality for querying", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test3:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: {
						entities: {
							$neq: [1, 5]
						}
					}
				});

				expect(results.length).toEqual(1000);
				expect(results[0].toJSON()).toEqual({urn: "test3:0", entities: [0, 0]});
			});

			it("the filter key can also be a function", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test3:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: function(scope) {
						expect(scope).toEqual(this);
						if(scope.urn === "test3:0") {
							return true;
						}

						return false;
					}
				});

				expect(results.length).toEqual(1);
				expect(results[0].toJSON()).toEqual({urn: "test3:0", entities: [0, 0]});
			});

			it("a specific key in the filter can be a function", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				for(var i = 0; i < 1001; i++) {
					collection.entries.push(new Model({urn: "test3:" + i, entities: [ i % 4, i ]}));
				}

				var results = collection.query({
					filter: {
						urn: function(val, scope) {
							expect(scope).toEqual(this);
							expect(val).toEqual(scope.urn);

							if(val === "test3:0") {
								return true;
							}

							return false;
						}
					}
				});

				expect(results.length).toEqual(1);
				expect(results[0].toJSON()).toEqual({urn: "test3:0", entities: [0, 0]});
			});

			it("can select only specific fields", function(){
				var results = collection.query({
					select: ["presence.chat.code"]
				});

				expect(results.length).toEqual(1001);
				expect(results[0]).toEqual({presence: { chat: { code: 0 }}});
				expect(results[1]).toEqual({presence: { chat: { code: 1 }}});
			});

			it("has a queryOne that returns an object", function(){
				var result = collection.queryOne({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(result.toJSON()).toEqual({urn: "test:0", i: 0, presence: { chat: { code: (0 % 4) }}});
			});

		});

		describe("virtual methods", function() {
			it("has a getter that can be accessed via toVM", function() {
				var schema = _.clone(modelSchema, true);
				schema.vms = {
					default: ["*", "foobar"]
				};
				schema.virtuals = {
					foobar: {
						getter: function(args, scope){
							return "im a little virtual short and stout";
						}
					}
				};

				var Model = _.Model.create(schema);
				var model = new Model();
				var vmed = model.toVM();

				expect(vmed.foobar).toEqual("im a little virtual short and stout");
			});
		});

		describe("it has a query function that works for models with collections in them", function() {
			it("can query its stuff as well using a 'key'", function() {
				var schema = _.clone(modelSchema, true);
				schema.keys.entities = { type: "array" };

				var Model = _.Model.create(schema);
				var model = new Model();

				for(var i = 0; i < 5; i++) {
					model.entities.push(new Model({ urn: "test4:" + i }));
				}

				var results = model.query({
					key: "entities",
					filter: {
						"urn": "test4:1"
					}
				});

				expect(results[0].toJSON()).toEqual({urn: "test4:1", entities: []});
			});
		});

		describe("it has a set function that updates", function() {
			it("can update a key and val by passing them in one-by-one", function() {
				var Model = _.Model.create(modelSchema);

				var model = new Model({urn: "test8:1", blah: "foobarcheese"});
				model.set("blah", "cheesyfoobars");

				expect(model.blah).toEqual("cheesyfoobars");
			});

			it("can bulk update by passing in an object", function() {
				var Model = _.Model.create(modelSchema);

				var model = new Model({urn: "test8:1", blah: "foobarcheese"});
				model.set({"blah": "cheesyfoobars", "cheese": "is the best"});

				expect(model.blah).toEqual("cheesyfoobars");
				expect(model.cheese).toEqual("is the best");
			});
		});
	});
});
