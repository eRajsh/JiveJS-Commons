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
				return urns[key].Model;
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

	var getDeffered = function getDeffered(urn, strict) {

		if(makeForModelDeferDfds[urn]) {
			return makeForModelDeferDfds[urn];
		} else {
			if(!strict) {
				for(var key in makeForModelDeferDfds) {
					if(_.isRegex(makeForModelDeferDfds[key].regex) && makeForModelDeferDfds[key].regex.exec(urn)) {
						return makeForModelDeferDfds[key];
					}
				}
			}
		}

	};

	var makeAndGet = function makeAndGet(args, Model, collection, dfd, given) {
		var instance = new Model(args);

		if(!given) {
			instance.get().done(function(instance) {
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
		var Model = findModel(args.urn);
		var instance;

		if(collection) {
			instance = collection.queryOne({ filter: { urn: args.urn }});
			if(typeof instance !== "undefined") {
				dfd.resolve(instance);
			} else {
				var alreadyWaiting = getDeffered(args.urn);
				if(alreadyWaiting) {
					alreadyWaiting.promise.done(function waitingDone(){
						setTimeout(function() {
							instance = collection.queryOne({ filter: { urn: args.urn }});

							if(instance) {
								dfd.resolve(instance);
							} else {
								var alreadyWaiting = getDeffered(args.urn, true);
								if (alreadyWaiting) {
									alreadyWaiting.promise.done(function() {
										instance = collection.queryOne({
											filter: {
												urn: args.urn
											}
										});
										if (instance) {
											dfd.resolve(instance);
										} else {
											makeAndGet(args, Model, collection, dfd, given);
										}
									});
								} else {
									console.error("Our alreadyWaiting promise finished, but we still couldn't find it. WTF?", args.urn, given, collection);
									makeAndGet(args, Model, collection, dfd, given);
								}
							}
						}, 5);
					});
				} else {
					makeAndGet(args, Model, collection, dfd, given);
				}
			}
		} else if(Model) {
			makeAndGet(args, Model, dfd, given);
		} else {
			dfd.reject("Couldn't find a Model registered for " + args.urn);
		}

		return dfd.promise();
	};

	var populateRefs = function populateRefs(scope, args) {
		args = args || {};

		var dfd = new _.Dfd();

		var dfds = [true];

		function fetchForKey(key) {
			var ref = scope._options.refs[key];

			if(_.isArray(ref)) {
				scope[key].forEach(function(item, i) {
					var eachDfd;

					if(_.isNormalObject(item) && _.isUrn(item.urn) && !(item instanceof Model)) {
						eachDfd = new _.Dfd();

						makeForModel(item, true).done(function(ret) {
							scope[key][i] = ret;
							eachDfd.resolve();
						});

						dfds.push(eachDfd.promise());
					} else if(_.isUrn(item)) {
						eachDfd = new _.Dfd();

						makeForModel({urn: item}).done(function(ret) {
							scope[key][i] = ret;
							eachDfd.resolve();
						});

						dfds.push(eachDfd.promise());
					}
				});
			} else {
				var eachDfd;

				if(_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn) && !(scope[key] instanceof Model)) {
					eachDfd = new _.Dfd();

					makeForModel(scope[key], true).done(function(ret) {
						scope[key] = ret;
						eachDfd.resolve();
					});

					dfds.push(eachDfd);
				} else if(_.isUrn(scope[key])) {
					eachDfd = new _.Dfd();


					makeForModel({urn: scope[key]}).done(function(ret) {
						scope[key] = ret;
						eachDfd.resolve();
					});

					dfds.push(eachDfd.promise());
				}
			}
		}

		for(var key in scope._options.refs) {
			fetchForKey(key);
		}

		_.Dfd.when(dfds).done(function() {
			dfd.resolve(scope);
		}).fail(function(errs) {
			console.error("Errors in populates", errs);
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
				if(args.method === "GET") {
					makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
						promise: dfd.promise()
					};
				}

				local(args, scope).done(function(ret) {
					dfd.resolve({data: ret, headers: {}, status: 200, local: true});
				}).fail(function(e) {
					dfd.reject(e);
				});
			} else {
				if(args.method === "GET" && scope._options.collection === true) {
					makeForModelDeferDfds[scope._options.urn] = {
						promise: dfd.promise(),
						regex: collections[scope._options.name].regex
					};
				}

				ajax(args, scope).done(function(ret){
					if(args.method === "DELETE") {
						var collection = findCollection(scope.urn);
						if(collection) {
							for(var i = 0; i < collection.entries.length; i++) {
								if(collection.entries[i].urn === scope.urn) {
									collection.entries.splice(i, 1);
								}
							}
						}
					}

					if(args.method === "POST") {
						var wait = new _.Dfd();

						makeForModelDeferDfds[ret.data.urn] = makeForModelDeferDfds[ret.data.urn] || {
							promise: wait.promise(),
							dfd: wait
						};

						makeForModelDeferDfds[ret.data.urn].promise.done(function(instance) {
							if(instance) {
								ret.model = ret.instance = instance;
							} else {
								var collection = findCollection(ret.data.urn);
								if(collection) {
									ret.model = ret.instance = collection.queryOne({filter: {urn: ret.data.urn}});
								}
							}

							dfd.resolve(ret);
						});
					} else {
						dfd.resolve(ret);
					}
				}).fail(function(e) {
					dfd.reject(e);
				});
			}
		} else if(scope._options.store.localStorage) {
			if(args.method === "GET") {
				makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
					promise: dfd.promise()
				};
			}

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
		var dfd;
		var xhr;

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
				dfd = new _.Dfd();
				xhr = self.Jive.Store.get(urn, {json: true});
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
				dfd = new _.Dfd();
				xhr = self.Jive.Store.get(urn, {json: true});
				xhr.done(function(ret) {
					dfd.resolve({
						lastModified: ret.lastModified,
						eTag: ret.eTag,
						ttl: ret.ttl,
						expires: ret.expires
					});
				}).fail(function(e) {
					dfd.reject(e);
				});
				return dfd.promise();
			break;

			case "OPTIONS":
			default:
				dfd = new _.Dfd();
				dfd.resolve();
				return dfd.promise();
			break;
		}
	};


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
			data = JSON.stringify(data);
		}

		var remote = scope._options.store.remote.replace(/\/$/g, "");

		var xhr = new XMLHttpRequest();
		xhr.open(args.method, (self.Jive.Features.APIBaseUrl || "") + remote + "/" + urn);
		xhr.setRequestHeader("Content-Type","application/json; charset=utf-8");

		xhr.onreadystatechange = function xhrOnReadyStateChange() {
			if(xhr.readyState === 4) {
				if(xhr.status > 400) {
					dfd.reject({
						e: xhr.status,
						status: xhr.status,
						headers: parseHeaders(((xhr && xhr.getAllResponseHeaders()) || ""))
					});
				} else {
					var data = JSON.parse(xhr.responseText);

					dfd.resolve({
						data: data,
						status: xhr.status,
						headers: parseHeaders(((xhr && xhr.getAllResponseHeaders()) || ""))
					});
				}
			}
		};

		xhr.send(data);

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
		var toRet, populate, publish = false, dfd;

		if(scope._options.collection === true) {
			var Model = findModel(data.urn);
			var collection = findCollection(data.urn);

			var instance = (typeof collection !== "undefined") ? collection.queryOne({filter: { urn: data.urn }}) : undefined;

			switch(event) {
				case "posted":
					if(typeof instance === "undefined" && Model) {
						instance = new Model(data);
						if(makeForModelDeferDfds[instance.urn] && makeForModelDeferDfds[instance.urn].dfd) {
							makeForModelDeferDfds[instance.urn].dfd.resolve(instance);
						} else {
							dfd = new _.Dfd();

							makeForModelDeferDfds[instance.urn] = makeForModelDeferDfds[instance.urn] || {
								promise: dfd.promise()
							};
						}

						insertFunc({entry: instance}, collection);
					} else {
						if(makeForModelDeferDfds[instance.urn] && makeForModelDeferDfds[instance.urn].dfd) {
							makeForModelDeferDfds[instance.urn].dfd.resolve(instance);
						}

						_.extend(instance, data);
					}

					populate = true;
					publish = true;
				break;
			}

			// We always want to return the instance, not the scope when
			// we are inside the collection. Not often the collection itself
			// gets an update since the collection is a client side concept only
			toRet = instance;
		} else {
			var key;
			switch(event) {
				case "putted":
					if(typeof scope !== "undefined") {
						for(key in scope) {
							if(key !== "_options") {
								delete scope[key];
							}
						}
					}
				// THIS TOTALLY FLOWS INTO PATCHED
				// It should be this way.
				// putted causes all of the parts to be deleted and then we set the keys,
				// patched only changes the keys that were defined.

				case "patched":
					for (key in scope._options.keys) {
						scope[key] = (typeof data[key] !== "undefined") ? data[key] : scope[key];
					}


					for (key in scope._options.refs) {
						if(typeof data[key] !== "undefined") {
							if(!scope[key]) {
								scope[key] = data[key];
								populate = true;
							} else if(_.isNormalObject(scope[key]) && scope[key].urn && (!(scope[key] instanceof _.Model) || scope[key].urn !== data[key])) {
								scope[key] = data[key];
								populate = true;
							} else if(_.isArray(scope[key])) {
								var urns = _.pluck(scope[key], "urn");
								if(!_.isEqual(scope[key], data[key])) {
									scope[key] = data[key];
									populate = true;
								}
							} else if(_.isUrn(scope[key])) {
								scope[key] = data[key];
								populate = true;
							}
						}
					}

					publish = true;
				break;
			}

			toRet = scope;
		}

		if(populate === true) {
			toRet._options.inited = populateRefs(toRet);
		}

		if(publish === true) {
			toRet._options.inited.done(function() {
				if(dfd) {
					dfd.resolve();
				}

				toRet.dispatch({
					event: event,
					data: toRet
				});

				if(event === "putted" || event === "patched") {
					toRet.changed();
				}
			});
		}

		return toRet;
	};

	var deleteFunc = function deleteFunc(args, scope) {
		scope = scope || this;

		scope._options.subs.forEach(function(sub) {
			scope.off({sub: sub});
		});

		scope.dispatch({
			event: "deleted",
			data: args
		});
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
		var key;

		for(key in scope._options.refs) {
			if(_.isArray(scope._options.refs[key])) {
				scope[key] = scope[key] || [];
			} else {
				scope[key] = scope[key] || null;
			}
		}

		for(key in scope._options.keys) {
			doInitializeDefault(scope, key);
		}

		for(key in scope._options.virtuals) {
			scope.virtuals[key].getter = scope.virtuals[key].getter.bind(scope);
			scope.virtuals[key].setter = scope.virtuals[key].getter.bind(scope);
		}

		for(key in args) {
			scope[key] = args[key];
		}

	};

	var initialize = function initialize(args, scope) {
		scope = scope || this;
		args = args || {};

		scope._options.fetched = new _.Dfd();

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

			if(_.isArray(scope._options.subscriptions) && self && self.Jive && self.Jive.SessionBridge) {
				if(scope._options.collection === true) {
					scope._options.fetched.done(function(scope) {
						for(var i = 0; i < scope._options.subscriptions.length; i++) {
							self.Jive.SessionBridge.subscribe({
								urn: scope._options.subscriptions[i],
								ETag: scope._options.ETag
							});
						}
					});
				}
		}

			scope.insert = insertFunc.bind(scope);
		}

		scope._options.persisted = scope.toJSON();

		initializeForInForNotOptimized(args, scope);

		scope._options.inited = populateRefs(scope);

		scope._options.subs = [];

		if(typeof self !== "undefined" && self.Jive && self.Jive.Jazz) {
			scope._options.pubsub = self.Jive.Jazz;
		} else {
			scope._options.pubsub = new _.Fabric();
		}

		scope._options.postFunc = eventFunc.bind(scope, "posted");
		scope._options.putFunc = eventFunc.bind(scope, "putted");
		scope._options.patchFunc = eventFunc.bind(scope, "patched");
		scope._options.deleteFunc = deleteFunc.bind(scope);

		scope._options.persisted = scope.toJSON();

		if(scope._options.collection === true) {
			scope.on({event: "posted", session: true}).progress(function(ret) {
				scope._options.postFunc(ret);
			});
		} else {
			scope.on({event: "putted", session: true}).progress(function(ret) {
				scope._options.putFunc({data: ret.data.body});
			});

			scope.on({event: "patched", session: true}).progress(function(ret) {
				scope._options.patchFunc({data: ret.data.body});
			});

			scope.on({event: "deleted", session: true}).progress(function(ret) {
				scope._options.deleteFunc();
			});
		}
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
	var gettingUrns = {};
	Model.prototype.get = function(args, scope) {
		scope = scope || this;
		args = args || {};
		var dfd = new _.Dfd();

		if(gettingUrns[scope.urn + JSON.stringify(args)]) {
			return gettingUrns[scope.urn + JSON.stringify(args)];
		}

		if(args.urn || args.force || !scope._options.ttl || (scope._options.ttl && new Date().getTime() > scope._options.ttl)) {
			var xhr = store({ method: "GET", urn: scope.urn, data: args }, scope).done(function modelGotten(ret) {
				if(_.isNormalObject(ret.data)) {
					if(scope._options.collection === true) {
						scope.entries = scope.entries || [];

						scope._options.ETag = ret.data.ETag;

						for(var i = 0; i < ret.data.entries.length; i++) {
							if(_.isNormalObject(ret.data.entries[i]) && _.isUrn(ret.data.entries[i].urn)) {
								var instance = scope && scope.queryOne({filter: {urn: ret.data.entries[i].urn}});
								if(instance) {
									instance.set(ret.data.entries[i]);
									setTimeout(function(instance) {
										store({ method: "POST", urn: instance.urn, data: instance.toJSON(), remote: false}, instance);
									}, 0, instance);
								} else {
									var Model = findModel(ret.data.entries[i].urn);
									if(Model) {
										instance = new Model(ret.data.entries[i]);
										setTimeout(function(instance) {
											store({ method: "POST", urn: instance.urn, data: instance.toJSON(), remote: false}, instance);
										}, 0, instance);
										scope.entries.push(instance);
									}
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
							var index;
							if(entry) {
								index = collection.entries.indexOf(entry);
								collection.entries[index] = scope;
							} else {
								index = collection.entries.indexOf(scope.urn);
								if(index !== -1) {
									collection.entries[index] = scope;
								} else {
									collection.entries.push(scope);
								}
							}
						}
					}

					scope._options.persisted = scope.toJSON();

					if(ret.headers['cache-control'] !== "no-cache" && ret.headers.expires) {
						scope._options.ttl = new Date(ret.headers.expires).getTime();
						scope._options.lastModified = new Date(ret.headers["last-modified"]).getTime();
					} else {
						scope._options.ttl = Date.now();
					}

					setTimeout(function() {
						store({ method: "POST", urn: scope.urn, data: scope._options.persisted, remote: false}, scope);
					}, 0);

					scope._options.inited = populateRefs(scope, {local: ret.local}).done(function(){
						if(scope._options.fetched) {
							scope._options.fetched.resolve(scope);
						}
						delete gettingUrns[scope.urn + JSON.stringify(args)];
						dfd.resolve(scope);
					});

					scope._options.inited.done(function() {
						scope.dispatch({
							event: "gotted",
							data: scope
						});
					});
				} else {
					delete gettingUrns[scope.urn + JSON.stringify(args)];
					dfd.reject("Ret was noooo good.");
				}
			}).fail(function(ret) {
				delete gettingUrns[scope.urn + JSON.stringify(args)];
				dfd.reject(ret.error);
			});

			gettingUrns[scope.urn + JSON.stringify(args)] = dfd;
		} else {
			delete gettingUrns[scope.urn + JSON.stringify(args)];
			dfd.resolve(scope);
		}
		return dfd.promise();
	};

	Model.prototype.post = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		makeForModelDeferDfds[scope.urn] = makeForModelDeferDfds[scope.urn] || {
			dfd: dfd,
			promise: dfd.promise()
		};

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
		}

		if(_.isNormalObject(ret[key])) {
			return subSelectRecurse(ret[key], keys);
		} else if(_.isArray(ret[key])) {
			// This is mostly to help with the isArray case.
			// We don't want to shift off the stuff if we're passing it to 8 billion different guys
			var arrRet = [];
			for(var i = 0; i < ret[key].length; i++) {
				var arrKeys = _.clone(keys);

				arrRet[i] = subSelectRecurse(ret[key][i], arrKeys);
			}

			return arrRet;
		}
	};

	var subSelect = function(entry, key, args) {
		var keys = key.split(".");

		if(typeof entry[key] === "undefined" && _.isNormalObject(entry.virtuals) && entry.virtuals[key] && _.isFunction(entry.virtuals[key].getter)) {
			return entry.virtuals[key].getter(args, entry);
		} else {
			return subSelectRecurse(entry, keys);
		}
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

	var defaultFilter = function(filter, value) {
		if(_.isRegExp(filter)) {
			if(!filter.test(value)) {
				return false;
			}
		} else if(filter != value) { //loosey comparison on purpose cuz of stupid number strings bullshittery
			return false;
		}

		return true;
	};

	var filterCheckTheBastard = function(entry, filter, isFilterObject, isFilterFunction) {
		if(isFilterObject) {
			for(var key in filter) {
				if(entry && entry._options && entry._options.refs && entry._options.refs[key]) {
					filter[key + ".urn"] = filter[key];
					delete filter[key];
					key = key + ".urn";
				}

				var val = subSelect(entry, key),
					length,
					temp,
					cleanVal;

				if(_.isNormalObject(filter[key])) {
					for(var filterKey in filter[key]) {
						switch(filterKey) {
							case "$lt":
								if(val >= filter[key][filterKey]) {
									return false;
								}
							break;

							case "$gt":
								if(val <= filter[key][filterKey]) {
									return false;
								}
							break;


							case "$lte":
								if(val > filter[key][filterKey]) {
									return false;
								}
							break;

							case "$gte":
								if(val < filter[key][filterKey]) {
									return false;
								}
							break;

							case "$btw":
								if(val <= filter[key][filterKey][0] || val >= filter[key][filterKey][1]) {
									return false;
								}
							break;

							case "$btwe":
								if(val < filter[key][filterKey][0] || val > filter[key][filterKey][1]) {
									return false;
								}
							break;


							case "$nin":
								temp = true;
								length = 1;
								// FLOWS THROUGH ON PURPOSE, DON'T BREAK THIS.
							case "$in":
								length = 0;
								temp = temp || false;

								if(_.isArray(val)) {
									var intersection = _.intersection(val, filter[key][filterKey]);

									if(intersection.length === length) {
										return false;
									}
								} else {
									var index = filter[key][filterKey].indexOf(val);

									if(temp === true) {
										if(index !== -1) {
											return false;
										}
									} else if(temp === false) {
										if(index === -1) {
											return false;
										}
									}
								}
							break;


							case "$all":
								if(_.isArray(val)) {
									var diffs = _.diffValues(val, filter[key][filterKey]);

									if(diffs.added.length !== 0 || diffs.changed.length !== 0 || diffs.removed.length !== 0) {
										return false;
									}
								}
							break;

							case "$neq":
								var checkEqualFailCase = true;
							case "$eq":
								checkEqualFailCase = checkEqualFailCase || false;

								if(_.isEqual(val, filter[key][filterKey]) === checkEqualFailCase) {
									return false;
								}
							break;

							case "$alphaNumSearch":
								filter[key][filterKey] = ('' + filter[key][filterKey]).replace(/[^\w:\-\/]/g, '').toLowerCase();
								if(_.isDate(val)) {
									//TODO: MAKE THIS LESS HACKEY
									cleanVal = '' + val.toLocaleString();
								} else {
									cleanVal = '' + val;
								}
								cleanVal = cleanVal.replace(/[^\w:\-\/]/g, '').toLowerCase();
								// FLOWS THROUGH ON PURPOSE, DON'T BREAK THIS.
							case "$search":
								cleanVal = cleanVal || val;
								if(('' + cleanVal).indexOf(filter[key][filterKey]) === -1) {
									return false;
								}
							break;

							case "$fuzzySearch":
								var fuzzyFilter = new RegExp("\\b" + filter[key][filterKey] + "|" + filter[key][filterKey] + "\\b", "i");
								if(!defaultFilter(fuzzyFilter, val)) {
									return false;
								}
							break;

							default:
								if(!defaultFilter(filter[key][filterKey], val)) {
									return false;
								}
							break;
						}
					}
				} else if(_.isFunction(filter[key])) {
					if(!filter[key].call(entry, val, entry)) {
						return false;
					}
				} else {
					if(!defaultFilter(filter[key], val)) {
						return false;
					}
				}
			}
		} else if(isFilterFunction) {
			if(!filter.call(entry, entry)) {
				return false;
			}
		}

		return true;
	};

	var sortTheBastard = function(ret, keys, args) {
		ret = ret || [];
		ret = ret.sort(function sorter(a, b, keyIndex) {
			keyIndex = keyIndex || 0;

			if (keyIndex > keys.length -1){
				return 0;
			}

			var key = keys[keyIndex].key;
			var aVal = subSelect(a, key, args);
			var bVal = subSelect(b, key, args);
			aVal = _.isDate(aVal) ? aVal.getTime() : aVal;
			bVal = _.isDate(bVal) ? bVal.getTime() : bVal;

			var order = keys[keyIndex].order;
			var desc = (order === "desc" || order === "descending" || order === "down");
			var asc = (order === "asc" || order === "ascending" || order === "up");

			if(aVal === bVal || (!desc && !asc)){
				keyIndex++;
				return sorter(a, b, keyIndex);
			}

			if (desc){
				if (aVal > bVal){
					return -1;
				} else {
					return 1;
				}
			} else if(asc) {
				if (aVal < bVal){
					return -1;
				} else {
					return 1;
				}
			} else if(_.isFunction(keys[keyIndex].order)){
				return keys[keyIndex].order(aVal, bVal);
			}
		});

		return ret;
	};

	var subSelectTheBastard = function(entry, selects, args) {
		var ret = {};

		selects.forEach(function(select){
			var sub = subSelect(entry, select, args);

			if(typeof sub !== "undefined") {
				var lazyObj = {};
				lazyObj[select] = sub;

				createFromLazyObject(ret, lazyObj);
			}
		});

		return ret;
	};

	Model.prototype.query = Model.prototype.find = function(args, scope) {
		scope = scope || this;
		args = args || {};
		args.filter = args.filter || {};

		var isFilterObject = _.isNormalObject(args.filter);
		var isFilterFunction = _.isFunction(args.filter);
		if(!isFilterObject && !isFilterFunction) {
			throw new TypeError("If you give me a filter key, it must be an object or function");
		}


		args.key = args.key || "entries";

		var ret = [];

		for(var i = 0; i < scope[args.key].length; i++) {
			var entry = scope[args.key][i];

			if(typeof args.filter === "undefined" || (args.filter && filterCheckTheBastard(entry, args.filter, isFilterObject, isFilterFunction, args))) {
				var toPush = entry;

				if(args.vm) {
					if(entry.toVM && _.isFunction(entry.toVM)) {
						toPush = entry.toVM({vm: args.vm});
					} else {
						toPush = _.clone(entry);
					}
				} else if(args.select) {
					toPush = subSelectTheBastard(entry, args.select, args);
				}

				ret.push(toPush);
			}
		}

		if(args.order) {
			sortTheBastard(ret, args.order, args);
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

	Model.prototype.queryOne = Model.prototype.findOne = function(args, scope) {
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

		delete toJSONedCache[scope.urn];
		delete toVMedCache[scope.urn];

		var jsoned = scope.toJSON();

		scope._options.changes = _.dirtyKeys(scope._options.persisted, jsoned);
		scope.dispatch({
			event: "changed",
			data: scope
		});

		scope._options.persisted = jsoned;
	};

	Model.prototype.set = function(key, value, scope) {
		scope = scope || this;

		var toSet = {};
		if(typeof key === "object" && !value) {
			toSet = key;
		} else if(typeof key === "string" && typeof value !== "undefined") {
			toSet[key] = value;
		}

		for(key in toSet) {
			if(key in scope._options.refs) {
				continue;
			}

			scope[key] = toSet[key];

			scope._options.changes = scope._options.changes || {};
			scope._options.changes[key] = {
				aVal: scope._options.persisted[key],
				bVal: scope[key]
			};
		}

		scope.dispatch({
			event: "setted",
			data: toSet
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
		scope = scope || this;
		args = args || {};
		args.vm = args.vm || "default";

		var ret = {};

		toVMedCache[scope.urn] = toVMedCache[scope.urn] || {};
		var toVMedCacheKey = args.toVMedCacheKey || "urn";
		if(toVMedCache[scope.urn][args.vm] && scope._options.collection === false) {
			ret = toVMedCache[scope.urn][args.vm];
		}

		var keys = args.keys || scope._options.vms[args.vm];
		if(typeof keys === "undefined"){
			keys = scope._options.vms.default;
		}
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
						vmed = toVMedCache[entry[toVMedCacheKey]][args.vm] = entry.toVM({vm: args.vm});
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
								if(_.isFunction(entry.toVM)) {
									vmed = toVMedCache[entry.urn][args.vm] = entry.toVM({vm: args.vm});
								} else {
									console.log("wasn't a function thing", entry);
								}
							} else {
								vmed = toVMedCache[entry.urn][args.vm];
							}
							ret[key].push(vmed);
						});
					} else if(scope[key] && scope[key].urn) {
						var vmed;
						toVMedCache[scope[key].urn] = toVMedCache[scope[key].urn] || {};
						if(typeof toVMedCache[scope[key].urn][args.vm] === "undefined") {
							vmed = toVMedCache[scope[key].urn][args.vm] = scope[key].toVM({vm: args.vm});
						} else {
							vmed = toVMedCache[scope[key].urn][args.vm];
						}
						ret[key] = vmed;
					}
				} else if(key === "*") {
					_.extend(ret, scope.toVM({keys: "*", vm: args.vm}));
				} else {
					var sub = subSelect(scope, key, args);
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
	_.updateProp(Model.prototype, {name: "find", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "queryOne", attrs: {enumerable: false}});
	_.updateProp(Model.prototype, {name: "findOne", attrs: {enumerable: false}});
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

	var parseSchema = function(schema, Model) {
		Model._options.urn = schema.urn;
		Model._options.rootUrn = schema.rootUrn;

		Model._options.name = schema.name;

		urns[Model._options.urn] = {
			regex: _.createRegex({urn: Model._options.urn}),
			Model: Model
		};

		Model._options.collection = isCollection(Model._options.urn);

		if(typeof schema.store === "undefined") {
			if (typeof window !== 'undefined') {
				if(document.localStorage) {
					Model._options.store = {"localStorage": "Jive:Data"};
				} else {
					Model._options.store = {"memory":"Jive.Data"};
				}
			} else {
				Model._options.store = {"mongo":"mongoConnectionUrl"};
			}
		} else {
			Model._options.store = schema.store;
		}

		if(typeof schema.vms === "undefined") {
			schema.vms = {
				"default": "*"
			};
		}

		if(typeof schema.subscriptions !== "undefined" && Model._options.collection === true) {
			Model._options.subscriptions = schema.subscriptions;
		} else if(typeof Model._options.subscriptions === "undefined" && Model._options.collection === true && Model._options.urn) {
			Model._options.subscriptions = [
				Model._options.urn,
				Model._options.urn + ":*"
			];
		}

		Model._options.vms = schema.vms;

		Model._options.refs = schema.refs || {};
		var key;
		for(key in Model._options.refs) {
			Model._options.excludes[key] = true;
		}

		Model._options.virtuals = schema.virtuals;
		if(typeof Model._options.virtuals !== "undefined") {
			Model.prototype.virtuals = {};
			for(key in Model._options.virtuals) {
				Model.prototype.virtuals[key] = {};

				Model.prototype.virtuals[key].getter = Model._options.virtuals[key].getter || function() {};
				Model.prototype.virtuals[key].setter = Model._options.virtuals[key].setter || function() {};
			}
		}

		Model._options.keys = schema.keys || {};

		_.updateProp(Model, {name: "_options", attrs: {enumerable: false}});
		_.lockProperty(Model._options, "refs");
		_.lockProperty(Model._options, "keys");
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

				var NewCollection = Model.create(collectionSchema);

				new NewCollection();
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
