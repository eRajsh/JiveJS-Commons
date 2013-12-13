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
			keys: {},
			virtuals: {
				presenceBool: {
					getter: function(args, scope) {
						if(scope.presence.chat.code !== 0) {
							return true;
						}

						return false;
					}
				}
			}
		};

		describe("it has a query function", function() {
			var Collection = _.Model.create(collectionSchema);
			var collection = new Collection();

			var Model = _.Model.create(modelSchema);

			for(var i = 0; i < 1001; i++) {
				collection.entries.push(new Model({urn: "test:" + i, presence: { chat: { code: (i % 4)}}}));
			}

			it("can be limited", function() {
				var results = collection.query({
					limit: 20
				});

				expect(results.length).toEqual(20);
				expect(results[0].toJSON()).toEqual({urn: "test:0", presence: { chat: { code: (0 % 4) }}});
				expect(results[19].toJSON()).toEqual({urn: "test:19", presence: { chat: { code: (19 % 4) }}});
			});

			it("can be offsetted", function(){
				var results = collection.query({
					limit: 5,
					offset: 5
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({urn: "test:5", presence: { chat: { code: (5 % 4) }}});
				expect(results[4].toJSON()).toEqual({urn: "test:9", presence: { chat: { code: (9 % 4) }}});
			});

			it("can be ordered-by", function(){
				var Collection = _.Model.create(collectionSchema);
				var collection = new Collection();

				var Model = _.Model.create(modelSchema);

				collection.entries.push(new Model({urn: "testOrder:" + 1, order1: 5, order2: 1}));				
				collection.entries.push(new Model({urn: "testOrder:" + 2, order1: 5, order2: 2}));
				collection.entries.push(new Model({urn: "testOrder:" + 3, order1: 2, order2: 1}));
				collection.entries.push(new Model({urn: "testOrder:" + 4, order1: 1, order2: 1}));
				collection.entries.push(new Model({urn: "testOrder:" + 5, order1: 3, order2: 1}));

				var results = collection.query({
					order: [
						{
							key: "order1", 
							order: "asc"
						},
						{
							key: "order2",
							order: "asc"
						}
					]
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({urn: "testOrder:4", order1: 1, order2: 1});
				expect(results[3].toJSON()).toEqual({urn: "testOrder:1", order1: 5, order2: 1});
				expect(results[4].toJSON()).toEqual({urn: "testOrder:2", order1: 5, order2: 2});
			});

			it("has dot notation for accessing shit", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(results.length).toEqual(251);
				expect(results[0].toJSON()).toEqual({urn: "test:0", presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({urn: "test:4", presence: { chat: { code: (4 % 4) }}});
			});

			it("has dot notation for accessing shit that accepts regexps", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": /0|1/
					}
				});

				expect(results.length).toEqual(501);
				expect(results[0].toJSON()).toEqual({urn: "test:0", presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({urn: "test:1", presence: { chat: { code: (1 % 4) }}});
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
						$in: {
							entities: [0]
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
						$all: {
							entities: [0, 8]
						}
					}
				});

				expect(results.length).toEqual(1);
				expect(results[0].toJSON()).toEqual({urn: "test3:8", entities: [0, 8]});
			});

			it("can select only specific fields", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": 0
					},
					select: ["presence.chat.code"]
				});

				expect(results.length).toEqual(251);
				expect(results[0]).toEqual({presence: { chat: { code: (0 % 4) }}});
				expect(results[1]).toEqual({presence: { chat: { code: (4 % 4) }}});
			});

			it("has virtual fields that can be used in the filter and select", function(){
				var results = collection.query({
					filter: {
						"presenceBool": true
					},
					select: ["urn", "presenceBool"]
				});

				expect(results.length).toEqual(750);
				expect(results[0]).toEqual({urn: "test:1", presenceBool: true});
				expect(results[1]).toEqual({urn: "test:2", presenceBool: true});
			});

			it("has a queryOne that returns an object", function(){
				var result = collection.queryOne({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(result.toJSON()).toEqual({urn: "test:0", presence: { chat: { code: (0 % 4) }}});
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

	});
	
	
});


