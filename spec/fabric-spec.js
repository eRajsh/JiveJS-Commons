if(!_ && typeof require === "function") {
	var _ = require('../jive.js');
}

describe("Fabric.js is a class to provide a kick ass event fabric in the client for mediator pattern and more", function() {
	it("sets up a global constructor Fabric", function() {
		expect(_.Fabric).not.toEqual(undefined);
		expect(_.Fabric).toBeTruthy();
	});

	describe("it has a standard pub/sub low level api that does not store scope", function() {
		it("has a subscribe method which takes a urn in format string:string:string etc", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});
			var spy = {
				func1: function() {},
				func2: function() {},
				func3: function() {},
				func4: function() {},
				func5: function() {}
			}
			spyOn(spy, "func1");
			spyOn(spy, "func2");
			spyOn(spy, "func3");
			spyOn(spy, "func4");
			spyOn(spy, "func5");

			fabric.subscribe({
				callback: spy.func1,
				urn: "nick:rocks"
			});
			fabric.subscribe({
				callback: spy.func2,
				urn: "nick:rocks"
			});
			fabric.subscribe({
				callback: spy.func3,
				urn: "nick:madness"
			});
			fabric.subscribe({
				callback: spy.func4,
				urn: "nick:*"
			});
			fabric.subscribe({
				callback: spy.func5,
				urn: "nick:#"
			});

			var stats = fabric.debug();

			expect(Object.keys(stats.bindings).length).toEqual(4);
			expect(Object.keys(stats.bindings)).toEqual(["nick:rocks", "nick:madness", "nick:*", "nick:#"])
			expect(stats.bindings["nick:rocks"].subs.length).toEqual(2);
			expect(stats.bindings["nick:madness"].subs.length).toEqual(1);
			expect(stats.bindings["nick:*"].subs.length).toEqual(1);
			expect(stats.bindings["nick:#"].subs.length).toEqual(1);
		});

		it("when you subscribe it caches the regex of the urn that you provided and can use that for publish lookups", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});
			var spy = {
				func1: function() {}
			}
			spyOn(spy, "func1");

			fabric.subscribe({
				callback: spy.func1,
				urn: "nick:rocks"
			});

			var stats = fabric.debug();

			expect(stats.bindings["nick:rocks"].regex).toEqual(/^(nick)\:\b(rocks)$/i);
			expect(stats.bindings["nick:rocks"].regex.toString()).toEqual('/^(nick)\\:\\b(rocks)$/i')
			expect(stats.bindings["nick:rocks"].regex.test("nick:rocks")).toEqual(true);
			expect(stats.bindings["nick:rocks"].regex.test("nick:almost:rocks")).toEqual(false);
			expect(stats.bindings["nick:rocks"].regex.test("hicks:rock")).toEqual(false);
			expect(stats.bindings["nick:rocks"].regex.test("no:nick:doesnt:rock")).toEqual(false);
		});

		it("has an unsubscribe function which you can use with the key or callback that you got back from the subscribe", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});
			var hasCalled = false;

			var spy = {
				func1: function() {hasCalled = true;}
			};
			spyOn(spy, "func1");

			runs(function(){
				var sub = fabric.subscribe({
					callback: spy.func1,
					urn: "nick:rocks"
				});
				fabric.unsubscribe({
					urn: "nick:rocks",
					key: sub.key
				})
				var stats = fabric.debug();

				expect(stats.bindings["nick:rocks"]).toEqual(undefined);

				var sub = fabric.subscribe({
					callback: spy.func1,
					urn: "nick:rocks"
				});
				fabric.unsubscribe({
					urn: "nick:rocks",
					callback: spy.func1
				})
				var stats = fabric.debug();

				expect(stats.bindings["nick:rocks"]).toEqual(undefined);

				var sub = fabric.subscribe({
					callback: spy.func1,
					urn: "nick:rocks"
				});
				fabric.unsubscribe({
					urn: "nick:rocks",
					callback: spy.func2
				})
				var stats = fabric.debug();

				expect(stats.bindings["nick:rocks"].subs.length).toEqual(1);
			});
		});

		it("has a publish method which takes a urn in format string:string:string etc and executes the subscribed callbacks", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var calls = [];

			var spy = {
				func1: function() {calls.push(true);},
				func2: function() {calls.push(true);},
				func3: function() {calls.push(true);},
				func4: function() {calls.push(true);},
				func5: function() {calls.push(true);}
			};
			spyOn(spy, "func1").andCallThrough();
			spyOn(spy, "func2").andCallThrough();
			spyOn(spy, "func3").andCallThrough();
			spyOn(spy, "func4").andCallThrough();
			spyOn(spy, "func5").andCallThrough();

			runs(function(){
				fabric.subscribe({
					callback: spy.func1,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func2,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func3,
					urn: "nick:madness"
				});
				fabric.subscribe({
					callback: spy.func4,
					urn: "nick:*"
				});
				fabric.subscribe({
					callback: spy.func5,
					urn: "nick:#"
				});
			});

			runs(function(){
				fabric.publish({
					data: "foo",
					urn: "nick:rocks"
				});
			});

			waitsFor(function(){
				return calls.length == 4;
			});

			runs(function(){
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(spy.func3).not.toHaveBeenCalled();
				expect(spy.func4).toHaveBeenCalled();
				expect(spy.func5).toHaveBeenCalled();
				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
				expect(spy.func4.calls.length).toEqual(1);
				expect(spy.func5.calls.length).toEqual(1);
				expect(spy.func3.calls.length).toEqual(0);
				expect(spy.func1).toHaveBeenCalledWith({
					data: 'foo',
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func2).toHaveBeenCalledWith({
					data: 'foo',
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func4.calls[0].args[0].matches[1]).toEqual('rocks');
				expect(spy.func5.calls[0].args[0].matches[1]).toEqual('rocks');
			});

			runs(function(){
				calls = [];
				fabric.publish({
					data: "bar",
					urn: "nick:rocks:socks"
				});
			});

			waitsFor(function(){
				return calls.length == 1;
			});

			runs(function(){
				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
				expect(spy.func3).not.toHaveBeenCalled();
				expect(spy.func4.calls.length).toEqual(1);
				expect(spy.func5.calls.length).toEqual(2);
				expect(spy.func3.calls.length).toEqual(0);

				expect(spy.func5.calls[1].args[0].matches[1]).toEqual('rocks:socks');
			});
		});

		it("the object subscribe returns has a dfd that gets notified when events occur", function() {
			var calls = [];

			var fabric = new _.Fabric({
				debugMode: true
			});

			var sub = fabric.subscribe({
				urn: "promisified:fabric"
			});

			runs(function() {
				sub.progress(function(e) {
					calls.push(e);

					expect(e.data).toEqual("test");
				});

				fabric.publish({
					urn: "promisified:fabric",
					data: "test"
				});

				setTimeout(function() {
					fabric.publish({
						urn: "promisified:fabric",
						data: "test"
					});
				}, 200);
			});

			waitsFor(function() {
				return calls.length == 2;
			});

			runs(function() {
				fabric.unsubscribe(sub);

				fabric.subscribe({
					urn: "promisified:fabric"
				}).progress(function(e) {
					calls.push(e);

					expect(e.data).toEqual("promises rock");
				});

				fabric.publish({
					urn: "promisified:fabric",
					data: "promises rock"
				});
			});

			waitsFor(function() {
				return calls.length == 3;
			});

			runs(function() {
				expect(calls.length).toEqual(3);
			});
		});

		it("publish can be called sync as well as the default async for the callback distribution, so that the return of the callback is given as the data to the next callback", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var calls = [];

			var spy = {
				func1: function(args) {
					calls.push(true);
					return 1;
				},
				func2: function(args) {
					calls.push(true);
					return 2;
				},
				func3: function(args) {
					calls.push(true);
					return 3;
				},
				func4: function(args) {
					calls.push(true);
					return 4;
				},
				func5: function(args) {
					calls.push(true);
					return 5;
				}
			};

			spyOn(spy, "func1").andCallThrough();
			spyOn(spy, "func2").andCallThrough();
			spyOn(spy, "func3").andCallThrough();
			spyOn(spy, "func4").andCallThrough();
			spyOn(spy, "func5").andCallThrough();

			runs(function(){
				fabric.subscribe({
					callback: spy.func1,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func2,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func3,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func4,
					urn: "nick:rocks"
				});
				fabric.subscribe({
					callback: spy.func5,
					urn: "nick:rocks"
				});
			});

			runs(function(){
				fabric.publish({
					data: "foo",
					urn: "nick:rocks",
					sync: true
				});
			});

			waitsFor(function(){
				return calls.length == 5;
			});

			runs(function(){
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func2).toHaveBeenCalled();
				expect(spy.func3).toHaveBeenCalled();
				expect(spy.func4).toHaveBeenCalled();
				expect(spy.func5).toHaveBeenCalled();

				expect(spy.func1.calls.length).toEqual(1);
				expect(spy.func2.calls.length).toEqual(1);
				expect(spy.func3.calls.length).toEqual(1);
				expect(spy.func4.calls.length).toEqual(1);
				expect(spy.func5.calls.length).toEqual(1);

				expect(spy.func1).toHaveBeenCalledWith({
					data: 'foo',
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func2).toHaveBeenCalledWith({
					data: 1,
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func3).toHaveBeenCalledWith({
					data: 2,
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func4).toHaveBeenCalledWith({
					data: 3,
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
				expect(spy.func5).toHaveBeenCalledWith({
					data: 4,
					matches: undefined,
					raw: 'foo',
					binding: 'nick:rocks',
					key: 'message_6'
				});
			});
		});
	});

	describe("it has a higher level api for the request/fulfill pattern", function() {
		it("has a request method which instantly publishes the request and subs to the created fulfil urn", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var calls = [];

			var spy = {
				func1: function(args) {
					calls.push(true);
					fabric.fulfill({
						urn: args.data.cbUrn,
						data: "woot",
						key: args.data.key
					})
				},
				func2: function(args) {
					calls.push(true);
					return 2;
				},
				func3: function(args) {
					calls.push(true);
					fabric.fulfill({
						urn: args.data.cbUrn,
						data: "wooooha",
						key: args.data.key
					})
				}
			}
			spyOn(spy, "func1").andCallThrough();
			spyOn(spy, "func2").andCallThrough();
			spyOn(spy, "func3").andCallThrough();

			runs(function(){
				fabric.subscribe({
					callback: spy.func1,
					urn: "nick:request"
				});
				fabric.request({
					urn: "nick:request",
					callback: spy.func2
				});
			});

			waitsFor(function(){
				return calls.length == 2;
			});

			runs(function(){
				expect(JSON.stringify(spy.func1.calls[0].args[0])).toEqual('{"data":{"key":"subscription_3","cbUrn":"nick:request:message_2","type":"request"},"raw":{"key":"subscription_3","cbUrn":"nick:request:message_2","type":"request"},"binding":"nick:request","key":"message_4"}');
				expect(spy.func2).toHaveBeenCalledWith({
					data: 'woot',
					matches: undefined,
					raw: 'woot',
					binding: 'nick:request:message_2',
					key: 'message_5'
				});
				expect(spy.func3).not.toHaveBeenCalled()
			});
		});
	});

	describe("it has a higher level api for the command/notify pattern", function() {
		it("has a command method which instantly publishes the request and subs to the created notify urn", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var calls = [];

			var spy = {
				func1: function(args) {
					calls.push(true);
					fabric.notify({
						urn: args.data.cbUrn,
						data: "woot",
						key: args.data.key
					})
				},
				func2: function(args) {
					calls.push(true);
					return 2
				},
				func3: function(args) {
					calls.push(true);
					fabric.notify({
						urn: args.data.cbUrn,
						data: "wooooha",
						key: args.data.key
					})
				}
			}
			spyOn(spy, "func1").andCallThrough();
			spyOn(spy, "func2").andCallThrough();
			spyOn(spy, "func3").andCallThrough();

			runs(function(){
				fabric.subscribe({
					callback: spy.func1,
					urn: "nick:command"
				});
				fabric.command({
					urn: "nick:command",
					callback: spy.func2
				});
			});

			waitsFor(function(){
				return calls.length == 2;
			});

			runs(function(){
				expect(JSON.stringify(spy.func1.calls[0].args[0])).toEqual('{"data":{"key":"subscription_3","cbUrn":"nick:command:message_2","type":"command"},"raw":{"key":"subscription_3","cbUrn":"nick:command:message_2","type":"command"},"binding":"nick:command","key":"message_4"}');
				expect(spy.func2).toHaveBeenCalledWith({
					data: 'woot',
					matches: undefined,
					raw: 'woot',
					binding: 'nick:command:message_2',
					key: 'message_5'
				});
				expect(spy.func3).not.toHaveBeenCalled()
			});
		});
	});

	describe("it has a higher level api for the enqueue/dequeue/peek/handle/release pattern", function() {
		it("can enqueue and dequeue messages that are just arbitrary packets of data to a urn", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var item1 = fabric.enqueue({
				urn: "nick:queue",
				data: "lala"
			});
			var item2 = fabric.enqueue({
				urn: "nick:queue",
				data: "fola"
			});

			var stats = fabric.debug();
			expect(stats.queue["nick:queue"].items.length).toEqual(2)

			fabric.dequeue(item1);
			var stats = fabric.debug();
			expect(stats.queue["nick:queue"].items.length).toEqual(1);
			expect(stats.queue["nick:queue"].items[0].data).toEqual("fola")

			fabric.dequeue(item2);
			var stats = fabric.debug();
			expect(stats.queue["nick:queue"]).toEqual(undefined);
		});

		it("has a function to peek into the queue to find the first messag that matches your urn and give it to you", function() {
			var fabric = new _.Fabric({
				debugMode: true,
				peekTimeout: 100
			});
			var spy = {
				func1: function(args) {}
			}
			spyOn(spy, "func1").andCallThrough();

			var item1 = fabric.enqueue({
				urn: "nick:queue",
				data: "lala"
			});

			var flag = false;
			runs(function() {

				fabric.peek({
					urn: "nick:queue",
					callback: spy.func1
				});
				var stats = fabric.debug();
				expect(stats.queue["nick:queue"].items.length).toEqual(0);
				expect(spy.func1).toHaveBeenCalled();
				expect(spy.func1.calls[0].args[0].data.data).toEqual("lala")
				expect(stats.processing[spy.func1.calls[0].args[0].data.key]).not.toEqual(undefined);
				setTimeout(function() {
					flag = true;
				}, 150);
			});

			waitsFor(function() {
				return flag;
			}, "The timout shoulda kicked", 200);

			runs(function() {
				var stats = fabric.debug();
				expect(stats.queue["nick:queue"].items.length).toEqual(1);
				expect(stats.processing[spy.func1.calls[0].args[0].data.key]).toEqual(undefined);
			});

		});

		it("if you peek a message you should 'handle' it or 'release' it so that the timeout doesn't trigger", function() {
			var fabric = new _.Fabric({
				debugMode: true
			});

			var spy = {
				func1: function(args) {}
			}
			spyOn(spy, "func1").andCallThrough();

			var item1 = fabric.enqueue({
				urn: "nick:queue",
				data: "lala"
			});
			fabric.peek({
				urn: "nick:queue",
				callback: spy.func1
			});
			var stats = fabric.debug();
			expect(stats.queue["nick:queue"].items.length).toEqual(0);
			expect(spy.func1).toHaveBeenCalled();
			expect(spy.func1.calls[0].args[0].data.data).toEqual("lala")
			expect(stats.processing[spy.func1.calls[0].args[0].data.key]).not.toEqual(undefined);

			fabric.release({
				key: spy.func1.calls[0].args[0].data.key
			});

			expect(stats.queue["nick:queue"].items.length).toEqual(1);
			expect(stats.processing[spy.func1.calls[0].args[0].data.key]).toEqual(undefined);

			fabric.peek({
				urn: "nick:queue",
				callback: spy.func1
			});
			var stats = fabric.debug();
			expect(stats.queue["nick:queue"].items.length).toEqual(0);
			expect(spy.func1).toHaveBeenCalled();
			expect(spy.func1.calls[0].args[0].data.data).toEqual("lala")
			expect(stats.processing[spy.func1.calls[0].args[0].data.key]).not.toEqual(undefined);

			fabric.handle({
				key: spy.func1.calls[0].args[0].data.key
			});

			expect(stats.queue["nick:queue"].items.length).toEqual(0);
			expect(stats.processing[spy.func1.calls[0].args[0].data.key]).toEqual(undefined);
		});
	});

	describe("when constructed normally the fabric does not expose its privates in public", function() {
		var fabric = new _.Fabric();
		expect(fabric.bindings).toEqual(undefined);
		expect(fabric.queue).toEqual(undefined);
		expect(fabric.processing).toEqual(undefined);
	});

	describe("when constructed normally the fabric's methods are frozen so you can't muck around with it", function() {
		var fabric = new _.Fabric();
		var sub = fabric.subscribe;

		fabric.subscribe = "foo";

		expect(fabric.subscribe).not.toEqual("foo");
		expect(fabric.subscribe).toEqual(sub);
	});
});
