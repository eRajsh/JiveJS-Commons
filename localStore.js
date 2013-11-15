(function () {

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

				if (options && options.json)
					data = JSON.stringify(data);

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
							type: 'text/plain'
						});

						fileWriter.write(blob);
					}, makeErrorHandler(dfd));
				}, makeErrorHandler(dfd));

				return dfd.promise();
			},

			list: function (docKey) {
				var isRoot = false;
				if (!docKey) {
					docKey = this._prefix;
					isRoot = true;
				}

				var dfd = new _.Dfd();

				this._fs.root.getDirectory(docKey, {
						create: false
					},
					function (entry) {
						var reader = entry.createReader();
						readDirEntries(reader, []).then(function (entries) {
							var listing = [];
							entries.forEach(function (entry) {
								if (!entry.isDirectory) {
									listing.push(entry.name);
								}
							});
							dfd.resolve(listing);
						});
					}, function (error) {
						dfd.reject(error);
					});

				return dfd.promise();
			},

			clear: function () {
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
							var latch =
								utils.countdown(entries.length, function () {
									if (!failed)
										dfd.resolve();
								});

							entries.forEach(function (entry) {
								if (entry.isDirectory) {
									entry.removeRecursively(latch, ecb);
								} else {
									entry.remove(latch, ecb);
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
				window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
				var persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;

				if (!requestFileSystem) {
					dfd.reject("No FSAPI");
					return dfd.promise();
				}

				var prefix = config.name + '/';
				persistentStorage.requestQuota(config.size, function (numBytes) {
					requestFileSystem(window.PERSISTENT, numBytes, function (fs) {
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
		var URL = window.URL || window.webkitURL;

		function IDB(db) {
			this._db = db;
			this.type = 'IndexedDB';

			this._supportsBlobs = false;
		}

		// TODO: normalize returns and errors.
		IDB.prototype = {
			get: function (docKey) {
				var dfd = new _.Dfd();
				var transaction = this._db.transaction(['files'], 'readonly');

				var get = transaction.objectStore('files').get(docKey);
				get.onsuccess = function (e) {
					dfd.resolve(e.target.result);
				};

				get.onerror = function (e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			set: function (docKey, data) {
				var dfd = new _.Dfd();
				var transaction = this._db.transaction(['files'], 'readwrite');

				var put = transaction.objectStore('files').put(data, docKey);
				put.onsuccess = function (e) {
					dfd.resolve(e);
				};

				put.onerror = function (e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			remove: function (docKey) {
				var dfd = new _.Dfd();

				var transaction = this._db.transaction(['files'], 'readwrite');

				var del = transaction.objectStore('files').delete(docKey);

				del.onsuccess = function (e) {
					dfd.resolve();
				};

				del.onerror = function (e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			list: function (docKey) {
				var dfd = new _.Dfd();

				var transaction = this._db.transaction(['files'], 'readonly');
				var cursor = transaction.objectStore(store).openCursor();
				var listing = [];

				cursor.onsuccess = function (e) {
					var cursor = e.target.result;
					if (cursor) {
						listing.push(!docKey ? cursor.key : cursor.key.split('/')[1]);
						cursor.continue();
					} else {
						dfd.resolve(listing);
					}
				};

				cursor.onerror = function (e) {
					dfd.reject(e);
				};

				return dfd.promise();
			},

			clear: function () {
				var dfd = new _.Dfd();

				var t = this._db.transaction(['files'], 'readwrite');

				var req1 = t.objectStore('files').clear();

				req1.onsuccess = function () {
					dfd.resolve();
				};

				req1.onerror = function (err) {
					dfd.reject(err);
				};

				return dfd.promise();
			}
		};

		return {
			init: function (config) {
				var dfd = new _.Dfd();

				var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
					IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
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
		var URL = window.URL || window.webkitURL;

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
								if (options && options.json)
									data = JSON.parse(data);
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
				if (options && options.json)
					data = JSON.stringify(data);

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

			list: function (docKey) {
				var dfd = new _.Dfd();

				var select = 'SELECT fname FROM files';
				var field = 'fname';

				this._db.transaction(function (tx) {
					tx.executeSql(select, docKey ? [docKey] : [],
						function (tx, res) {
							var listing = [];
							for (var i = 0; i < res.rows.length; ++i) {
								listing.push(res.rows.item(i)[field]);
							}

							dfd.resolve(listing);
						}, function (err) {
							dfd.reject(err);
						});
				});

				return dfd.promise();
			},

			clear: function () {
				var dfd = new _.Dfd();

				this._db.transaction(function (tx) {
					tx.executeSql('DELETE FROM files', function () {
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
				var openDb = window.openDatabase;
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
				dfd.resolve(this.store.getItem(this._prefix + docKey));
				return dfd.promise();
			},

			set: function(docKey, data, options) {
				var dfd = new _.Dfd();
				this.store.setItem(this._prefix + docKey, data);
				dfd.resolve();
				return dfd.promise();
			},

			remove: function(docKey, options) {
				var dfd = new _.Dfd();
				this.store.remove(this._prefix + docKey);
				dfd.resolve();
				return dfd.promise();
			}, 

			list: function() {
				var dfd = new _.Dfd();
				var listing = Object.keys(this.store);
				var ret = [];
				listing.forEach(function(item) {
					if(item.indexOf(this._prefix) === 0) {
						ret.push(item.substr(this._prefix.length - 1));
					}
				});
				dfd.resolve(ret);
				return dfd.promise();
			},

			clear: function() {
				var dfd = new _.Dfd();
				var listing = Object.keys(this.store);
				listing.forEach(function(item) {
					if(item.indexOf(this._prefix) === 0) {
						this.store.remove(item);
					}
				});
				dfd.resolve();
				return dfd.promise();
			}
		}

		return {
			init: function (config) {
				var dfd = new _.Dfd();
				dfd.resolve(new LS(config));
				return dfd.promise();
			}
		}
	})();

	var LargeLocalStorage = (function () {

		var providers = {
			FileSystemAPI: FilesystemAPIProvider,
			IndexedDB: IndexedDBProvider,
			WebSQL: WebSQLProvider,
			LocalStorage: LocalStorageProvider,
			SessionStorage: LocalStorageProvider
		}

		var defaultConfig = {
			size: 10 * 1024 * 1024,
			name: 'lls'
		};

		function selectImplementation(config) {
			if (!config) config = {};
			config = _.defaults(config, defaultConfig);

			if (config.forceProvider) {
				return providers[config.forceProvider].init(config);
			}

			var dfd = new _.Dfd();

			FilesystemAPIProvider.init(config).done(function(ret) {
				console.log("you gonna resolve?")
				dfd.resolve(ret);
			}).fail(function() {
				console.log("WASSUP")
				IndexedDBProvider.init(config).done(dfd.resolve).fail(function() {
					WebSQLProvider.init(config).done(dfd.resolve).fail(function() {
						LocalStorageProvider.init(config).done(dfd.resolve).fail(function() {
							dfd.reject("I have nothing.... leave me alone :(");
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
				console.log('Selected: ' + impl.type);
				scope._impl = impl;
				dfd.resolve(scope);
			}).fail(function(e) {
				dfd.reject('No storage provider found');
			});

			scope.initialized = dfd.promise();
			scope.initialized.done(function() {
				console.log("HEY INITEDED WOOOOOT")
			})
			return scope;
		}

		LargeLocalStorage.prototype = {
			
			ready: function () {
				return scope.initialized;
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
	_.LargeLocalStorage = LargeLocalStorage;
	return LargeLocalStorage;
})();