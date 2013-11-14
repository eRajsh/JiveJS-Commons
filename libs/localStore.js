(function () {

	var FilesystemAPIProvider = (function (Q) {
		function makeErrorHandler(deferred, finalDeferred) {
			return function (e) {
				if (e.code == 1) {
					deferred.resolve(undefined);
				} else {
					if (finalDeferred)
						finalDeferred.reject(e);
					else
						deferred.reject(e);
				}
			}
		}

		function readDirEntries(reader, result) {
			var deferred = Q.defer();

			_readDirEntries(reader, result, deferred);

			return deferred.promise;
		}

		function _readDirEntries(reader, result, deferred) {
			reader.readEntries(function (entries) {
				if (entries.length == 0) {
					deferred.resolve(result);
				} else {
					result = result.concat(entries);
					_readDirEntries(reader, result, deferred);
				}
			}, function (err) {
				deferred.reject(err);
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
			getContents: function (path, options) {
				var deferred = Q.defer();
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
								deferred.reject(err);
							} else {
								deferred.resolve(data);
							}
						};

						reader.readAsText(file);
					}, makeErrorHandler(deferred));
				}, makeErrorHandler(deferred));

				return deferred.promise;
			},

			// create a file at path
			// and write `data` to it
			setContents: function (path, data, options) {
				var deferred = Q.defer();

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
								deferred.resolve();
							};
							fileWriter.truncate(blob.size);
						}

						fileWriter.onerror = makeErrorHandler(deferred);

						if (data instanceof Blob) {
							blob = data;
						} else {
							blob = new Blob([data], {
								type: 'text/plain'
							});
						}

						fileWriter.write(blob);
					}, makeErrorHandler(deferred));
				}, makeErrorHandler(deferred));

				return deferred.promise;
			},

			ls: function (docKey) {
				var isRoot = false;
				if (!docKey) {
					docKey = this._prefix;
					isRoot = true;
				} else docKey = this._prefix + docKey + "-attachments";

				var deferred = Q.defer();

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
							deferred.resolve(listing);
						});
					}, function (error) {
						deferred.reject(error);
					});

				return deferred.promise;
			},

			clear: function () {
				var deferred = Q.defer();
				var failed = false;
				var ecb = function (err) {
					failed = true;
					deferred.reject(err);
				}

				this._fs.root.getDirectory(this._prefix, {},
					function (entry) {
						var reader = entry.createReader();
						reader.readEntries(function (entries) {
							var latch =
								utils.countdown(entries.length, function () {
									if (!failed)
										deferred.resolve();
								});

							entries.forEach(function (entry) {
								if (entry.isDirectory) {
									entry.removeRecursively(latch, ecb);
								} else {
									entry.remove(latch, ecb);
								}
							});

							if (entries.length == 0)
								deferred.resolve();
						}, ecb);
					}, ecb);

				return deferred.promise;
			},

			rm: function (path) {
				var deferred = Q.defer();
				var finalDeferred = Q.defer();

				// remove attachments that go along with the path
				path = this._prefix + path;
				var attachmentsDir = path + "-attachments";

				this._fs.root.getFile(path, {
						create: false
					},
					function (entry) {
						entry.remove(function () {
							deferred.promise.then(finalDeferred.resolve);
						}, function (err) {
							finalDeferred.reject(err);
						});
					},
					makeErrorHandler(finalDeferred));

				this._fs.root.getDirectory(attachmentsDir, {},
					function (entry) {
						entry.removeRecursively(function () {
							deferred.resolve();
						}, function (err) {
							finalDeferred.reject(err);
						});
					},
					makeErrorHandler(deferred, finalDeferred));

				return finalDeferred.promise;
			},

			getCapacity: function () {
				return this._capacity;
			}
		};

		return {
			init: function (config) {
				var deferred = Q.defer();
				window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
				var persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;

				if (!requestFileSystem) {
					deferred.reject("No FS API");
					return deferred.promise;
				}

				var prefix = config.name + '/';

				persistentStorage.requestQuota(config.size,
					function (numBytes) {
						requestFileSystem(window.PERSISTENT, numBytes,
							function (fs) {
								fs.root.getDirectory(config.name, {
										create: true
									},
									function () {
										deferred.resolve(new FSAPI(fs, numBytes, prefix));
									}, function (err) {
										console.error(err);
										deferred.reject(err);
									});
							}, function (err) {
								// TODO: implement various error messages.
								console.error(err);
								deferred.reject(err);
							});
					}, function (err) {
						// TODO: implement various error messages.
						console.error(err);
						deferred.reject(err);
					});

				return deferred.promise;
			}
		}
	})(Q);

	var IndexedDBProvider = (function (Q) {
		var URL = window.URL || window.webkitURL;

		var convertToBase64 = utils.convertToBase64;
		var dataURLToBlob = utils.dataURLToBlob;

		function IDB(db) {
			this._db = db;
			this.type = 'IndexedDB';

			var transaction = this._db.transaction(['attachments'], 'readwrite');
			this._supportsBlobs = true;
			try {
				transaction.objectStore('attachments')
					.put(Blob(["sdf"], {
						type: "text/plain"
					}), "featurecheck");
			} catch (e) {
				this._supportsBlobs = false;
			}
		}

		// TODO: normalize returns and errors.
		IDB.prototype = {
			getContents: function (docKey) {
				var deferred = Q.defer();
				var transaction = this._db.transaction(['files'], 'readonly');

				var get = transaction.objectStore('files').get(docKey);
				get.onsuccess = function (e) {
					deferred.resolve(e.target.result);
				};

				get.onerror = function (e) {
					deferred.reject(e);
				};

				return deferred.promise;
			},

			setContents: function (docKey, data) {
				var deferred = Q.defer();
				var transaction = this._db.transaction(['files'], 'readwrite');

				var put = transaction.objectStore('files').put(data, docKey);
				put.onsuccess = function (e) {
					deferred.resolve(e);
				};

				put.onerror = function (e) {
					deferred.reject(e);
				};

				return deferred.promise;
			},

			rm: function (docKey) {
				var deferred = Q.defer();
				var finalDeferred = Q.defer();

				var transaction = this._db.transaction(['files', 'attachments'], 'readwrite');

				var del = transaction.objectStore('files').delete(docKey);

				del.onsuccess = function (e) {
					deferred.promise.then(function () {
						finalDeferred.resolve();
					});
				};

				del.onerror = function (e) {
					deferred.promise.
					catch (function () {
						finalDeferred.reject(e);
					});
				};

				var attachmentsStore = transaction.objectStore('attachments');
				var index = attachmentsStore.index('fname');
				var cursor = index.openCursor(IDBKeyRange.only(docKey));
				cursor.onsuccess = function (e) {
					var cursor = e.target.result;
					if (cursor) {
						cursor.delete();
						cursor.
						continue ();
					} else {
						deferred.resolve();
					}
				};

				cursor.onerror = function (e) {
					deferred.reject(e);
				}

				return finalDeferred.promise;
			},

			ls: function (docKey) {
				var deferred = Q.defer();

				if (!docKey) {
					// list docs
					var store = 'files';
				} else {
					// list attachments
					var store = 'attachments';
				}

				var transaction = this._db.transaction([store], 'readonly');
				var cursor = transaction.objectStore(store).openCursor();
				var listing = [];

				cursor.onsuccess = function (e) {
					var cursor = e.target.result;
					if (cursor) {
						listing.push(!docKey ? cursor.key : cursor.key.split('/')[1]);
						cursor.
						continue ();
					} else {
						deferred.resolve(listing);
					}
				};

				cursor.onerror = function (e) {
					deferred.reject(e);
				};

				return deferred.promise;
			},

			clear: function () {
				var deferred = Q.defer();
				var finalDeferred = Q.defer();

				var t = this._db.transaction(['attachments', 'files'], 'readwrite');


				var req1 = t.objectStore('attachments').clear();
				var req2 = t.objectStore('files').clear();

				req1.onsuccess = function () {
					deferred.promise.then(finalDeferred.resolve);
				};

				req2.onsuccess = function () {
					deferred.resolve();
				};

				req1.onerror = function (err) {
					finalDeferred.reject(err);
				};

				req2.onerror = function (err) {
					finalDeferred.reject(err);
				};

				return finalDeferred.promise;
			}
		};

		return {
			init: function (config) {
				var deferred = Q.defer();

				var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
					IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
					dbVersion = 2;

				if (!indexedDB || !IDBTransaction) {
					deferred.reject("No IndexedDB");
					return deferred.promise;
				}

				var request = indexedDB.open(config.name, dbVersion);

				function createObjectStore(db) {
					db.createObjectStore("files");
					var attachStore = db.createObjectStore("attachments", {
						keyPath: 'path'
					});
					attachStore.createIndex('fname', 'fname', {
						unique: false
					})
				}

				// TODO: normalize errors
				request.onerror = function (event) {
					deferred.reject(event);
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
								deferred.resolve();
							};
						} else {
							deferred.resolve(new IDB(db));
						}
					} else {
						deferred.resolve(new IDB(db));
					}
				}

				request.onupgradeneeded = function (event) {
					createObjectStore(event.target.result);
				};

				return deferred.promise;
			}
		}
	})(Q);

	var LocalStorageProvider = (function (Q) {
		return {
			init: function () {
				return Q({
					type: 'LocalStorage'
				});
			}
		}
	})(Q);

	var WebSQLProvider = (function (Q) {
		var URL = window.URL || window.webkitURL;
		var convertToBase64 = utils.convertToBase64;
		var dataURLToBlob = utils.dataURLToBlob;

		function WSQL(db) {
			this._db = db;
			this.type = 'WebSQL';
		}

		WSQL.prototype = {
			getContents: function (docKey, options) {
				var deferred = Q.defer();
				this._db.transaction(function (tx) {
					tx.executeSql('SELECT value FROM files WHERE fname = ?', [docKey],
						function (tx, res) {
							if (res.rows.length == 0) {
								deferred.resolve(undefined);
							} else {
								var data = res.rows.item(0).value;
								if (options && options.json)
									data = JSON.parse(data);
								deferred.resolve(data);
							}
						});
				}, function (err) {
					consol.log(err);
					deferred.reject(err);
				});

				return deferred.promise;
			},

			setContents: function (docKey, data, options) {
				var deferred = Q.defer();
				if (options && options.json)
					data = JSON.stringify(data);

				this._db.transaction(function (tx) {
					tx.executeSql(
						'INSERT OR REPLACE INTO files (fname, value) VALUES(?, ?)', [docKey, data]);
				}, function (err) {
					console.log(err);
					deferred.reject(err);
				}, function () {
					deferred.resolve();
				});

				return deferred.promise;
			},

			rm: function (docKey) {
				var deferred = Q.defer();

				this._db.transaction(function (tx) {
					tx.executeSql('DELETE FROM files WHERE fname = ?', [docKey]);
					tx.executeSql('DELETE FROM attachments WHERE fname = ?', [docKey]);
				}, function (err) {
					console.log(err);
					deferred.reject(err);
				}, function () {
					deferred.resolve();
				});

				return deferred.promise;
			},

			ls: function (docKey) {
				var deferred = Q.defer();

				var select;
				var field;
				if (!docKey) {
					select = 'SELECT fname FROM files';
					field = 'fname';
				} else {
					select = 'SELECT akey FROM attachments WHERE fname = ?';
					field = 'akey';
				}

				this._db.transaction(function (tx) {
					tx.executeSql(select, docKey ? [docKey] : [],
						function (tx, res) {
							var listing = [];
							for (var i = 0; i < res.rows.length; ++i) {
								listing.push(res.rows.item(i)[field]);
							}

							deferred.resolve(listing);
						}, function (err) {
							deferred.reject(err);
						});
				});

				return deferred.promise;
			},

			clear: function () {
				var deffered1 = Q.defer();
				var deffered2 = Q.defer();

				this._db.transaction(function (tx) {
					tx.executeSql('DELETE FROM files', function () {
						deffered1.resolve();
					});
					tx.executeSql('DELETE FROM attachments', function () {
						deffered2.resolve();
					});
				}, function (err) {
					deffered1.reject(err);
					deffered2.reject(err);
				});

				return Q.all([deffered1, deffered2]);
			}
		};

		return {
			init: function (config) {
				var openDb = window.openDatabase;
				var deferred = Q.defer();
				if (!openDb) {
					deferred.reject("No WebSQL");
					return deferred.promise;
				}

				var db = openDb(config.name, '1.0', 'large local storage', config.size);

				db.transaction(function (tx) {
					tx.executeSql('CREATE TABLE IF NOT EXISTS files (fname unique, value)');
					tx.executeSql('CREATE TABLE IF NOT EXISTS attachments (fname, akey, value)');
					tx.executeSql('CREATE INDEX IF NOT EXISTS fname_index ON attachments (fname)');
					tx.executeSql('CREATE INDEX IF NOT EXISTS akey_index ON attachments (akey)');
					tx.executeSql('CREATE UNIQUE INDEX IF NOT EXISTS uniq_attach ON attachments (fname, akey)')
				}, function (err) {
					deferred.reject(err);
				}, function () {
					deferred.resolve(new WSQL(db));
				});

				return deferred.promise;
			}
		}
	})(Q);

	var LargeLocalStorage = (function (Q) {
		var sessionMeta = localStorage.getItem('LargeLocalStorage-meta');
		if (sessionMeta)
			sessionMeta = JSON.parse(sessionMeta);
		else
			sessionMeta = {};

		function defaults(options, defaultOptions) {
			for (var k in defaultOptions) {
				if (options[k] === undefined)
					options[k] = defaultOptions[k];
			}

			return options;
		}

		function getImpl(type) {
			switch (type) {
			case 'FileSystemAPI':
				return FilesystemAPIProvider.init();
			case 'IndexedDB':
				return IndexedDBProvider.init();
			case 'WebSQL':
				return WebSQLProvider.init();
			case 'LocalStorage':
				return LocalStorageProvider.init();
			}
		}

		var providers = {
			FileSystemAPI: FilesystemAPIProvider,
			IndexedDB: IndexedDBProvider,
			WebSQL: WebSQLProvider,
			LocalStorage: LocalStorageProvider
		}

		var defaultConfig = {
			size: 10 * 1024 * 1024,
			name: 'lls'
		};

		function selectImplementation(config) {
			if (!config) config = {};
			config = defaults(config, defaultConfig);

			if (config.forceProvider) {
				return providers[config.forceProvider].init(config);
			}

			return FilesystemAPIProvider.init(config).then(function (impl) {
				return Q(impl);
			}, function () {
				return IndexedDBProvider.init(config);
			}).then(function (impl) {
				return Q(impl);
			}, function () {
				return WebSQLProvider.init(config);
			}).then(function (impl) {
				return Q(impl);
			}, function () {
				console.error('Unable to create any storage implementations.  Using LocalStorage');
				return LocalStorageProvider.init(config);
			});
		}

		function LargeLocalStorage(config) {
			var scope = this;
			var deferred = Q.defer();
			selectImplementation(config).then(function (impl) {
				console.log('Selected: ' + impl.type);
				scope._impl = impl;
				deferred.resolve(scope);
			}).
			catch (function (e) {
				// This should be impossible
				console.log(e);
				deferred.reject('No storage provider found');
			});

			
			scope.initialized = deferred.promise;

			return scope;
		}

		LargeLocalStorage.prototype = {
			
			ready: function () {
				return this._impl != null;
			},

			
			ls: function (docKey) {
				this._checkAvailability();
				return this._impl.ls(docKey);
			},

			
			rm: function (docKey) {
				this._checkAvailability();
				return this._impl.rm(docKey);
			},

			
			clear: function () {
				this._checkAvailability();
				return this._impl.clear();
			},

			
			getContents: function (docKey, options) {
				this._checkAvailability();
				return this._impl.getContents(docKey, options);
			},

			
			setContents: function (docKey, data, options) {
				this._checkAvailability();
				return this._impl.setContents(docKey, data, options);
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

		LargeLocalStorage.contrib = {};

		return LargeLocalStorage;
	})(Q);

	return LargeLocalStorage;


})();