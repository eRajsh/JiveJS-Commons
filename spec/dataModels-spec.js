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
	it("sets up a global constructor _.newModel", function() {
		expect(_.newModel).not.toEqual(undefined);
		expect(_.newModel).toBeTruthy();
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
			refs: {}
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
				parent: {type: "urn"}
			},
			keys: {}
		};

		describe("it has a query function", function() {
			var Collection = _.newModel.create(collectionSchema);
			var collection = new Collection();
			collection.entries = [];

			var Model = _.newModel.create(modelSchema);

			for(var i = 0; i < 1001; i++) {
				collection.entries.push(new Model({name: i, presence: { chat: { code: (i % 4)}}}));
			}

			it("can be limited", function() {
				var results = collection.query({
					limit: 20
				});

				expect(results.length).toEqual(20);
				expect(results[0].toJSON()).toEqual({name: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[19].toJSON()).toEqual({name: 19, presence: { chat: { code: (19 % 4) }}});
			});

			it("can be offsetted", function(){
				var results = collection.query({
					limit: 5,
					offset: 5
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({name: 5, presence: { chat: { code: (5 % 4) }}});
				expect(results[4].toJSON()).toEqual({name: 9, presence: { chat: { code: (9 % 4) }}});
			});

			it("can be ordered-by", function(){
				var results = collection.query({
					limit: 5,
					order: {
						"presence.chat.code": "asc",
						"name": "asc"
					}
				});

				expect(results.length).toEqual(5);
				expect(results[0].toJSON()).toEqual({name: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({name: 4, presence: { chat: { code: (4 % 4) }}});
			});

			it("has dot notation for accessing shit", function(){
				var results = collection.query({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(results.length).toEqual(251);
				expect(results[0].toJSON()).toEqual({name: 0, presence: { chat: { code: (0 % 4) }}});
				expect(results[1].toJSON()).toEqual({name: 4, presence: { chat: { code: (4 % 4) }}});
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

			it("has a queryOne that returns an object", function(){
				var result = collection.queryOne({
					filter: {
						"presence.chat.code": 0
					}
				});

				expect(result.toJSON()).toEqual({name: 0, presence: { chat: { code: (0 % 4) }}});
			});

		});

		describe("it has a query function that works for models with collections in them", function() {
			it("can query its stuff as well using a 'key'", function() {
				var schema = _.clone(modelSchema, true);
				schema.keys.entities = { type: "array" };

				var Model = _.newModel.create(schema);
				var model = new Model();

				for(var i = 0; i < 5; i++) {
					model.entities.push(new Model({ name: i }));
				}

				var results = model.query({
					key: "entities",
					filter: {
						"name": 0
					}
				});

				expect(results[0].toJSON()).toEqual({name: 0, entities: []});
			});
		});

	});
	
	
});


