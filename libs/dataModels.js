(function() {
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

	var findModel = function(urn) {
		for(var key in urns) {
			if(urns[key].regex.exec(urn)) {
				return urns[key].model;
			}
		}
	};

	var findCollection = function(urn) {
		for(var key in collections) {
			if(collections[key].regex.exec(urn)) {
				return collections[key].collection;
			}
		}
	};

	var findInCollectionOrCreate = function(args, dfd, given) {
		var collection = findCollection(args.urn);
		var model = findModel(args.urn);

		if(collection) {
			var instance = collection.queryOne({ filter: { urn: args.urn }});

			if(typeof instance !== "undefined") {
				dfd.resolve(instance);
			} else {
				instance = new model(args);

				if(!given) {
					instance.get().done(function(ret) {
						dfd.resolve(ret)
					}).fail(function(e) {
						dfd.reject(e);
					});
				} else {
					dfd.resolve(instance);
				}
			}
		} else {
			instance = new model(args);

			if(!given) {
				instance.get().done(function(ret) {
					dfd.resolve(ret);
				}).fail(function(e) {
					dfd.reject(e);
				});
			} else {
				dfd.resolve(instance);
			}
		}

	};

	var makeForModelDeferDfds = {};

	var makeForModelDefer = function(args, given) {
		if(makeForModelDeferDfds[args.urn]) {
			return makeForModelDeferDfds[args.urn].promise;
		} else {
			var dfd = new _.Dfd();

			setTimeout(function() {
				for(var key in makeForModelDeferDfds) {
					if(_.isRegExp(makeForModelDeferDfds[key].regex) && makeForModelDeferDfds[key].regex.exec(args.urn)) {
						makeForModelDeferDfds[key].promise.done(function() {
							findInCollectionOrCreate(args, dfd, given);
						});

						// just bust out and stop early
						return;
					}
				}

				makeForModelDeferDfds[args.urn] = {
					promise: dfd.promise()
				};

				findInCollectionOrCreate(args, dfd, given);
			}, 10);

			return dfd.promise();
		}
	};

	var makeForModel = function(args, given) {
		var dfd = new _.Dfd();

		var collection = findCollection(args.urn);
		var model = findModel(args.urn);

		if(collection) {
			var instance = collection.queryOne({ filter: { urn: args.urn }});
			if(typeof instance !== "undefined") {
				dfd.resolve(instance);
			} else {
				makeForModelDefer(args, given).done(function(ret) {
					dfd.resolve(ret)
				}).fail(function(e) {
					dfd.reject(e);
				});
			}
		} else if(model) {
			makeForModelDefer(args, given).done(function(ret) {
				dfd.resolve(ret);
			}).fail(function(e) {
				dfd.reject(e);
			});
		} else {
			dfd.reject("Couldn't find a model registered for " + args.urn);
		}

		return dfd.promise();
	};

	var populateRefs = function(scope) {
		var dfd = new _.Dfd();

		var dfds = [true];

		for(var key in scope._options.refs) {
			(function(key) {
				var ref = scope._options.refs[key];

				if(_.isArray(ref)) {
					scope[key].forEach(function(item, i) {
						if(_.isNormalObject(item) && _.isUrn(item.urn) && !(scope[key] instanceof _.newModel)) {
							dfds.push(makeForModel(item, true).done(function(ret) {
								scope[key][i] = ret;
							}));
						} else if(_.isUrn(item)) {
							dfds.push(makeForModel({urn: item}).done(function(ret) {
								scope[key][i] = ret;
							}));
						}
					});
				} else {
					if(_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn) && !(scope[key] instanceof _.newModel)) {
						dfds.push(makeForModel(scope[key], true).done(function(ret) {
							scope[key] = ret;
						}));
					} else if(_.isUrn(scope[key])) {
						dfds.push(makeForModel({urn: scope[key]}).done(function(ret) {
							scope[key] = ret;
						}));
					}
				}
			})(key);
		}

		_.Dfd.when(dfds).always(function() {
			dfd.resolve(scope);
		});

		return dfd.promise();
	};

	var store = function(args, scope) {
		var dfd = new _.Dfd();
		scope = scope || this;

		args.data = args.data || {};
		args.remote = args.remote || true;
		args.method = args.method.toUpperCase();

		if(scope._options.collection === true) {
			args.urn = args.urn || scope._options.urn;
		}

		if(typeof args === "undefined" || !args.method || !args.urn) {
			dfd.reject("Must Supply args object with method, url, and data");
			return dfd.promise();
		}

		if(scope._options.store.remote && args.remote) {

			if(args.method === "GET" && scope._options.store.localStorage && scope._options._ttl && new Date().getTime() > scope._options._ttl) {
				local(args, scope).done(function(ret) {
					dfd.resolve(ret);
				}).fail(function(e) {
					dfd.reject(e);
				});
			} else {

				ajax(args, scope).done(function(ret){
					if(scope._options.store.localStorage) {
						if(args.method === "GET") {
							args.method = "POST";
						}
						local(args, scope).done(function() {
							dfd.resolve(ret);
						}).fail(function(e) {
							dfd.reject(e);
						});
					} else {
						dfd.resolve(ret);
					}

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
		}

		return dfd.promise();
	};

	var local = function(args, scope) {
		switch(args.method) {
			case "GET":
				return self.Jive.Store.get(args.urn);
			break;

			case "POST":
				return self.Jive.Store.set(args.urn, args.data);
			break;

			case "PUT":
				return self.Jive.Store.set(args.urn, args.data);
			break;

			case "PATCH":
				var dfd = new _.Dfd();
				var xhr = self.Jive.Store.get(args.urn);
				xhr.done(function(ret) {
					_.extend(ret, args.data);
					self.Jive.Store.set(args.urn, ret).done(function(ret) {
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
				return self.Jive.Store.remove(args.urn);
			break;

			case "HEAD":
				//TODO figure out meta storage as different from "data" storage
				var dfd = new _.Dfd();
				var xhr = self.Jive.Store.get(args.urn);
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
		while ( (match = rheaders.exec( headers )) ) {
			responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
		}

		return responseHeaders;
	};


	var ajax = function(args, scope) {
		scope = scope || this;
		var dfd = new _.Dfd();

		if((args.method == "POST" || args.method == "PUT" || args.method == "PATCH") && args.data) {
			args.data = JSON.stringify(args.data);
		} else if((args.method == "GET" || args.method == "DELETE") && args.data){
			args.urn += "?" + $.param(args.data);
		}

		var remote = scope._options.store.remote.replace(/\/$/g, "");

		$.ajax({
			url: remote + "/" + args.urn,
			beforeSend : function (xhr){
				xhr.setRequestHeader("Content-Type","application/json; charset=utf-8");
			},
			type: args.method,
			data: args.data,
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

	var postFunc = function(event, ret) {
		scope = scope || this;

		for(var key in ret) {
			scope[key] = ret[key];
		}

		scope._options.persisted = scope.toJSON();

		scope.dispatch({
			event: event,
			data: ret
		});
	};

	var deleteFunc = function(ret) {
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
	};

	var doInitializeDefault = function(scope, key) {
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

	var initializeForInForNotOptimized = function(args, scope) {

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

	var initialize = function(args, scope) {
		scope = scope || this;
		args = args || {};

		if(scope._options.collection === true) {
			collections[scope._options.name] = {
				regex: _.createRegex({urn: scope._options.urn + ":*"}),
				collection: scope
			};

			scope.urn = scope._options.rootUrn || scope.urn;

			scope.entries = [];
		}

		initializeForInForNotOptimized(args, scope);

		populateRefs(scope);

		scope._options.subs = [];

		scope._options.pubsub = self.Jive.Jazz;

		scope._options.postFunc = postFunc.bind(scope, "posted");
		scope._options.putFunc = postFunc.bind(scope, "putted");
		scope._options.patchFunc = postFunc.bind(scope, "patched");
		scope._options.deleteFunc = deleteFunc.bind(scope);

		scope._options.persisted = scope.toJSON();

		scope.on({event: "post"}).progress(function(ret) {
			console.log("WTF is ret in POST?", ret);
			scope._options.postFunc
		});
		scope.on({event: "put"}).progress(function(ret) {
			console.log("WTF is ret in PUT?", ret);
			scope._options.putFunc;
		});
		scope.on({event: "patch"}).progress(function(ret) {
			console.log("WTF is ret in PATCH?", ret);
			scope._options.patchFunc;
		});
		scope.on({event: "delete"}).progress(function(ret) {
			console.log("WTF is ret in DELETE?", ret);
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
							var model = findModel(ret.data.entries[i].urn);
							scope.entries.push(new model(ret.data.entries[i]));
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
								collection.entries.push(scope);
							}
						}
					}

					scope._persisted = scope.toJSON();

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

					populateRefs(scope).done(function(ret) {
						dfd.resolve(scope);
					});
				}
			}).fail(function(ret) {
				dfd.reject(ret.error);
			});

			if(scope._options.collection === true) {
				makeForModelDeferDfds[scope._options.urn] = {
					promise: xhr,
					regex: collections[scope._options.name].regex
				};
			}
		} else {
			dfd.resolve(scope);
		}
		return dfd.promise();
	};

	Model.prototype.post = function(args, scope) {
		scope = scope || this; args = args || {};
		return store({ method: "POST", urn: scope.urn, data: args }, scope).done(scope._options.postFunc);
	};

	Model.prototype.put = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		return store({ method: "PUT", urn: scope.urn, data: args }, scope).done(scope._options.putFunc);
	};

	Model.prototype.patch = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		return store({ method: "PATCH", urn: scope.urn, data: args }, scope).done(scope._options.patchFunc);
	};

	Model.prototype["delete"] = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		return store({ method: "DELETE", urn: scope.urn, data: args }, scope).done(scope._options.deleteFunc);
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

	var filterCheckTheBastard = function(entry, filter) {
		for(var key in filter) {
			var obj = subSelect(entry, key);

			if(_.isRegExp(filter[key])) {
				if(!filter[key].test(obj)) {
					return false;
				}
			} else if(obj !== filter[key]) {
				return false;
			}
		}

		return true;
	};

	var sortTheBastard = function(ret, order) {
		ret = ret || [];

		var keys = Object.keys(order).reverse();
		keys.forEach(function(key) {
			ret = ret.sort(function(a, b) {
				var aVal = subSelect(a, key);
				var bVal = subSelect(b, key);

				if(order[key] !== "desc") {
					return (aVal === bVal) ? 0 :
						   (aVal < bVal) ? -1 : 1;
				} else {
					return (aVal === bVal) ? 0 :
						   (aVal > bVal) ? -1 : 1;
				}
			});
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
			if(ret.length === args.limit + (args.offset || 0)) {
				break;
			}

			if(typeof args.filter === "undefined" || (args.filter && filterCheckTheBastard(entry, args.filter))) {
				var toPush = entry;

				if(args.vm) {
					toPush = entry.toVM(args);
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

		if(args.entries) {
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

		var urn;
		if(scope._options.collection === true) {
			urn = scope._options.urn + ":";
		} else {
			urn = scope.urn + ":";
		}

		if(args.entries) {
			urn += "*:";
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

		scope._options.changes = _.dirtyKeys(scope._options.persisted, scope.toJSON());
		console.log(scope._options.changes);
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

		scope.dispatch({
			event: "changed",
			data: scope._options.changes
		});
	};
	//END SAVING CHANGE STUFFS

	//DATA MUNGING RETURNS
	Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
		scope = scope || this;
		args = args || {};
		args.excludes = args.excludes || {};

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

		return temp;
	};

	Model.prototype.toVM = function(args, scope) {
		// TODO: Upchain stuff already to VM'd
		scope = scope || this;
		args = args || {};
		args.vm = args.vm || "default";

		args.alreadyToVmed = args.alreadyToVmed || {};

		var ret;

		var keys = scope._options.vms[args.vm];
		if(keys === "*") {
			return _.clone(scope.toJSON(args), true);
		} else {
			if(scope._options.collection === true) {
				ret = [];

				scope.entries.forEach(function(entry) {
					var vmed;
					if(typeof args.alreadyToVmed[entry.urn] === "undefined") {
						args.alreadyToVmed[entry.urn] = {urn: entry.urn};
						vmed = entry.toVM(args);

						for(var vmedKey in vmed) {
							args.alreadyToVmed[entry.urn][vmedKey] = vmed[vmedKey];
						}
					} else {
						vmed = args.alreadyToVmed[entry.urn];
					}

					ret.push(vmed);
				});
			} else {
				ret = {};

				args.alreadyToVmed[scope.urn] = ret;

				keys.forEach(function(key) {
					if(scope._options.refs[key]) {
						if(_.isArray(scope._options.refs[key])) {
							ret[key] = [];
							scope[key].forEach(function(entry) {
								var vmed;
								if(typeof args.alreadyToVmed[entry.urn] === "undefined") {
									args.alreadyToVmed[entry.urn] = {urn: entry.urn};
									vmed = entry.toVM(args);

									for(var vmedKey in vmed) {
										args.alreadyToVmed[entry.urn][vmedKey] = vmed[vmedKey];
									}
								} else {
									vmed = args.alreadyToVmed[entry.urn];
								}
								ret[key].push(vmed);
							});
						} else {
							var vmed;
							if(typeof args.alreadyToVmed[scope[key].urn] === "undefined") {
								args.alreadyToVmed[scope[key].urn] = {urn: scope[key].urn};
								vmed = scope[key].toVM(args);

								for(var vmedKey in vmed) {
									args.alreadyToVmed[scope[key].urn][vmedKey] = vmed[vmedKey];
								}
							} else {
								vmed = args.alreadyToVmed[scope[key].urn];
							}
							ret[key] = vmed;
						}
					} else {
						var sub = subSelect(scope, key);
						walkObject(ret, key, sub);
					}
				});
			}

			return ret;
		}
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
		model._options.vms = schema.vms;

		model._options.refs = schema.refs || {};
		for(var key in model._options.refs) {
			model._options.excludes[key] = true;
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
