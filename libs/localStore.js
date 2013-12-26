(function (self) {
	var countdown = function(n, cb) {
		var args = [];
		return function() {
			for (var i = 0; i < arguments.length; ++i)
				args.push(arguments[i]);
			n -= 1;
			if (n == 0)
				cb.apply(this, args);
		};
	}
	var FilesystemAPIProvider = (function () {
		function makeErrorHandler(dfd, finalDfd) {
			return function (e) {
				if (e.code == 1) {
					dfd.resolve(undefined);
				} else {
					if (finalDfd)
						finalDfd.reject(e);
					else
						dfd.reject(e);
				}
			}
		}

		function readDirEntries(reader, result) {
			var dfd = new _.Dfd()

			_readDirEntries(reader, result, dfd);

			return dfd.promise();
		}

		function _readDirEntries(reader, result, dfd) {
			reader.readEntries(function (entries) {
				if (entries.length == 0) {
					dfd.resolve(result);
				} else {
					result = result.concat(entries);
					_readDirEntries(reader, result, dfd);
				}
			}, function (err) {
				dfd.reject(err);
			});
		}

		function entryToFile(entry, cb, eb) {
			entry.file(cb, eb);
		}

		function FSAPI(fs, numBytes, prefix) {
			this._fs = fs;
			this._capacity = numBytes;
			this._prefix = prefix;
			this.type = "FilesystemAPI";
		}

		FSAPI.prototype = {
			get: function (path, options) {
				var dfd = new _.Dfd();
				path = this._prefix + path;
				this._fs.root.getFile(path, {}, function (fileEntry) {
					fileEntry.file(function (file) {
						var reader = new FileReader();

						reader.onloadend = function (e) {
							var data = e.target.result;
							var err;
							if (options && options.json) {
								try {
									data = JSON.parse(data);
								} catch (e) {
									err = new Error('unable to parse JSON for ' + path);
								}
							}

							if (err) {
								dfd.reject(err);
							} else {
								dfd.resolve(data);
							}
						};

						reader.readAsText(file);
					}, makeErrorHandler(dfd));
				}, makeErrorHandler(dfd));

				return dfd.promise();
			},

			// create a file at path
			// and write `data` to it
			set: function (path, data, options) {
				var dfd = new _.Dfd();

				if (options && options.json) {
					data = JSON.stringify(data);
				}

				path = this._prefix + path;
				this._fs.root.getFile(path, {
					create: true
				}, function (fileEntry) {
					fileEntry.createWriter(function (fileWriter) {
						var blob;
						fileWriter.onwriteend = function (e) {
							fileWriter.onwriteend = function () {
								dfd.resolve();
							};
							fileWriter.truncate(blob.size);
						}

						fileWriter.onerror = makeErrorHandler(dfd);

						blob = new Blob([data], {
							type: 'application/json'
						});

						fileWriter.write(blob);
					}, makeErrorHandler(dfd));
				}, makeErrorHandler(dfd));

				return dfd.promise();
			},

			list: function (options) {
				options = options || {};
				var dfd = new _.Dfd();

				this._fs.root.getDirectory(this._prefix, {
						create: false
					},
					function (entry) {
						var reader = entry.createReader();
						readDirEntries(reader, []).then(function (entries) {
							var listing = [];
							entries.forEach(function (entry) {
								if (!entry.isDirectory) {
									if(options.prefix) {
										if(entry.name.indexOf(options.prefix) === 0) {
											listing.push(entry.name);
										}
									} else {
										listing.push(entry.name);
									}
								}
							});
							dfd.resolve(listing);
						});
					}, function (error) {
						dfd.reject(error);
					});

				return dfd.promise();
			},

			clear: function (options) {
				options = options || {};
				var dfd = new _.Dfd();
				var failed = false;
				var ecb = function (err) {
					failed = true;
					dfd.reject(err);
				}

				this._fs.root.getDirectory(this._prefix, {},
					function (entry) {
						var reader = entry.createReader();
						reader.readEntries(function (entries) {
							var latch = countdown(entries.length, function () {
								if (!failed) {
									dfd.resolve();
								}
							});

							entries.forEach(function (entry) {
								if (entry.isDirectory) {
									entry.removeRecursively(latch, ecb);
								} else {
									if(options.prefix) {
										if(entry.name.indexOf(options.prefix) === 0) {
											entry.remove(latch, ecb);
										}
									} else {
										entry.remove(latch, ecb);
									}
								}
							});

							if (entries.length == 0)
								dfd.resolve();
						}, ecb);
					}, ecb);

				return dfd.promise();
			},

			remove: function (path) {
				var dfd = new _.Dfd();
				var finalDfd = new _.Dfd();

				// remove attachments that go along with the path
				path = this._prefix + path;

				this._fs.root.getFile(path, {
						create: false
					},
					function (entry) {
						entry.remove(function () {
							dfd.done(finalDfd.resolve);
						}, function (err) {
							finalDfd.reject(err);
						});
					},
					makeErrorHandler(finalDfd));

				return finalDfd.promise();
			},

			getCapacity: function () {
				return this._capacity;
			}
		};

		return {
			init: function (config) {
				var dfd = new _.Dfd();

				self.requestFileSystem = self.requestFileSystem || self.webkitRequestFileSystem;
				var persistentStorage = navigator.persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;
				var temporaryStorage = navigator.temporaryStorage = navigator.temporaryStorage || navigator.webkitTemporaryStorage;
				self.resolveLocalFileSystemURL = self.resolveLocalFileSystemURL || self.webkitResolveLocalFileSystemURL;

				if (!requestFileSystem) {
					dfd.reject("No FSAPI");
					return dfd.promise();
				}

				var prefix = config.name + '/';
				persistentStorage.requestQuota(config.size, function (numBytes) {
					requestFileSystem(PERSISTENT, numBytes, function (fs) {
						fs.root.getDirectory(config.name, { create: true }, function () {
							dfd.resolve(new FSAPI(fs, numBytes, prefix));
						}, function (err) {
							dfd.reject(err);
						});
					}, function (err) {
						dfd.reject(err);
					});
				}, function (err) {
					dfd.reject(err);
				});
				return dfd.promise();
			}
		}
	})();

	var IndexedDBProvider = (function () {
		var URL = self.URL || self.webkitURL;

		function IDB(db) {
			this._db = db;
			this.type = 'IndexedDB';

			this._supportsBlobs = false;
		}

		// TODO: normalize returns and errors.
		IDB.prototype = {
			get: function (docKey, options) {
				var dfd = new _.Dfd();
				var transaction = this._db.transaction(['files'], 'readonly');

				var get = transaction.objectStore('files').get(docKey);
				get.onsuccess = function (e) {
					var data = e.target.result;
					if(options && options.json) {
						data = JSON.parse(data);
					}
					dfd.resolve(data);
				};

				get.onerror = function(e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			set: function (docKey, data, options) {
				var dfd = new _.Dfd();
				var transaction = this._db.transaction(['files'], 'readwrite');

				if(options && options.json) {
					data = JSON.stringify(data);
				}

				var put = transaction.objectStore('files').put(data, docKey);
				put.onsuccess = function(e) {
					dfd.resolve(e.target.result);
				};

				put.onerror = function(e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			remove: function (docKey) {
				var dfd = new _.Dfd();

				var transaction = this._db.transaction(['files'], 'readwrite');

				var del = transaction.objectStore('files').delete(docKey);

				put.onsuccess = function(e) {
					dfd.resolve(e.target.result);
				};

				del.onerror = function(e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			list: function (options) {
				options = options || {};
				var dfd = new _.Dfd();

				var transaction = this._db.transaction(['files'], 'readonly');
				var cursor = transaction.objectStore(store).openCursor();
				var listing = [];

				cursor.onsuccess = function (e) {
					var cursor = e.target.result;
					if (cursor) {

						if(options.prefix) {
							if(cursor.key.indexOf(options.prefix) === 0) {
								listing.push(cursor.key);
							}
						} else {
							listing.push(cursor.key);
						}

						listing.push(cursor.key);
						cursor.continue();
					} else {
						dfd.resolve(listing);
					}
				};

				cursor.onerror = function(e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			clear: function (options) {
				options = options || {};
				var dfd = new _.Dfd();

				var t = this._db.transaction(['files'], 'readwrite');

				if(!options.prefix) {
					var req1 = t.objectStore('files').clear();
					req1.onsuccess = function(e) {
						dfd.resolve(e.target.result);
					};

					req1.onerror = function(e) {
						dfd.reject(e);
					};
				} else {
					var scope = this;
					this.list(options).done(function(listing) {

						var dfds = [true];
						listing.forEach(function(item) {
							dfds.push(scope.remove(item));
						});

						_.Dfd.when(dfds).done(function(ret) {
							dfd.resolve(ret);
						}).fail(function(e) {
							dfd.reject(e);
						});

					}).fail(function(e) {
						dfd.reject(e);
					});
				}

				return dfd.promise();
			}
		};

		return {
			init: function (config) {
				var dfd = new _.Dfd();

				var indexedDB = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB,
					IDBTransaction = self.IDBTransaction || self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction,
					dbVersion = 2;

				if (!indexedDB || !IDBTransaction) {
					dfd.reject("No IndexedDB");
					return dfd.promise();
				}

				var request = indexedDB.open(config.name, dbVersion);

				function createObjectStore(db) {
					db.createObjectStore("files");
				}

				// TODO: normalize errors
				request.onerror = function (event) {
					dfd.reject(event);
				};

				request.onsuccess = function (event) {
					var db = request.result;

					db.onerror = function (event) {
						console.log(event);
					};

					// Chrome workaround
					if (db.setVersion) {
						if (db.version != dbVersion) {
							var setVersion = db.setVersion(dbVersion);
							setVersion.onsuccess = function () {
								createObjectStore(db);
								dfd.resolve();
							};
						} else {
							dfd.resolve(new IDB(db));
						}
					} else {
						dfd.resolve(new IDB(db));
					}
				}

				request.onupgradeneeded = function (event) {
					createObjectStore(event.target.result);
				};

				return dfd.promise();
			}
		}
	})();

	var WebSQLProvider = (function () {
		var URL = self.URL || self.webkitURL;

		function WSQL(db) {
			this._db = db;
			this.type = 'WebSQL';
		}

		WSQL.prototype = {
			get: function (docKey, options) {
				var dfd = new _.Dfd();
				this._db.transaction(function (tx) {
					tx.executeSql('SELECT value FROM files WHERE fname = ?', [docKey],
						function (tx, res) {
							if (res.rows.length == 0) {
								dfd.resolve(undefined);
							} else {
								var data = res.rows.item(0).value;
								if (options && options.json) {
									data = JSON.parse(data);
								}
								dfd.resolve(data);
							}
						});
				}, function (err) {
					dfd.reject(err);
				});

				return dfd.promise();
			},

			set: function (docKey, data, options) {
				var dfd = new _.Dfd();
				if (options && options.json) {
					data = JSON.stringify(data);
				}

				this._db.transaction(function (tx) {
					tx.executeSql(
						'INSERT OR REPLACE INTO files (fname, value) VALUES(?, ?)', [docKey, data]);
				}, function (err) {
					dfd.reject(err);
				}, function () {
					dfd.resolve();
				});

				return dfd.promise();
			},

			remove: function (docKey) {
				var dfd = new _.Dfd();

				this._db.transaction(function (tx) {
					tx.executeSql('DELETE FROM files WHERE fname = ?', [docKey]);
				}, function (err) {
					dfd.reject(err);
				}, function () {
					dfd.resolve();
				});

				return dfd.promise();
			},

			list: function (options) {
				options = options || {};
				var dfd = new _.Dfd();

				var select = 'SELECT fname FROM files';
				var vals = [];

				if(options.prefix) {
					select += ' WHERE fname LIKE ?'
					vals = [options.prefix+'%']
				}

				this._db.transaction(function (tx) {
					tx.executeSql(select, vals,
						function (tx, res) {
							var listing = [];
							for (var i = 0; i < res.rows.length; ++i) {
								listing.push(res.rows.item(i)['fname']);
							}

							dfd.resolve(listing);
						}, function (err) {
							dfd.reject(err);
						});
				});

				return dfd.promise();
			},

			clear: function (options) {
				options = options || {};
				var dfd = new _.Dfd();

				var query = 'DELETE FROM files';
				var vals = [];

				if(options.prefix) {
					query += ' WHERE fname LIKE ?'
					vals = [options.prefix+'%']
				}

				this._db.transaction(function (tx) {
					tx.executeSql(query, vals, function () {
						dfd.resolve();
					});

				}, function (err) {
					dfd.reject(err);
				});

				return dfd.promise();
			}
		};

		return {
			init: function (config) {
				var openDb = self.openDatabase;
				var dfd = new _.Dfd();
				if (!openDb) {
					dfd.reject("No WebSQL");
					return dfd.promise();
				}

				var db = openDb(config.name, '1.0', 'large local storage', config.size);

				db.transaction(function (tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS files (fname unique, value)');
				}, function (err) {
					dfd.reject(err);
				}, function () {
					dfd.resolve(new WSQL(db));
				});

				return dfd.promise();
			}
		}
	})();

	var LocalStorageProvider = (function () {
		function LS(options) {
			if(!options.type) {
				options.type = "LocalStorage";
			}
			this.type = options.type;
			if(this.type === "SessionStorage") {
				this.store = sessionStorage;
			} else {
				this.store = localStorage;
			}
			this._prefix = options.name + ":";
		}

		LS.prototype = {
			get: function(docKey, options) {
				var dfd = new _.Dfd();
				var data = this.store.getItem(this._prefix + docKey);
				if(options && options.json) {
					data = JSON.parse(data);
				}
				dfd.resolve(data);
				return dfd.promise();
			},

			set: function(docKey, data, options) {
				var dfd = new _.Dfd();
				if(options && options.json) {
					data = JSON.stringify(data);
				}
				this.store.setItem(this._prefix + docKey, data);
				dfd.resolve();
				return dfd.promise();
			},

			remove: function(docKey, options) {
				var dfd = new _.Dfd();
				this.store.removeItem(this._prefix + docKey);
				dfd.resolve();
				return dfd.promise();
			},

			list: function(options) {
				options = options || {};
				var that = this;
				var dfd = new _.Dfd();
				var listing = Object.keys(this.store);
				var ret = [];
				var prefix = this._prefix;
				if(options.prefix) {
					prefix += options.prefix;
				}
				listing.forEach(function(item) {
					if(item.indexOf(prefix) === 0) {
						ret.push(item.substr(that._prefix.length - 1));
					}
				});
				dfd.resolve(ret);
				return dfd.promise();
			},

			clear: function(options) {
				options = options || {};
				var that = this;
				var dfd = new _.Dfd();
				var listing = Object.keys(this.store);
				var prefix = this._prefix;
				if(options.prefix) {
					prefix += options.prefix;
				}
				listing.forEach(function(item) {
					if(item.indexOf(prefix) === 0) {
						that.store.removeItem(item);
					}
				});
				dfd.resolve();
				return dfd.promise();
			}
		};

		return {
			init: function (config) {
				var dfd = new _.Dfd();

				if(this.type === "SessionStorage" && !self.sessionStorage) {
					dfd.resolve(new LS(config));
				} else if(this.type === "LocalStorage" && !self.localStorage) {
					dfd.resolve(new LS(config));
				} else {
					dfd.reject();
				}

				return dfd.promise();
			}
		};
	})();

	var ChromeStorageProvider = (function () {
		function CS(options) {
			this.store = chrome.storage.local;
			this._prefix = options.name + ":";
		}

		CS.prototype = {
			get: function(docKey, options) {
				var dfd = new _.Dfd();
				var data = this.store.get(this._prefix + docKey, function(data) {
					if(chrome.runtime.lastError) {
						dfd.reject(chrome.runtime.lastError);
					} else {
						if(options && options.json) {
							data = JSON.parse(data);
						}
						dfd.resolve(data);
					}
				});
				return dfd.promise();
			},

			set: function(docKey, data, options) {
				var dfd = new _.Dfd();
				if(options && options.json) {
					data = JSON.stringify(data);
				}

				var toSet = {};
				toSet[this._prefix + docKey] = data;

				this.store.set(toSet, function() {
					if(chrome.runtime.lastError) {
						dfd.reject(chrome.runtime.lastError);
					} else {
						dfd.resolve();
					}
				});

				return dfd.promise();
			},

			remove: function(docKey, options) {
				var dfd = new _.Dfd();
				this.store.remove(this._prefix + docKey, function() {
					if(chrome.runtime.lastError) {
						dfd.reject(chrome.runtime.lastError);
					} else {
						dfd.resolve();
					}
				});
				return dfd.promise();
			},

			list: function(options) {
				options = options || {};
				var that = this;
				var dfd = new _.Dfd();

				var prefix = this._prefix;
				if(options.prefix) {
					prefix += options.prefix;
				}

				this.store.get(null, function(listing) {
					var ret = [];

					if(chrome.runtime.lastError) {
						dfd.reject(chrome.runtime.lastError);
					} else {
						for (var key in items) {
							if(key.indexOf(prefix) === 0) {
								ret.push(key.substr(that._prefix.length - 1));
							}
						}

						dfd.resolve(ret);
					}
				});

				return dfd.promise();
			},

			clear: function(options) {
				options = options || {};
				var that = this;
				var dfd = new _.Dfd();
				var dfds = [true];

				var prefix = this._prefix;
				if(options.prefix) {
					prefix += options.prefix;
				}

				this.store.get(null, function(listing) {
					var ret = [];

					if(chrome.runtime.lastError) {
						dfd.reject(chrome.runtime.lastError);
					} else {
						function remove(key) {
							var removeDfd = new _.Dfd();
							dfds.push(removeDfd.promise());

							this.store.remove(key, function() {
								if(chrome.runtime.lastError) {
									removeDfd.reject(chrome.runtime.lastError);
								} else {
									removeDfd.resolve();
								}
							});
						}

						for (var key in items) {
							remove(key);
						}

						dfd.resolve(ret);
					}
				});

				_.Dfd.when(dfds).done(function(rets) {
					// remove the true from the resolves of dfds
					rets.shift();
					dfd.resolve(rets);
				}).fail(function(errors) {
					// remove the true from the rejects of dfds
					errors.shift();
					dfd.resolve(errors);
				});

				return dfd.promise();
			}
		};

		return {
			init: function (config) {
				var dfd = new _.Dfd();

				if(chrome && chrome.storage && chrome.storage.local) {
					dfd.resolve(new CS(config));
				} else {
					dfd.reject();
				}

				return dfd.promise();
			}
		};
	})();

	var LargeLocalStorage = (function () {

		var providers = {
			FileSystemAPI: FilesystemAPIProvider,
			IndexedDB: IndexedDBProvider,
			WebSQL: WebSQLProvider,
			LocalStorage: LocalStorageProvider,
			SessionStorage: LocalStorageProvider,
			ChromeStorageProvider: ChromeStorageProvider
		};

		var defaultConfig = {
			size: 10 * 1024 * 1024,
			name: 'lls'
		};

		function selectImplementation(config) {
			if (!config) config = {};
			for(var key in defaultConfig) {
				config[key] = config[key] || defaultConfig[key];
			}

			if (config.forceProvider) {
				return providers[config.forceProvider].init(config);
			}

			var dfd = new _.Dfd();

			ChromeStorageProvider.init(config).done(function(ret) {
				dfd.resolve(ret)
			}).fail(function() {
				LocalStorageProvider.init(config).done(function(ret) {
					dfd.resolve(ret)
				}).fail(function() {
					IndexedDBProvider.init(config).done(function(ret) {
						dfd.resolve(ret)
					}).fail(function() {
						FilesystemAPIProvider.init(config).done(function(ret) {
							dfd.resolve(ret)
						}).fail(function() {
							WebSQLProvider.init(config).done(function(ret) {
								dfd.resolve(ret)
							}).fail(function() {
								dfd.reject("I have nothing.... leave me alone :(");
							});
						});
					});
				});
			});

			return dfd.promise();
		}

		function LargeLocalStorage(config) {
			var scope = this;
			var dfd = new _.Dfd();
			selectImplementation(config).done(function (impl) {
				scope._impl = impl;
				dfd.resolve(scope);
			}).fail(function(e) {
				dfd.reject('No storage provider found');
			});

			scope.initialized = dfd.promise();
			return scope;
		}

		LargeLocalStorage.prototype = {

			ready: function () {
				return this.initialized;
			},

			list: function (docKey) {
				this._checkAvailability();
				return this._impl.list(docKey);
			},

			remove: function (docKey) {
				this._checkAvailability();
				return this._impl.remove(docKey);
			},

			clear: function () {
				this._checkAvailability();
				return this._impl.clear();
			},

			get: function (docKey, options) {
				this._checkAvailability();
				return this._impl.get(docKey, options);
			},

			set: function (docKey, data, options) {
				this._checkAvailability();
				return this._impl.set(docKey, data, options);
			},

			getCapacity: function () {
				this._checkAvailability();
				if (this._impl.getCapacity)
					return this._impl.getCapacity();
				else
					return -1;
			},

			_checkAvailability: function () {
				if (!this._impl) {
					throw {
						msg: "No storage implementation is available yet.  The user most likely has not granted you app access to FileSystemAPI or IndexedDB",
						code: "NO_IMPLEMENTATION"
					};
				}
			}

		};

		return LargeLocalStorage;
	})();

	self._ = self._ || {};
	self._.LargeLocalStorage = LargeLocalStorage;
	return LargeLocalStorage;

})(typeof self !== "undefined" ? self : this);

