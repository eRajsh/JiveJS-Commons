(function() {
	"use strict";

	var urns = {};
	var collections = {};

	var isCollection = function(urn) {
		// A word or a pipe or parens
		if(!urn.match(/\:[*#]$/)) {
			return true;
		} else {
			return false;
		}
	};

	var findModel = function findModel(urn) {
		for(var key in urns) {
			if(urns[key].regex.exec(urn)) {
				return urns[key].model;
			}
		}
	};

	var findCollection = function findCollection(urn) {
		for(var key in collections) {
			if(collections[key].regex.exec(urn)) {
				return collections[key].collection;
			}
		}
	};

	var makeForModelDeferDfds = {};

	var getDeffered = function getDeffered(urn) {

		if(makeForModelDeferDfds[urn]) {
			return makeForModelDeferDfds[urn];
		} else {
			for(var key in makeForModelDeferDfds) {
				if(makeForModelDeferDfds[key].regex.exec(urn)) {
					return makeForModelDeferDfds[key];
				}
			}
		}

	};

	var makeAndGet = function makeAndGet(args, model, collection, dfd, given) {
		var instance = new model(args);

		if(!given) {
			instance.get().done(function() {
				dfd.resolve(instance);
			}).fail(function(e) {
				dfd.reject(e);
			});
		} else {
			collection.insert({entry: instance});

			dfd.resolve(instance);
		}
	};

	var makeForModel = function makeForModel(args, given) {
		var dfd = new _.Dfd();

		var collection = findCollection(args.urn);
		var model = findModel(args.urn);
		var instance;

		if(collection) {
			instance = collection.queryOne({ filter: { urn: args.urn }});
			if(typeof instance !== "undefined") {
				dfd.resolve(instance);
			} else {
				var alreadyWaiting = getDeffered(args.urn);
				if(alreadyWaiting) {
					alreadyWaiting.promise.done(function(){
						instance = collection.queryOne({ filter: { urn: args.urn }});

						if(instance) {
							dfd.resolve(instance);
						} else {
							makeAndGet(args, model, collection, dfd, given);
						}
					});
				} else {
					makeAndGet(args, model, collection, dfd, given);
				}
			}
		} else if(model) {
			makeAndGet(args, model, dfd, given);
		} else {
			dfd.reject("Couldn't find a model registered for " + args.urn);
		}

		return dfd.promise();
	};

	var populateRefs = function populateRefs(scope, args) {
		args = args || {};

		var dfd = new _.Dfd();

		var dfds = [true];

		for(var key in scope._options.refs) {
			(function(key) {
				var ref = scope._options.refs[key];

				if(_.isArray(ref)) {
					scope[key].forEach(function(item, i) {
						if(_.isNormalObject(item) && _.isUrn(item.urn) && !(scope[key] instanceof Model)) {
							var eachDfd = new _.Dfd();

							makeForModel(item, true).done(function(ret) {
								scope[key][i] = ret;
								eachDfd.resolve();
							});

							dfds.push(eachDfd);
						} else if(_.isUrn(item)) {
							var eachDfd = new _.Dfd();

							makeForModel({urn: item}).done(function(ret) {
								scope[key][i] = ret;
								eachDfd.resolve();
							});

							dfds.push(eachDfd);
						}
					});
				} else {
					if(_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn) && !(scope[key] instanceof Model)) {
						var eachDfd = new _.Dfd();

						makeForModel(scope[key], true).done(function(ret) {
							scope[key] = ret;
							eachDfd.resolve();
						});

						dfds.push(eachDfd);
					} else if(_.isUrn(scope[key])) {
						var eachDfd = new _.Dfd();

						makeForModel({urn: scope[key]}).done(function(ret) {
							scope[key] = ret;
							eachDfd.resolve();
						});

						dfds.push(eachDfd);
					}
				}
			})(key);
		}

		_.Dfd.when(dfds).always(function() {
			dfd.resolve(scope);
		});

		return dfd.promise();
	};

	var store = function store(args, scope) {
		var dfd = new _.Dfd();
		scope = scope || this;

		args.data = args.data || {};
		if(typeof args.remote === "undefined") {
			args.remote = true;
		}
		args.method = args.method.toUpperCase();

		if(scope._options.collection === true) {
			args.urn = args.urn || scope._options.urn;
		}

		if(typeof args === "undefined" || !args.method || !args.urn) {
			dfd.reject("Must Supply args object with method, url, and data");
			return dfd.promise();
		}

		if(scope._options.store.remote && args.remote) {
			// TODO: either use the TTL bit or we should set a "offline mode" flag somewhere that we check here
			if(args.method === "GET" && scope._options.store.localStorage && (scope._options._ttl && new Date().getTime() > scope._options._ttl)) {
				local(args, scope).done(function(ret) {
					dfd.resolve({data: ret, headers: {}, status: 200, local: true});
				}).fail(function(e) {
					dfd.reject(e);
				});

				if(args.method === "GET") {
					makeForModelDeferDfds[scope.urn] = {
						promise: dfd.promise(),
						regex: new RegExp(scope.urn)
					};
				}
			} else {
				if(args.method === "GET" && scope._options.collection === true) {
					makeForModelDeferDfds[scope._options.urn] = {
						promise: dfd.promise(),
						regex: collections[scope._options.name].regex
					};
				}

				ajax(args, scope).done(function(ret){
					if(args.method === "GET" && scope._options.collection === true) {

						// TODO: START HERE
						if(_.isArray(scope._options.subscriptions)) {
							for(var i = 0; i < scope._options.subscriptions.length; i++) {
								self.Jive.SessionBridge.subscribe({
									urn: scope._options.subscriptions[i],
									ETag: ret.data.ETag
								});
							}
						}
					}

					dfd.resolve(ret);
				}).fail(function(e) {
					dfd.reject(e);
				});
			}
		} else if(scope._options.store.localStorage) {
			local(args, scope).done(function(ret) {
				dfd.resolve(ret);
			}).fail(function(e) {
				dfd.reject(e);
			});
		} else {
			dfd.resolve(args.data);
		}

		return dfd.promise();
	};

	var local = function local(args, scope) {
		var urn = args.urn;

		if(scope._options.collection === true) {
			var urnArray = scope._options.store.localStorage.split(":");
			urnArray.splice(-1);
			urn = urnArray.join(":");
		}

		switch(args.method) {
			case "GET":
				return self.Jive.Store.get(urn, {json: true});
			break;

			case "POST":
				return self.Jive.Store.set(urn, args.data, {json: true});
			break;

			case "PUT":
				return self.Jive.Store.set(urn, args.data, {json: true});
			break;

			case "PATCH":
				var dfd = new _.Dfd();
				var xhr = self.Jive.Store.get(urn, {json: true});
				xhr.done(function(ret) {
					_.extend(ret, args.data);
					self.Jive.Store.set(urn, ret, {json: true}).done(function(ret) {
						dfd.resolve(ret);
					}).fail(function(e) {
						dfd.reject(e);
					});
				}).fail(function(e) {
					dfd.reject(e);
				});
				return dfd.promise();
			break;

			case "DELETE":
				return self.Jive.Store.remove(urn);
			break;

			case "HEAD":
				//TODO figure out meta storage as different from "data" storage
				var dfd = new _.Dfd();
				var xhr = self.Jive.Store.get(urn, {json: true});
				xhr.done(function(ret) {
					dfd.resolve({
						lastModified: ret.lastModified,
						eTag: ret.eTag,
						ttl: ret.ttl,
						expires: ret.expires
					})
				}).fail(function(e) {
					dfd.reject(e);
				});
				return dfd.promise();
			break;

			case "OPTIONS":
			default:
				var dfd = new _.Dfd();
				dfd.resolve();
				return dfd.promise();
			break;
		}
	}


	var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg;
	var parseHeaders = function(headers) {
		var responseHeaders = {};
		var match;
		while ( (match = rheaders.exec( headers )) ) {
			responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
		}

		return responseHeaders;
	};


	var ajax = function ajax(args, scope) {
		scope = scope || this;
		var dfd = new _.Dfd();

		var data = args.data || {};
		var urn = args.data.urn || args.urn;

		if((args.method == "POST" || args.method == "PUT" || args.method == "PATCH") && args.data) {
			data = JSON.stringify(data);
		} else if((args.method == "GET" || args.method == "DELETE") && args.data){
			urn += "?" + $.param(data);
		}

		var remote = scope._options.store.remote.replace(/\/$/g, "");

		$.ajax({
			url: remote + "/" + urn,
			beforeSend : function (xhr){
				xhr.setRequestHeader("Content-Type","application/json; charset=utf-8");
			},
			type: args.method,
			data: data,
			dataType: "json"
		}).done(function(data, status, jqXhr){
			dfd.resolve({
				data: data,
				status: jqXhr.status,
				headers: parseHeaders(jqXhr.getAllResponseHeaders())
			});
		}).fail(function(jqXhr, status, error){
			dfd.reject({
				e: error,
				status: jqXhr.status,
				headers: parseHeaders(jqXhr.getAllResponseHeaders())
			});
		});

		return dfd.promise();
	};

	var insertFunc = function insertFunc(args, scope) {
		scope = scope || this;
		args = args || {};

		if(args.entry) {
			var index = scope.entries.indexOf(args.entry.urn);
			if(index !== -1) {
				scope.entries[index] = args.entry;
			} else {
				scope.entries.push(args.entry);
			}

			store({ method: "POST", urn: args.entry.urn, data: args.entry._options.persisted, remote: false}, args.entry);

			scope._options.persisted = scope.toJSON();

			store({ method: "POST", urn: scope.urn, data: scope._options.persisted, remote: false}, scope);
		}
	};

	var eventFunc = function eventFunc(event, ret, scope) {
		scope = scope || this;

		var data = ret.data.body || ret.data;
		var toRet;

		if(scope._options.collection === true) {
			var model = findModel(data.urn);
			var collection = findCollection(data.urn);

			var instance = (typeof collection !== "undefined") ? collection.queryOne({filter: { urn: data.urn }}) : undefined;

			switch(event) {
				case "posted":
					if(typeof instance === "undefined" && model) {
						instance = new model(data);

						insertFunc({entry: instance}, collection);

						collection._options.persisted = collection.toJSON();
					} else {
						_.extend(instance, data);
					}
				break;

				case "putted":
					if(typeof instance !== "undefined") {
						for(var key in instance) {
							if(key !== "_options") {
								delete instance[key];
							}
						}
					}
				case "patched":
					if(typeof instance !== "undefined") {
						_.extend(instance, data);
					}
				break;
			}

			toRet = instance;
		} else {
			switch(event) {
				case "posted":
					var model = findModel(data.urn);
					var collection = findCollection(data.urn);

					var instance = (typeof collection !== "undefined") ? collection.queryOne({filter: { urn: data.urn }}) : scope;

					if(typeof instance === "undefined" && model) {
						instance = new model(data);

						if(collection) {
							insertFunc({entry: instance}, collection);
						}

						collection._options.persisted = collection.toJSON();
					} else {
						_.extend(instance, data);
					}

					toRet = instance;
				break;

				case "putted":
					if(typeof scope !== "undefined") {
						for(var key in scope) {
							if(key !== "_options") {
								delete scope[key];
							}
						}
					}
				case "patched":
					_.extend(scope, data);
				break;
			}

			toRet = scope;
		}

		toRet._options.inited.done(function() {
			toRet.dispatch({
				event: event,
				data: toRet
			});

			toRet.changed();
		});

		return toRet;
	};

	var deleteFunc = function deleteFunc(ret, scope) {
		scope = scope || this;

		for(var key in scope) {
			delete scope[key];
		}

		scope._options.subs.forEach(function(sub) {
			scope.off({sub: sub});
		});

		scope.dispatch({
			event: "deleted",
			data: args
		});

		scope.changed();
	};

	var doInitializeDefault = function doInitializeDefault(scope, key) {
		if(_.isFunction(scope._options.keys[key].default)) {
			scope[key] = scope._options.keys[key].default();
		} else {
			switch(scope._options.keys[key].type.toLowerCase()) {
				case "object":
					scope[key] = scope._options.keys[key].default || {};
				break;
				case "array":
					scope[key] = scope._options.keys[key].default || [];
				break;
				case "boolean":
					scope[key] = scope._options.keys[key].default || false;
				break;
				case "string":
					scope[key] = scope._options.keys[key].default || "";
				break;
				case "number":
					scope[key] = scope._options.keys[key].default || NaN;
				break;
				case "date":
					scope[key] = scope._options.keys[key].default || 0;
				break;
				case "regex":
					scope[key] = scope._options.keys[key].default || new Regex();
				break;
			}
		}
	};

	// We moved this into its own function because chrome was saying it couldn't optimize this bastard.
	var initializeForInForNotOptimized = function initializeForInForNotOptimized(args, scope) {

		for(var key in scope._options.refs) {
			if(_.isArray(scope._options.refs[key])) {
				scope[key] = scope[key] || [];
			} else {
				scope[key] = scope[key] || null;
			}
		}

		for(var key in scope._options.keys) {
			doInitializeDefault(scope, key);
		}

		for(var key in args) {
			scope[key] = args[key];
		}

	};

	var initialize = function initialize(args, scope) {
		scope = scope || this;
		args = args || {};

		if(scope._options.collection === true) {
			collections[scope._options.name] = {
				regex: _.createRegex({urn: scope._options.urn + ":*"}),
				collection: scope
			};

			if(_.isString(scope._options.rootUrn)) {
				scope.urn = scope._options.rootUrn;
			} else if(_.isString(scope._options.urn)) {
				scope.urn = scope._options.urn;
			}

			scope.insert = insertFunc.bind(scope);
		}

		initializeForInForNotOptimized(args, scope);

		scope._options.inited = populateRefs(scope);

		scope._options.subs = [];

		if(typeof self !== "undefined" && self.Jive && self.Jive.Jazz) {
			scope._options.pubsub = self.Jive.Jazz;
		} else {
			scope._options.pubsub = new _.Fabric();
		}

		if(typeof scope._options.subscriptions === "undefined") {
			scope._options.subscriptions = [
				scope.urn,
				scope.urn + ":#"
			];
		}

		scope._options.postFunc = eventFunc.bind(scope, "posted");
		scope._options.putFunc = eventFunc.bind(scope, "putted");
		scope._options.patchFunc = eventFunc.bind(scope, "patched");
		scope._options.deleteFunc = deleteFunc.bind(scope);

		scope._options.persisted = scope.toJSON();

		scope.on({event: "posted", session: true}).progress(function(ret) {
			scope._options.postFunc(ret);
		});

		scope.on({event: "putted", session: true}).progress(function(ret) {
			scope._options.putFunc({data: ret.data.body});
		});

		scope.on({event: "patched", session: true}).progress(function(ret) {
			scope._options.patchFunc({data: ret.data.body});
		});

		scope.on({event: "deleted", session: true}).progress(function(ret) {
			scope._options.deleteFunc();
		});
	};

	var Model = function(data, options) {
		var scope = this;
		data = data || {};
		options = options || {};
		scope._options = {
			_excludes: {
				_options: true
			}
		};
		scope.initialize(data);
		return scope;
	};

	Model.prototype = Object.create(Object.prototype);

	Model.prototype.initialize = function(args, scope) {
		scope = scope || this;
		args = args || {};
	};

	//RESTY MAGICS
	Model.prototype.get = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		if(args.force || !scope._options.ttl || (scope._options.ttl && new Date().getTime() > scope._options.ttl)) {
			var xhr = store({ method: "GET", urn: scope.urn, data: args }, scope).done(function(ret) {
				if(_.isNormalObject(ret.data)) {
					if(scope._options.collection === true) {
						scope.entries = scope.entries || [];

						for(var i = 0; i < ret.data.entries.length; i++) {
							if(_.isNormalObject(ret.data.entries[i]) && _.isUrn(ret.data.entries[i].urn)) {
								var model = findModel(ret.data.entries[i].urn);
								if(model) {
									var instance = new model(ret.data.entries[i]);
									setTimeout(function(instance) {
										store({ method: "POST", urn: instance.urn, data: instance.toJSON(), remote: false}, instance);
									}, 0, instance);
									scope.entries.push(instance);
								}
							} else {
								scope.entries.push(ret.data.entries[i]);
							}
						}
					} else {
						for(var key in ret.data) {
							scope[key] = ret.data[key];
						}

						var collection = findCollection(scope.urn);
						if(collection) {

							var entry = collection.queryOne({filter: {urn: scope.urn}});
							if(entry) {
								var index = collection.entries.indexOf(entry);
								collection.entries[index] = scope;
							} else {
								var index = collection.entries.indexOf(scope.urn);
								if(index !== -1) {
									collection.entries[index] = scope;
								} else {
									collection.entries.push(scope);
								}
							}
						}
					}

					scope._options.persisted = scope.toJSON();

					if(ret.headers['cache-control'] !== "no-cache" && ret.headers['expires']) {
						scope._options.ttl = new Date(ret.headers['expires']).getTime();
						scope._options.lastModified = new Date(ret.headers['last-modified']).getTime();
					} else {
						scope._options.ttl = Date.now();
					}

					scope.dispatch({
						event: "gotted",
						data: scope
					});

					setTimeout(function() {
						store({ method: "POST", urn: scope.urn, data: scope._options.persisted, remote: false}, scope);
					}, 0);

					scope._options.inited = populateRefs(scope, {local: ret.local}).done(function(ret) {
						dfd.resolve(scope);
					});
				} else {
					dfd.reject("Ret was noooo good.");
				}
			}).fail(function(ret) {
				dfd.reject(ret.error);
			});
		} else {
			dfd.resolve(scope);
		}
		return dfd.promise();
	};

	Model.prototype.post = function(args, scope) {
		scope = scope || this; args = args || {};
		return store({ method: "POST", urn: scope.urn, data: args }, scope);
	};

	Model.prototype.put = function(args, scope) {
		scope = scope || this; args = args || {};
		return store({ method: "PUT", urn: scope.urn, data: args }, scope);
	};

	Model.prototype.patch = function(args, scope) {
		scope = scope || this; args = args || {};
		return store({ method: "PATCH", urn: scope.urn, data: args }, scope);
	};

	Model.prototype["delete"] = function(args, scope) {
		scope = scope || this; args = args || {};
		return store({ method: "DELETE", urn: scope.urn, data: args }, scope);
	};

	Model.prototype.options = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		return store({ method: "OPTIONS", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in args) {
				scope._options[key] = args[key];
			}

			dfd.resolve(scope);
		});
	};

	Model.prototype.head = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		return store({ method: "HEAD", urn: scope.urn, data: args }, scope).done(function(ret) {
			dfd.resolve(ret.headers);
		});
	};

	var subSelectRecurse = function(ret, keys) {
		var key = keys.shift();

		if(keys.length === 0) {
			return ret[key];
		} else {
			return subSelectRecurse(ret[key], keys);
		}
	};

	var subSelect = function(entry, key) {
		var keys = key.split(".");

		return subSelectRecurse(entry, keys);
	};

	var walkObjectRecurse = function(obj, keys, val) {
		var key = keys.shift();

		if(keys.length === 0) {
			obj[key] = val;
			return obj;
		} else {
			obj[key] = obj[key] || {};
			return walkObjectRecurse(obj[key], keys, val);
		}
	};

	var walkObject = function(obj, key, val) {
		var keys = key.split(".");

		return walkObjectRecurse(obj, keys, val);
	};

	var createFromLazyObject = function(obj, lazyObj) {
		// For defaulting to obj being a new object
		if(typeof lazyObj === undefined) {
			lazyObj = obj;
			obj = {};
		}

		var ret = obj;

		for(var key in lazyObj) {
			var keys = key.split(".");

			for(var i = 0; i < keys.length - 1; i++) {
				obj[keys[i]] = obj[keys[i]] || {};

				obj = obj[keys[i]];
			}

			obj[keys[i]] = lazyObj[key];
		}

		return ret;
	};

	var runFilter = function(filter, value) {
		if(_.isRegExp(filter)) {
			if(!filter.test(value)) {
				return false;
			}
		} else if(filter !== value) {
			return false;
		}

		return true;
	};

	var filterCheckTheBastard = function(entry, filter) {
		for(var key in filter) {
			var length;
			switch(key) {
				case "$nin":
					length = 1;
				case "$in":
					length = length || 0;
					for(var valKey in filter[key]) {
						var val = subSelect(entry, valKey);
						if(_.isArray(val)) {
							var intersection = _.intersection(val, filter[key][valKey]);

							if(intersection.length === length) {
								return false;
							}
						}
					}
				break;

				case "$all":
					for(var valKey in filter[key]) {
						var val = subSelect(entry, valKey);
						if(_.isArray(val)) {
							var diffs = _.diffValues(val, filter[key][valKey]);

							if(diffs.added.length !== 0 || diffs.changed.length !== 0 || diffs.removed.length !== 0) {
								return false;
							}
						}
					}
				break;

				default:
					var val = subSelect(entry, key);
					if(!runFilter(filter[key], val)) {
						return false;
					}
				break;
			}
		}

		return true;
	};

	var sortTheBastard = function(ret, keys) {
		ret = ret || [];
		ret = ret.sort(function sorter(a, b, keyIndex) {
			keyIndex = keyIndex || 0;

			if (keyIndex > keys.length -1){
				return 0;
			}

			var key = keys[keyIndex].key;

			var aVal = subSelect(a, key);
			var bVal = subSelect(b, key);

			aVal = _.isDate(aVal) ? aVal.getTime() : aVal;
			bVal = _.isDate(bVal) ? bVal.getTime() : bVal;

			if(aVal === bVal){
				keyIndex++;
				return sorter(a, b, keyIndex);
			}

			if (keys[keyIndex].order === "desc"){
				if (aVal > bVal){
					return -1;
				} else {
					return 1; 
				}
			} else {
				if (aVal < bVal){
					return -1;
				} else {
					return 1; 
				}
			}
			
		});
		
		return ret;
	};

	var subSelectTheBastard = function(entry, selects) {
		var ret = {};

		selects.forEach(function(select){
			var sub = subSelect(entry, select);

			if(typeof sub !== "undefined") {
				var lazyObj = {};
				lazyObj[select] = sub;

				createFromLazyObject(ret, lazyObj);
			}
		});

		return ret;
	};

	Model.prototype.query = function(args, scope) {
		scope = scope || this;
		args = args || {};

		args.key = args.key || "entries";

		var ret = [];

		for(var i = 0; i < scope[args.key].length; i++) {
			var entry = scope[args.key][i];

			if(typeof args.filter === "undefined" || (args.filter && filterCheckTheBastard(entry, args.filter))) {
				var toPush = entry;

				if(args.vm) {
					if(entry.toVM && _.isFunction(entry.toVM)) {
						toPush = entry.toVM(args);
					} else {
						toPush = _.clone(entry);
					}
				} else if(args.select) {
					toPush = subSelectTheBastard(entry, args.select);
				}

				ret.push(toPush);
			}
		}

		if(args.order) {
			sortTheBastard(ret, args.order);
		}

		if(args.offset) {
			ret.splice(0, args.offset);
		}

		if(args.limit === 1) {
			ret = ret[0];
		} else if(args.limit > 1) {
			ret = ret.splice(0, args.limit);
		}

		return ret;
	};

	Model.prototype.queryOne = function(args, scope) {
		scope = scope || this;
		args = args || {};

		args.limit = 1;

		return scope.query(args, scope);
	};
	//END RESTY MAGICS

	//EVENTING LAZY MAGICS
	Model.prototype.dispatch = function(args, scope) {
		scope = scope || this;
		args = args || {};

		var urn = scope.urn + ":";

		if(scope._options.collection === true) {
			urn += "*:";
		}

		urn += args.event;

		var sub = scope._options.pubsub.publish({
			urn: urn,
			data: args.data
		});
	};

	Model.prototype.on = function(args, scope) {
		scope = scope || this;
		args = args || {};

		var urn = "";

		if(args.session === true) {
			urn += "session:";
		}

		if(scope._options.collection === true) {
			urn += scope._options.urn + ":*:";
		} else {
			urn += scope.urn + ":";
		}

		urn += args.event;

		var sub = scope._options.pubsub.subscribe({
			urn: urn
		});

		scope._options.subs.push(sub);

		return sub;
	};

	Model.prototype.off = function(args, scope) {
		scope = scope || this;
		args = args || {};

		if(typeof args.sub !== "undefined" && typeof args.sub.id !== "undefined"){
			scope._options.pubsub.unsubscribe({
				id: args.sub.id
			});

			scope._options.subs = _.without(scope._options.subs, sub);
			return true;
		} else {
			return false;
		}
	};
	//END EVENTING LAZY MAGICS

	//SAVING CHANGE STUFFS
	Model.prototype.validate = function(args, scope) {
		scope = scope || this;
		args = args || {};
	};

	Model.prototype.changes = function(args, scope) {
		scope = scope || this;
		args = args || {};
		return scope._options.changes;
	};

	Model.prototype.changed = function(args, scope) {
		scope = scope || this;
		args = args || {};

		delete scope._options.toVMed;
		delete scope._options.toJSONed;

		scope._options.changes = _.dirtyKeys(scope._options.persisted, scope.toJSON());
		scope.dispatch({
			event: "changed",
			data: scope._options.changes
		});
	};

	Model.prototype.set = function(args, scope) {
		scope = scope || this;
		args = args || {};

		if(typeof args.val !== "undefined") {
			scope[args.key] = args.val;
		}

		scope._options.changes = scope._options.changes || {};
		scope._options.changes[args.key] = {
			aVal: scope._options.persisted[args.key],
			bVal: scope[args.val]
		};

		scope.dispatch({
			event: "setted",
			data: args
		});

		scope.changed();
	};
	//END SAVING CHANGE STUFFS

	//DATA MUNGING RETURNS
	var toJSONedCache = {};
	Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
		scope = scope || this;
		args = args || {};
		args.excludes = args.excludes || {};

		if(toJSONedCache[scope.urn]) {
			return toJSONedCache[scope.urn];
		}

		var excludes = {};
		_.extend(excludes, scope._options.excludes, args.excludes);

		var temp = {};
		var keys = Object.keys(scope);
		for(var i = 0; i < keys.length; i++) {
			if(!excludes[keys[i]]) {
				temp[keys[i]] = scope[keys[i]];
			}
		}

		for(var key in scope._options.refs) {
			if(_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn)) {
				temp[key] = scope[key].urn;
			} else if(_.isArray(scope[key])) {
				temp[key] = [];
				scope[key].forEach(function(entry, i) {
					if(_.isNormalObject(scope[key][i]) && _.isUrn(scope[key][i].urn)) {
						temp[key][i] = scope[key][i].urn;
					} else {
						temp[key][i] = scope[key][i];
					}
				});
			} else {
				temp[key] = scope[key];
			}
		}

		toJSONedCache[scope.urn] = temp;

		return temp;
	};

	var toVMedCache = {};
	Model.prototype.toVM = function(args, scope) {
		// TODO: Upchain stuff already to VM'd 
		scope = scope || this;
		args = args || {};
		args.vm = args.vm || "default";
		args.vm = args.vm || "default";

		toVMedCache[scope.urn] = toVMedCache[scope.urn] || {};
		var toVMedCacheKey = args.toVMedCacheKey || "urn";

		if(toVMedCache[scope.urn][args.vm]) {
			return toVMedCache[scope.urn][args.vm];
		}

		var ret = {};

		var keys = scope._options.vms[args.vm];
		if(keys === "*" || typeof keys === "undefined") {
			keys = Object.keys(scope);
		}

		if(scope._options.collection === true) {
			ret.entries = [];

			scope.entries.forEach(function(entry) {
				var vmed;
				toVMedCache[entry[toVMedCacheKey]] = toVMedCache[entry[toVMedCacheKey]] || {};
				
				if(typeof toVMedCache[entry[toVMedCacheKey]][args.vm] === "undefined") { 
					if(typeof entry.toVM !== "undefined" && _.isFunction(entry.toVM)) {
						vmed = toVMedCache[entry[toVMedCacheKey]][args.vm] = entry.toVM(args);
					} else {
						vmed = toVMedCache[entry[toVMedCacheKey]][args.vm] = entry;
					}
				} else {
					vmed = toVMedCache[entry[toVMedCacheKey]][args.vm];
				}

				ret.entries.push(vmed);
			});
		} else {
			toVMedCache[scope.urn][args.vm] = ret;

			keys.forEach(function(key) {
				if(scope._options.refs[key]) {
					if(_.isArray(scope._options.refs[key])) {
						ret[key] = [];
						scope[key].forEach(function(entry) {
							var vmed;
							toVMedCache[entry.urn] = toVMedCache[entry.urn] || {};
							if(typeof toVMedCache[entry.urn][args.vm] === "undefined") {
								vmed = toVMedCache[entry.urn][args.vm] = entry.toVM(args);
							} else {
								vmed = toVMedCache[entry.urn][args.vm];
							}
							ret[key].push(vmed);
						});
					} else {
						var vmed;
						toVMedCache[scope[key].urn] = toVMedCache[scope[key].urn] || {};
						if(typeof toVMedCache[scope[key].urn][args.vm] === "undefined") {
							vmed = toVMedCache[scope[key].urn][args.vm] = scope[key].toVM(args);
						} else {
							vmed = toVMedCache[scope[key].urn][args.vm];
						}
						ret[key] = vmed;
					}
				} else if(key === "*") {
					_.extend(ret, scope.toVM());
				} else if(_.isNormalObject(scope.virtuals) && scope.virtuals[key] && _.isFunction(scope.virtuals[key].getter)) {
					ret[key] = scope.virtuals[key].getter(args, scope);
				} else {
					var sub = subSelect(scope, key);
					if(typeof sub !== "undefined") {
						walkObject(ret, key, sub);
					}
				}
			});
		}

		toVMedCache[scope.urn][args.vm] = ret;

		return ret;
	};
	//END DATA MUNGING RETURNS

	_.updateProp(Model.prototype, {name: "get", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "post", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "put", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "patch", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "delete", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "options", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "head", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "query", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "queryOne", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "dispatch", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "on", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "off", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "validate", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "changes", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "changed", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "set", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "toJSON", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "toVM", attrs: {enumerable: false}});

	//MODEL STATIC TO CREATE SUBCLASSES

	var parseSchema = function(schema, model) {
		model._options.urn = schema.urn;
		model._options.rootUrn = schema.rootUrn;

		model._options.name = schema.name;

		urns[model._options.urn] = {
			regex: _.createRegex({urn: model._options.urn}),
			model: model
		};

		model._options.collection = isCollection(model._options.urn);

		if(typeof schema.store === "undefined") {
			if (typeof window !== 'undefined') {
				if(document.localStorage) {
					model._options.store = {"localStorage": "Jive:Data"};
				} else {
					model._options.store = {"memory":"Jive.Data"};
				}
			} else {
				model._options.store = {"mongo":"mongoConnectionUrl"};
			}
		} else {
			model._options.store = schema.store;
		}

		if(typeof schema.vms === "undefined") {
			schema.vms = {
				"default": "*"
			};
		}

		if(_.isArray(schema.subscriptions)) {
			model._options.subscriptions = schema.subscriptions;
		}

		model._options.vms = schema.vms;

		model._options.refs = schema.refs || {};
		for(var key in model._options.refs) {
			model._options.excludes[key] = true;
		}

		model._options.virtuals = schema.virtuals;
		if(typeof model._options.virtuals !== "undefined") {
			model.prototype.virtuals = {};
			for(var key in model._options.virtuals) {
				model.prototype.virtuals[key] = {};

				model.prototype.virtuals[key].getter = model._options.virtuals[key].getter || function() {};
				model.prototype.virtuals[key].setter = model._options.virtuals[key].setter || function() {};
			}
		}

		model._options.keys = schema.keys || {};

		_.updateProp(model, {name: "_options", attrs: {enumerable: false}});
		_.lockProperty(model._options, "refs");
		_.lockProperty(model._options, "keys");
	};

	Model.create = function(schema) {
		var newModel = function(data, options) {
			var scope = this;
			data = data || {};
			options = options || {};

			scope._options = _.clone(newModel._options);
			_.extend(scope._options, options);

			initialize(data, scope);
			scope.initialize(data);
			return scope;
		};

		newModel._options = {
			excludes: {
				_options: true
			}
		};

		newModel.prototype = Object.create(Model.prototype);

		parseSchema(schema, newModel);

		if(schema.urn[schema.urn.length - 1] === "*") {
			var collectionSchema = _.clone(schema);

			var urnArray = schema.urn.split(":");
			urnArray.splice(-1);
			collectionSchema.urn = urnArray.join(":");

			collectionSchema.rootUrn = schema.rootUrn;

			if(collectionSchema.store.localStore) {
				collectionSchema.store.localStore = collectionSchema.urn;
			}

			if(!findModel(collectionSchema.urn)) {
				collectionSchema.refs = {
					entries: [{type: "urn"}]
				};
				collectionSchema.keys = {
					lastModified: {type: "date"},
					createdDate: {type: "date"}
				};

				var newCollection = Model.create(collectionSchema);

				new newCollection();
			}
		}


		return newModel;
	};
	_.updateProp(Model, {name: "create", attrs: {enumerable: false}});

	Model.getCollections = function() {
		return collections;
	};
	_.updateProp(Model, {name: "getCollections", attrs: {enumerable: false}});
	//END MODEL STATICS

	_.Model = Model;

})();
