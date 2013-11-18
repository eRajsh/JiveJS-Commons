(function() {
	var urns = {};

	var isCollection = function(urn) {
		if(urn.match(/^\w+$/)) {
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
				local(args, scope).done(dfd.resolve).fail(dfd.reject);
			} else {

				ajax(args, scope).done(function(ret){
					if(scope._options.store.localStorage) {
						if(args.method === "GET") {
							args.method = "POST";
						}
						local(args, scope).done(function() {
							dfd.resolve(ret);
						}).fail(dfd.reject);
					} else {
						dfd.resolve(ret);
					}

				}).fail(dfd.reject);
			}
		} else if(scope._options.store.localStorage) {
			local(args, scope).done(dfd.resolve).fail(dfd.reject);
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
					self.Jive.Store.set(args.urn, ret).done(dfd.resolve).fail(dfd.reject);
				}).fail(dfd.reject);
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
				}).fail(dfd.reject);
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

		scope._options.pubsub.publish({
			urn: scope.urn + ":" + event,
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

		scope._options.pubsub.publish({
			urn: scope.urn + ":deleted",
			data: args
		});
	};

	var initialize = function(args, scope) {
		scope = scope || this;
		args = args || {};

		for(var key in scope._options.keys) {
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
		}

		for(var key in args) {
			scope[key] = args[key];
		}

		scope._options.subs = [];

		scope._options.pubsub = self.Jive.Jazz;

		scope._options.postFunc = postFunc.bind(scope, "posted");
		scope._options.putFunc = postFunc.bind(scope, "putted");
		scope._options.patchFunc = postFunc.bind(scope, "patched");
		scope._options.deleteFunc = deleteFunc.bind(scope);

		scope._options.persisted = scope.toJSON();

		scope.on("post").progress(function(ret) {
			console.log("WTF is ret in POST?", ret);
			scope._options.postFunc
		});
		scope.on("put").progress(function(ret) {
			console.log("WTF is ret in PUT?", ret);
			scope._options.putFunc;
		});
		scope.on("patch").progress(function(ret) {
			console.log("WTF is ret in PATCH?", ret);
			scope._options.patchFunc;
		});
		scope.on("delete").progress(function(ret) {
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
			store({ method: "GET", urn: scope.urn, data: args }, scope).done(function(ret) {
				if(_.isNormalObject(ret.data)) {

					if(scope._options.collection === false) {
						for(var key in ret.data) {
							scope[key] = ret.data[key];
						}
					} else {
						scope.entries = scope.entries || [];

						for(var i = 0; i < ret.data.entries.length; i++) {
							var model = findModel(ret.data.entries[i].urn);
							if(model) {
								scope.entries.push(new model(ret.data.entries[i]));
							} else {
								console.log("Couldn't find a model registered for", ret.data.entries[i]);
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

					scope._options.pubsub.publish({
						urn: scope.urn + ":gotted"
					});

					dfd.resolve(scope);
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

	var subSelect = function(entry, key) {
		var keys = key.split(".");

		var obj = entry.toJSON();

		for(var i = 0; i < keys.length; i++) {
			if(typeof obj[keys[i]] !== "undefined") {
				obj = obj[keys[i]];
			} else {
				return null;
			}
		}

		return obj;
	};

	var createFromLazyObject = function(obj, lazyObj) {
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

	var filterCheck = function(entry, filter) {
		for(var key in filter) {
			var obj = subSelect(entry, key);

			if(obj !== filter[key]) {
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

			if(typeof args.filter === "undefined" || (args.filter && filterCheck(entry, args.filter))) {
				var toPush = entry;

				if(args.select) {
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
	Model.prototype.on = function(args, scope) {
		scope = scope || this;
		args = args || {};

		var sub = scope._options.pubsub.subscribe({
			urn: scope.urn + ":" + args.event
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
		scope._options.pubsub.publish({
			urn: scope.urn + ":changed",
			data: scope._options.changes
		});
	};

	Model.prototype.set = function(args, scope) {
		scope = scope || this;
		args = args || {};

		scope[args.key] = args.val;

		scope._options.changes = scope._options.changes || {};
		scope._options.changes[args.key] = {
			aVal: scope._options.persisted[args.key],
			bVal: scope[args.val]
		};

		scope._options.pubsub.publish({
			urn: scope.urn + ":setted",
			data: args
		});

		scope._options.pubsub.publish({
			urn: scope.urn + ":changed",
			data: scope._options.changes
		});
	};
	//END SAVING CHANGE STUFFS

	//DATA MUNGING RETURNS
	Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
		scope = scope || this;
		args = args || {};

		var excludes = _.clone(scope._options.excludes);

		if(args.excludes) {
			_.extend(excludes, args.excludes);
		}

		var temp = {};
		var keys = Object.keys(scope);
		for(var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if(!excludes[key]) {
				temp[key] = scope[key];
			}
		}

		for(var key in scope._options.refs) {
			if(temp[key] && temp[key].urn) {
				temp[key] = temp[key].urn;
			}
		}

		temp = _.clone(temp, true);

		return temp;
	};

	Model.prototype.toVM = function(args, scope) {
		scope = scope || this;
		args = args || {};
		args.vm = args.vm || "default";
		var ret;

		var keys = scope._options.vms[args.vm];
		if(!keys || keys === "*") {
			return _.clone(scope, true, scope._options.excludes);
		} else {
			ret = {};

			keys.forEach(function(key) {
				if(scope._options.refs[key]) {
					ret[key] = scope[key].toVM(args);
				} else {
					ret[key] = _.clone(scope[key], true, {});
				}
			});

			return ret;
		}
	};
	//END DATA MUNGING RETURNS

	//MODEL STATIC TO CREATE SUBCLASSES

	var parseSchema = function(schema, scope) {
		scope._options.urn = schema.urn;

		urns[scope._options.urn] = {
			regex: _.createRegex({urn: scope._options.urn}),
			model: scope
		};

		scope._options.collection = isCollection(scope._options.urn);

		if(typeof schema.store === "undefined") {
			if (typeof window !== 'undefined') {
				if(document.localStorage) {
					scope._options.store = {"localStorage": "Jive:Data"};
				} else {
					scope._options.store = {"memory":"Jive.Data"};
				}
			} else {
				scope._options.store = {"mongo":"mongoConnectionUrl"};
			}
		} else {
			scope._options.store = schema.store;
		}

		if(typeof schema.vms === "undefined") {
			schema.vms = {
				"default": "*"
			};
		}
		scope._options.vms = schema.vms;

		scope._options.refs = schema.refs;
		_.extend(scope._options.excludes, scope._options.refs);

		scope._options.keys = schema.keys || {};
	};

	Model.create = function(schema) {
		var newModel = function(data, options) {
			var scope = this;
			data = data || {};
			options = options || {};

			scope._options = _.clone(newModel._options);

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

		return newModel;
	};
	//END MODEL STATIC TO CREATE SUBCLASSES
	_.newModel = Model;

})();
