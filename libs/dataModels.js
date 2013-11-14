(function() {
	var store = function(args, scope) {
		var dfd = new _.Dfd();
		var resolveFunc = function(ret) {
			dfd.resolve(ret);
		};
		var rejectFunc = function(ret) {
			dfd.reject(ret);
		};
		scope = scope || this;
		
		if(typeof args === "undefined" || !args.method || !args.urn) {
			dfd.reject("Must Supply args object with method, url, and data");
			return dfd.promise();
		}

		args.data = args.data || {};
		args.method = args.method.toUpperCase();
		
		if(scope._options._store.remote) {

			if(args.method === "GET" && scope._options._store.localStorage && scope._options._ttl && new Date().getTime() > scope._options._ttl) {
				local(args, scope).done(resolveFunc).fail(rejectFunc);
			} else {

				ajax(args, scope).done(function(ret){
				
					if(scope._options._store.localStorage) {
						local(args, scope).done(resolveFunc).fail(rejectFunc);
					} else {
						dfd.resolve(ret);
					}

				}).fail(failFunc);
			}
		} else if(scope._options._store.localStorage) {
			local(args, scope).done(resolveFunc).fail(rejectFunc);
		}

		return dfd.promise();
	};

	var local = function(args, scope) {
		//self.Jive.Storage.set
	}

	var ajax = function(args, scope) {
		scope = scope || this;
		var dfd = new _.Dfd();
		
		if((args.method == "POST" || args.method == "PUT" || args.method == "PATCH") && args.data) {
			args.data = JSON.stringify(args.data);
		} else if((args.method == "GET" || args.method == "DELETE") && args.data){
			args.urn += "?" + $.param(args.data);
		}

		$.ajax({
			url: scope._options._store.remote.trim("/") + "/" + args.urn,
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
				headers: jqXhr.getAllResponseHeaders()
			});
		}).fail(function(jqXhr, status, error){
			dfd.reject({
				e: error,
				status: jqXhr.status,
				headers: jqXhr.getAllResponseHeaders()
			});
		});

		return dfd.promise();
	}

	var pubsub = self.Jive.Jazz;

	var initialize = function(args, scope) {
		scope = scope || this;
		args = args || {};
		
		for(var key in args) {
			scope[key] = args[key];
		}

		scope._options._persisted = scope.toJSON();
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
		
		if(args.force || (scope._options._ttl && new Date().getTime() > scope._options._ttl)) {
			store({ method: "GET", urn: scope.urn, data: args }, scope).done(function(ret) {
				if(_.isNormalObject(ret.data)) {
					for(var key in ret.data) {
						scope[key] = ret.data[key];
					}

					scope._persisted = scope.toJSON();

					if(ret.headers['Cache-Control'] !== "no-cache" && ret.headers['Expires']) {
						scope._options._ttl = new Date(ret.headers['Expires']).getTime();
						scope._options._lastModified = new Date(ret.headers['Last-Modified']).getTime(); 
					}
					
					pubsub.publish({
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
		var dfd = new _.Dfd();

		store({ method: "POST", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in args) {
				scope[key] = args[key];
			}

			scope._options._persisted = scope.toJSON();

			pubsub.publish({
				urn: scope.urn + ":posted",
				data: args
			});

			dfd.resolve(scope);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};

	Model.prototype.put = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		store({ method: "PUT", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in args) {
				scope[key] = args[key];
			}

			scope._options._persisted = scope.toJSON();

			pubsub.publish({
				urn: scope.urn + ":putted",
				data: scope.toJSON()
			});

			dfd.resolve(scope);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};

	Model.prototype.patch = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		store({ method: "PATCH", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in args) {
				scope[key] = args[key];
			}

			scope._options._persisted = scope.toJSON();

			pubsub.publish({
				urn: scope.urn + ":patched",
				data: args
			});

			dfd.resolve(scope);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};

	Model.prototype["delete"] = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		store({ method: "DELETE", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in scope) {
				delete scope[key];
			}

			pubsub.publish({
				urn: scope.urn + ":deleted",
				data: args
			});

			dfd.resolve(scope);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};

	Model.prototype.options = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		store({ method: "OPTIONS", urn: scope.urn, data: args }, scope).done(function(ret) {
			for(var key in args) {
				scope.options[key] = args[key];
			}

			dfd.resolve(scope);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};

	Model.prototype.head = function(args, scope) {
		scope = scope || this; args = args || {};
		var dfd = new _.Dfd();

		store({ method: "HEAD", urn: scope.urn, data: args }, scope).done(function(ret) {
			dfd.resolve(ret.headers);
		}).fail(function(ret) {
			dfd.reject(ret.error);
		});
	};
	//END RESTY MAGICS

	//EVENTING LAZY MAGICS
	Model.prototype.on = function(args, scope) {
		scope = scope || this;
		args = args || {};

		var sub = pubsub.subscribe({
			urn: scope.urn + ":" + args.event
		});

		return sub;
	};

	Model.prototype.off = function(args, scope) {
		scope = scope || this;
		args = args || {};

		if(typeof args.sub !== "undefined" && typeof args.sub.id !== "undefined"){
			pubsub.unsubscribe({
				id: args.sub.id
			});
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
		return scope._options._changes;
	};

	Model.prototype.changed = function(args, scope) {
		scope = scope || this;
		args = args || {};
		
		scope._options._changes = _.dirtyKeys(scope._persisted, scope.toJSON());
		console.log(scope._options._changes);
		pubsub.publish({
			urn: scope.urn + ":changed",
			data: scope._options._changes
		});
	};

	Model.prototype.set = function(args, scope) {
		scope = scope || this;
		args = args || {};

		scope[args.key] = args.val;

		scope._options._changes = scope._options._changes || {};
		scope._options._changes[args.key] = {
			aVal: scope._options._persisted[args.key],
			bVal: scope[args.val]
		};
		
		pubsub.publish({
			urn: scope.urn + ":setted",
			data: args
		});
		
		pubsub.publish({
			urn: scope.urn + ":changed",
			data: scope._options._changes
		});
	};
	//END SAVING CHANGE STUFFS

	//DATA MUNGING RETURNS
	Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
		scope = scope || this;
		args = args || {};
		var excludes = _.clone(scope._options._excludes);
		
		if(args.excludes) {
			_.extend(excludes, args.excludes);
		}

		var temp = {};
		for(var key in scope) {
			if(!excludes[key]) {
				temp[key] = scope[key];
			}
		}

		for(var key in scope._options._refs) {
			temp[key] = temp[key].urn;
		}

		temp = _.clone(temp, true);
	};

	Model.prototype.toVM = function(args, scope) {
		scope = scope || this;
		args = args || {};
		args.vm = args.vm || "default";
		var ret;

		var keys = scope._options._vms[args.vm];
		if(!keys || keys === "*") {
			return _.clone(scope, true, scope._options._excludes);
		} else {
			ret = {};
			
			keys.forEach(function(key) {
				if(scope._options._refs[key]) {
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
	Model.create = function(args, scope) {
		scope = scope || this;
		args = args || {};
		var schema = args.schema;

		var newModel = function(data, options) {
			var scope = this;
			data = data || {};
			options = options || {};

			scope._options = {
				_excludes: {
					_options: true
				}
			};

			//PARSE SCHEMA
			scope._options._urn = schema.urn;
			if(typeof schema.store === "undefined") {
				if (typeof window !== 'undefined') {
					if(document.localStorage) {
						scope._options._store = {"localStorage": "Jive:Data"};
					} else {
						scope._options._store = {"memory":"Jive.Data"};
					}
				} else {
					scope._options._store = {"mongo":"mongoConnectionUrl"};
				}
			} else {
				scope._options._store = schema.store;
			}
			if(typeof schema.vms === "undefined") {
				schema.vms = {
					"default": "*"
				};
			}
			scope._options._vms = schema.vms;

			scope._options._refs = schema.refs;
			_.extend(scope._options._excludes, scope._options._refs);
			//END PARSE SCHEMA
			//
			initialize();
			scope.initialize(data);
			return scope;
		};

		newModel.prototype = Object.create(Model.prototype);

		return newModel;
	};
	//END MODEL STATIC TO CREATE SUBCLASSES

	self.Jive.Model = Model;

})();