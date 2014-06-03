# Data Models
The data models library is a library for emulating things such as Mongoose. It's a great way to store, fetch, update, remove, search, and subscribe to data changes on data.

## Creating a new Model
When constructing a new model, a `schema` must be passed to the `_.Model.create(schema)` function. This create function returns a new `Model` class that can be `newed` up.

The schema has the following keys:

- `name` The name is the name of the model. This is where the model will be put in `_.Model.getCollections()`. *Behavior is undefined if two models share a name!*
- `store` An object that controls where data is fetched from and stored to. Options are:
	- `remote` A path to the place URNs/IDs can be looked up at. If set to `false`, HTTP getting/posting/patching will be disabled.
	- `localStorage` A URN pattern with which to store items under in the browser's storage. If set to `false`, local storage getting/posting/patching will be disabled.
- `urn` A URN pattern that describes what URNs this model controls. If two models overlap on URNs, behavior is currently undefined.
- `rootUrn` If the URN for getting all available data is different than the URN for model getting, set the rootUrn.
- `subscriptions` An array consisting of URNs to subscribe via WebSocket to.
- `vms` Short for "view models". Essentially a `vm` is a subset (or superset) of fields that are passed to HTML templates. Each key in the `vms` key is the name of the view model. That key should then have a value of fields. Those fields can be virtuals (we'll get to those soon), real attributes, subsets on referenced properties, or other such things.
- `virtuals` An object that can be used to create attributes that only exist in memory and for only a short period. To create a virtual, simply create an object like so:
	```
	_.Model.create({
		...,
		virtuals: {
			fullName: {
				getter: function(args, scope) {
					scope = scope || this;

					return scope.name.first + " " + scope.name.last;
				}
			}
		}
	});
	```
	Setters don't currently do anything, I don't think.
- `keys` An object containing keys to update when an event comes down the websocket. If an event comes down containing data keys not in the `keys` object those pieces of data are not updated. If only non-keyed data comes in the update, no `changed` or `patched` or `putted` events will ever occur.
- `refs` An object containing keys and data about references to other Data Modeled objects. Generally, these refrence keys point to URN data. I.e. you have a model with `entity: "entities:jmorris"`. In your schema you would have `refs: {entity: {type: "urn"}}`. Instead of the root level being a single instance, it can also be an array. I.e. you have a model with `entities: ["entities:entity1", "entities:entity2"]` your schema would likely have `refs: {entities: [{type: "urn"}]}`. Notice that the entities value is an array in both sections.

That pretty much covers schema definition and usage for now.


## Getting data
You can fetch data from the server by doing `_.Model.getCollections().{{collectionName}}.collection.get()`. This will resolve the returned promise when it is done.

## Searching through data
From hence forth `Collection` equals `_.Model.getCollections().{{collectionName}}.collection`. It also has been fetched from the server or initialized with data.

You can search entries by using `query` (aka `find`) and `queryOne` (aka `findOne`). `query` and `queryOne` both accept the same arguments with `queryOne` only returning a singular Model instance instead of an array of potentially multiple Model instances.

### `Collection.query([args])`
`query` takes a set of Model instances (or just plain objects, it's not picky) and filters/sorts/subselects/etc. data.

- `args` An object containing data about how/what to filter/sort/etc.
```
// TODO
```
