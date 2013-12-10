if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}

describe("Promise.js Deferred Promise class", function() {
	it("sets up a global constructor _.Dfd", function() {
		expect(_.Dfd).not.toEqual(undefined);
		expect(_.Dfd).toBeTruthy();
	});

	describe("returns a deferred constructor that can be newed up", function() {
		it("can be called with a beforeStart function which will receive the deferred object", function() {
			var spy = {
				func: function() {}
			};
			spyOn(spy, "func");

			var dfd = new _.Dfd(spy.func);
			expect(spy.func).toHaveBeenCalled()
		});

		it("or newed up with no arguments, which is the more standard condition", function() {
			var spy = {
				func: function() {}
			};
			spyOn(spy, "func");

			var dfd = new _.Dfd();;
			expect(dfd.toString()).toEqual("[object Deferred]");
		});

	});

	describe("the Deferred object is not safe to give around and as such exposes properties.  Worth it for performance fyi.", function() {
		it("has an internalState property that you could read manually if you wanted", function() {
			var dfd = new _.Dfd();
			expect(dfd.internalState).toEqual(0);
			expect(Object.keys(dfd).length).toEqual(0);

			dfd.reject();
			expect(dfd.internalState).toEqual(2);

			dfd = new _.Dfd();
			dfd.resolve();
			expect(dfd.internalState).toEqual(1);
		});

		it("has an internalWith property that that is a reference to the Dfd itself, a way to sanitize 'this' with all the callbacks", function() {
			var dfd = new _.Dfd();
			expect(dfd.internalWith).toEqual(dfd);

			var obj = {};
			dfd.resolveWith(obj);
			expect(dfd.internalWith).toEqual(obj);
		});

		it("has an internalData property that is the data with which the deferred was resolved/rejected etc", function() {
			var dfd = new _.Dfd();
			expect(dfd.internalData).toEqual(null);

			var obj = {};
			dfd.resolve(obj);
			expect(dfd.internalData).toEqual(obj);
		});

		it("has an callbacks property that logs the callbacks that have been registered", function() {
			var dfd = new _.Dfd();
			expect(dfd.callbacks.done.length).toEqual(0);
			expect(dfd.callbacks.fail.length).toEqual(0);
			expect(dfd.callbacks.always.length).toEqual(0);
			expect(dfd.callbacks.progress.length).toEqual(0);

			var promise = dfd.promise();
			var func1 = function() {};
			var func2 = function() {};
			var func3 = function() {};
			var func4 = function() {};
			promise.done(func1);
			promise.fail(func2);
			promise.always(func3);
			promise.progress(func4);

			expect(dfd.callbacks.done.length).toEqual(1);
			expect(dfd.callbacks.fail.length).toEqual(1);
			expect(dfd.callbacks.always.length).toEqual(1);
			expect(dfd.callbacks.progress.length).toEqual(1);

			expect(dfd.callbacks.done[0]).toEqual(func1);
			expect(dfd.callbacks.fail[0]).toEqual(func2);
			expect(dfd.callbacks.always[0]).toEqual(func3);
			expect(dfd.callbacks.progress[0]).toEqual(func4);
		});
	});

	describe("the deferred object exposes a safe promise subclass which allows only registration of callbacks", function() {
		it("returns a new promise object when dfd.promise() is called", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			expect(promise.dfd).toEqual(undefined)
			expect(promise.toString()).toEqual("[object Promise]");
			expect(_.isFunction(promise.done)).toBeTruthy();
			expect(_.isFunction(promise.fail)).toBeTruthy();
			expect(_.isFunction(promise.always)).toBeTruthy();
			expect(_.isFunction(promise.progress)).toBeTruthy();
			expect(_.isFunction(promise.then)).toBeTruthy();
			expect(_.isFunction(promise.state)).toBeTruthy();

			expect(promise.state()).toEqual(0);
		});

		it("adds the promise properties and methods onto an existing object when an object is passed to promise()", function() {
			var dfd = new _.Dfd();
			var obj = {
				foo: "bar"
			};
			var promise = dfd.promise(obj);

			expect(promise.toString()).toEqual("[object Promise]");
			expect(_.isFunction(promise.done)).toBeTruthy();
			expect(_.isFunction(promise.fail)).toBeTruthy();
			expect(_.isFunction(promise.always)).toBeTruthy();
			expect(_.isFunction(promise.progress)).toBeTruthy();
			expect(_.isFunction(promise.then)).toBeTruthy();
			expect(_.isFunction(promise.state)).toBeTruthy();

			expect(promise.state()).toEqual(0);
			expect(promise.foo).toEqual("bar");
		});
	});

	describe("the callbacks are safely registered to the deferred by the promise methods", function() {
		it("promise.done() adds callbacks to the deferred callbacks.done array", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			expect(dfd.callbacks.done.length).toEqual(0);
			var func1 = function() {};
			promise.done(func1);
			expect(dfd.callbacks.done.length).toEqual(1);
			expect(dfd.callbacks.done[0]).toEqual(func1);
		});

		it("promise.fail() adds callbacks to the deferred callbacks.fail array", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			expect(dfd.callbacks.fail.length).toEqual(0);
			var func1 = function() {};
			promise.fail(func1);
			expect(dfd.callbacks.fail.length).toEqual(1);
			expect(dfd.callbacks.fail[0]).toEqual(func1);
		});

		it("promise.always() adds callbacks to the deferred callbacks.always array", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			expect(dfd.callbacks.always.length).toEqual(0);
			var func1 = function() {};
			promise.always(func1);
			expect(dfd.callbacks.always.length).toEqual(1);
			expect(dfd.callbacks.always[0]).toEqual(func1);
		});

		it("promise.progress() adds callbacks to the deferred callbacks.progress array", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			expect(dfd.callbacks.progress.length).toEqual(0);
			var func1 = function() {};
			promise.progress(func1);
			expect(dfd.callbacks.progress.length).toEqual(1);
			expect(dfd.callbacks.progress[0]).toEqual(func1);
		});

		it("promise.then() returns a new promise that runs the old promise through filter functions on return", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();

			var func1 = function() {};
			var func2 = function() {};
			var func3 = function() {};

			var thenPromise = promise.then(func1, func2, func3);
			expect(thenPromise.toString()).toEqual("[object Promise]");
		})
	});

	describe("the deferred object is used to resolve/reject/notify to the subscriptions on the promise", function() {
		it("resolve calls both done and always callbacks", function() {
			var called = [];

			var spy = {
				func: function() {
					called.push(true);
				}
			};
			spyOn(spy, "func").andCallThrough();

			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var obj = {};

			runs(function() {
				promise.done(spy.func);
				promise.always(spy.func);

				dfd.resolve(obj);
			});

			waitsFor(function() {
				return called.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(1);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);

				promise.done(spy.func);
			});

			waitsFor(function() {
				return called.length == 3;
			});

			runs(function() {
				expect(spy.func.calls.length).toEqual(3);
			});
		});

		it("resolveWith calls both done and always callbacks and the callback is scoped to the first param of resolveWith", function() {
			var spy = {
				func: function() {}
			};
			var scope = null;
			spyOn(spy, "func").andCallFake(function() {
				scope = this;
			});

			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var newScope = {};
			var obj = {};

			runs(function() {
				promise.done(spy.func);
				promise.always(spy.func);
				dfd.resolveWith(newScope, obj);
			});

			waitsFor(function() {
				return spy.func.calls.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(1);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);
				expect(scope).toEqual(newScope);

				promise.done(spy.func);
			});

			waitsFor(function() {
				return spy.func.calls.length == 3;
			});

			runs(function() {
				expect(spy.func.calls.length).toEqual(3);
			});
		});

		it("reject calls both done and always callbacks", function() {
			var spy = {
				func: function() {}
			};
			spyOn(spy, "func");

			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var obj = {};

			runs(function() {
				promise.fail(spy.func);
				promise.always(spy.func);

				dfd.reject(obj);
			});

			waitsFor(function() {
				return spy.func.calls.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(2);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);

				promise.fail(spy.func);
			});

			waitsFor(function() {
				return spy.func.calls.length == 3;
			});

			runs(function() {
				expect(spy.func.calls.length).toEqual(3);
			});
		});

		it("rejectWith calls both fail and always callbacks and the callback is scoped to the first param of resolveWith", function() {
			var spy = {
				func: function() {}
			};
			var scope = null;
			spyOn(spy, "func").andCallFake(function() {
				scope = this;
			});

			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var newScope = {};
			var obj = {};

			runs(function() {
				promise.fail(spy.func);
				promise.always(spy.func);
				dfd.rejectWith(newScope, obj);
			});

			waitsFor(function() {
				return spy.func.calls.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(2);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);
				expect(scope).toEqual(newScope);

				promise.fail(spy.func);
			});

			waitsFor(function() {
				return spy.func.calls.length == 3;
			});

			runs(function() {
				expect(spy.func.calls.length).toEqual(3);
			});
		});

		it("notify calls progress callbacks", function() {
			var spy = {
				func: function() {}
			};
			spyOn(spy, "func");

			var dfd = new _.Dfd();
			var promise = dfd.promise();

			promise.progress(spy.func);
			promise.progress(spy.func);

			var obj = {};

			runs(function() {
				dfd.notify(obj);
			});

			waitsFor(function() {
				return spy.func.calls.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(0);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);
			});
		});

		it("notifyWith calls progress callbacks and the callback is scoped to the first param of resolveWith", function() {
			var spy = {
				func: function() {}
			};
			var scope = null;
			spyOn(spy, "func").andCallFake(function() {
				scope = this;
			});

			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var newScope = {};
			var obj = {};

			promise.progress(spy.func);
			promise.progress(spy.func);

			runs(function() {
				dfd.notifyWith(newScope, obj);
			});

			waitsFor(function() {
				return spy.func.calls.length == 2;
			});

			runs(function() {
				expect(dfd.state()).toEqual(0);

				expect(spy.func).toHaveBeenCalled();
				expect(spy.func).toHaveBeenCalledWith(obj)
				expect(spy.func.calls.length).toEqual(2);
				expect(scope).toEqual(newScope);
			});
		});

		it("then()'s called on the promise chain the callback results and call a new promise", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var spy = {
				func1: function() {},
				func2: function() {},
				func3: function() {},
				func4: function() {},
				func5: function() {},
				func6: function() {}
			}
			var f1, f2, f3, f4, f5, f6;
			spyOn(spy, "func1").andCallFake(function(d) {
				f1 = d;
				return 2 * d;
			})
			spyOn(spy, "func2").andCallFake(function(d) {
				f2 = d;
				return 2 * d;
			})
			spyOn(spy, "func3").andCallFake(function(d) {
				f3 = d;
				return 2 * d;
			})
			spyOn(spy, "func4").andCallFake(function(d) {
				f4 = d;
				return 2 * d;
			})
			spyOn(spy, "func5").andCallFake(function(d) {
				f5 = d;
				return 2 * d;
			})
			spyOn(spy, "func6").andCallFake(function(d) {
				f6 = d;
				return 2 * d;
			})


			var thenPromise = promise.then(spy.func1, spy.func2, spy.func3);
			expect(thenPromise.toString()).toEqual("[object Promise]");

			thenPromise.done(spy.func4);
			thenPromise.progress(spy.func6);

			runs(function() {
				dfd.notify(1);
			});

			waitsFor(function() {
				return spy.func3.calls.length == 1 && spy.func6.calls.length == 1;
			});


			runs(function() {
				expect(spy.func3).toHaveBeenCalledWith(1);
				expect(spy.func6).toHaveBeenCalledWith(2);

				dfd.resolve(2);
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func6.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalledWith(2);
				expect(spy.func4).toHaveBeenCalledWith(4);

				dfd = new _.Dfd();
				promise = dfd.promise();
				thenPromise = promise.then(spy.func1, spy.func2, spy.func3);
				thenPromise.done(spy.func5);
				dfd.reject(3);
			});

			waitsFor(function() {
				return spy.func2.calls.length == 1 && spy.func5.calls.length == 1;
			});

			runs(function() {
				expect(spy.func2).toHaveBeenCalledWith(3);
				expect(spy.func5).toHaveBeenCalledWith(6);
			});
		})

	});

	describe("the deferred object resolve and reject are one time calls and fail silently if you try to call them more than once", function() {
		it("calling reject after calling resolve does nothing and it stays 'resolved'", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var spy = {
				func1: function() {},
				func2: function() {}
			}
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			promise.done(spy.func1);
			promise.fail(spy.func2);

			runs(function() {
				dfd.resolve();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(dfd.state()).toEqual(1);

				dfd.reject();
			});

			waits(100);

			runs(function() {
				expect(spy.func2).not.toHaveBeenCalled();
				expect(dfd.state()).not.toEqual(2);
				expect(dfd.state()).toEqual(1);
			});
		});

		it("calling resolve after calling reject does nothing and it stays 'rejected'", function() {
			var dfd = new _.Dfd();
			var promise = dfd.promise();
			var spy = {
				func1: function() {},
				func2: function() {}
			}
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			promise.done(spy.func1);
			promise.fail(spy.func2);

			runs(function() {
				dfd.reject();
			});

			waitsFor(function() {
				return spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func2).toHaveBeenCalled();
				expect(dfd.state()).toEqual(2);

				dfd.resolve();
			});

			waits(100);

			runs(function() {
				expect(spy.func1).not.toHaveBeenCalled();
				expect(dfd.state()).not.toEqual(1);
				expect(dfd.state()).toEqual(2);
			});
		})
	});

	describe("calling when with an array of promises or truthy/falsey things returns a single unified promise that wraps the array. the when can use any existing or new Dfd", function() {
		it("works when it is an array of actual promises", function() {
			var dfd1 = new _.Dfd();
			var dfd2 = new _.Dfd();

			var pro1 = dfd1.promise();
			var pro2 = dfd2.promise();

			var spy = {
				func1: function() {},
				func2: function() {}
			}
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			var newPro = (new _.Dfd().when([pro1, pro2]))
			newPro.done(spy.func1);
			newPro.always(spy.func2);

			runs(function() {
				dfd1.resolve();
			});

			waits(100);

			runs(function() {
				expect(spy.func1).not.toHaveBeenCalled();
				expect(spy.func2).not.toHaveBeenCalled();
				expect(newPro.state()).toEqual(0);

				dfd2.resolve();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(1);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});

			runs(function() {
				dfd1 = new _.Dfd();
				dfd2 = new _.Dfd();

				pro1 = dfd1.promise();
				pro2 = dfd2.promise();

				spy = {
					func1: function() {},
					func2: function() {}
				}
				spyOn(spy, "func1");
				spyOn(spy, "func2");

				newPro = (new _.Dfd().when([pro1, pro2]))
				newPro.fail(spy.func1);
				newPro.always(spy.func2);

				dfd1.reject();
			});

			waits(100);

			runs(function() {
				expect(spy.func1).not.toHaveBeenCalled();
				expect(spy.func2).not.toHaveBeenCalled();
				expect(newPro.state()).toEqual(0);

				dfd2.reject();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(2);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});
		});

		it("works when when is on the class, not the prototype", function() {
			var dfd1 = new _.Dfd();
			var dfd2 = new _.Dfd();

			var pro1 = dfd1.promise();
			var pro2 = dfd2.promise();

			var spy = {
				func1: function() {},
				func2: function() {}
			}
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			var newPro = _.Dfd.when([pro1, pro2]);
			newPro.done(spy.func1);
			newPro.always(spy.func2);

			runs(function() {
				dfd1.resolve();
			});

			waits(100);

			runs(function() {
				expect(spy.func1).not.toHaveBeenCalled();
				expect(spy.func2).not.toHaveBeenCalled();
				expect(newPro.state()).toEqual(0);

				dfd2.resolve();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(1);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});

			runs(function() {
				dfd1 = new _.Dfd();
				dfd2 = new _.Dfd();

				pro1 = dfd1.promise();
				pro2 = dfd2.promise();

				spy = {
					func1: function() {},
					func2: function() {}
				}
				spyOn(spy, "func1");
				spyOn(spy, "func2");

				newPro = (new _.Dfd().when([pro1, pro2]))
				newPro.fail(spy.func1);
				newPro.always(spy.func2);

				dfd1.reject();
			});

			waits(100);

			runs(function() {
				expect(spy.func1).not.toHaveBeenCalled();
				expect(spy.func2).not.toHaveBeenCalled();
				expect(newPro.state()).toEqual(0);

				dfd2.reject();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(2);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});
		});

		it("works also it is an array of actual promises mixed with normal truthy/falsy stuff", function() {
			var dfd1 = new _.Dfd();

			var pro1 = dfd1.promise();
			var pro2 = true

			var spy = {
				func1: function() {},
				func2: function() {}
			};
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			var newPro = (new _.Dfd().when([pro1, pro2]))
			newPro.done(spy.func1);
			newPro.always(spy.func2);

			runs(function() {
				dfd1.resolve();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(1);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});

			runs(function() {
				dfd1 = new _.Dfd();

				pro1 = dfd1.promise();
				pro2 = false

				spy = {
					func1: function() {},
					func2: function() {}
				};
				spyOn(spy, "func1");
				spyOn(spy, "func2");

				newPro = (new _.Dfd().when([pro1, pro2]))
				newPro.fail(spy.func1);
				newPro.always(spy.func2);

				dfd1.reject();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(2);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});
		});

		it("works also it is a mix of items and arrays of actual promises mixed with normal truthy/falsy stuff", function() {
			var dfd1 = new _.Dfd();

			var pro1 = dfd1.promise();
			var pro2 = true

			var spy = {
				func1: function() {},
				func2: function() {}
			};
			spyOn(spy, "func1");
			spyOn(spy, "func2");

			var newPro = (new _.Dfd().when(pro1, pro2))
			newPro.done(spy.func1);
			newPro.always(spy.func2);

			runs(function() {
				dfd1.resolve();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length == 1;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(1);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});

			runs(function() {
				dfd1 = new _.Dfd();

				pro1 = dfd1.promise();
				pro2 = false

				spy = {
					func1: function() {},
					func2: function() {}
				};
				spyOn(spy, "func1");
				spyOn(spy, "func2");

				newPro = (new _.Dfd().when(pro1, [pro2]))
				newPro.fail(spy.func1);
				newPro.always(spy.func2);

				dfd1.reject();
			});

			waitsFor(function() {
				return spy.func1.calls.length == 1 &&
					spy.func2.calls.length;
			});

			runs(function() {
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(newPro.state()).toEqual(2);

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
			});
		})
	});
});
