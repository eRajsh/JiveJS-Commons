JiveJS-Commons - ***PUBLIC***
==============

Common low level libraries created to support the higher level application frameworks and programming patterns.
* [Promise.js](#promisejs)
* [State.js](#statejs)
* [Fabric.js](#fabricjs)

# Promise.js
## A library conforming to the Promise/A spec. 
Tested in Chrome only and known to contain non compatible code for previous versions of IE.  It would be easy to update it to work in those older browsers, but why???  At least for our use case we are using it in Chrome/Chromium based builds at the moment and will be doing backwards compatible builds of this at some point in the future when there is enough booze in the blood to dull the pain of working in IE8. 
### Example:

```
//Stashes on the global _u_ on the property Dfd... 
//The closure also returns the Dfd constructor and could be munged to work in AMD/Common if we gave a...

var dfd = new _u_.Dfd();

var pro = dfd.promise();

pro.always(function(data) {
  console.log("always", data);
});

pro.done(function(data) {
  console.log("done", data);
});

pro.fail(function(data) {
  console.log("fail", data);
});

pro.progress(function(data) {
  console.log("progress", data);
});

setTimeout(function() {
  dfd.notify("foo");
  
  console.log("state", dfd.state());
  
  dfd.resolve("bar");

  pro.done(function(data) {
    console.log("after Done", data);
  });
  
  console.log("state", dfd.state());

}, 500);

//returns in console:
// progress "foo"
// state 0
// always "bar"
// done "bar"
// after Done "bar"
// state 1

```

### Notes
* You can bind on the dfd as well as the promise, but you can only resolve/reject/notify on the dfd
* You cannot escalate the promise into the dfd, it is a one way street
* You can return multiple promises from the same dfd and it will work like magic
* You can bind at any point even after a dfd has resolved/rejected and it will instantly return
* This sucker is about 3x as fast/efficient as jQuery's Deferred piece clocking in at about 100k ops a second
* There is some over securing going on in the code that could be stripped for faster speeds but meh...
* Callback order is not guaranteed, although it usually hits the always ones first then the done/fail

# State.js
## A library grown out of that exposes a Finite State Machine
Idem to Promise on the browser compatability and the future timeline.  This baby grew out of the realization that promises and deferred specs are really just artificially handicapped state machines.  They impose an artificial limitation on the amount of states and on the transfer from state to state.  Removing these gives us State.js
### Example

```
//Stashes on the global _u_ on the property State... 
//The closure also returns the State constructor and could be munged to work in AMD/Common if we gave a...

//you construct it up with the states it contains
var state = new _u_.State({
  initState: "start",
  states: ["start", "middle", "end", "dead"]
})

//but you can modify the states later if you need to.
state.addStates(["another", "extra", "state"]);
state.removeStates(["extra", "state"]);

//you can query the states that exist
console.log(state.getStates());

//as well as the current state
console.log(state.state());

//you can bind to state change events:
state.on("middle", function(data) { console.log("middle enter", data)}, "enter");
state.on("middle", function(data) { console.log("middle on", data)}, "on");
state.on("middle", function(data) { console.log("middle leave", data)}, "leave");

state.go("middle", "foo");

//expectes in console
// ... the state stuff but that is boring
// ... here the go stuff
// "middle enter", {leavingState: "start", enteringState:"middle", data:"foo"}
// "middle on", {leavingState: "start", enteringState:"middle", data:"foo"}

//there also exists an "all" state event in case you are neurotic and like writing tons of if/switchs in callbakcs
state.on("all", function(data) {console.log("all on", data)}, "on");

```

### Notes
* you can always query the state as shown if you want to just check
* but the main usage would be callbacks that are bound to specific state events
* What you want to do with these state things is your own concern
* and if you have functions that should react differently based on state, then those functions should query the state and handle themselves differently.

# Fabric.js
## A library exposing a pub/sub - commande/notify - request/response - and enqueue/peek/handle/release API
Idem on the browser support... catching a pattern yet?  This beauty exposes a message hub/bus/fabric in the client and exposes the API's you'd want for interacting with it.  We elected for a "URI/URN" type method of binding and publishing as opposed to "channel/topic" paradigm... which is really just opinion but fits better in our system.  That plus some AMPQ type wildcard bindings with * and # and you have some fun.
### Example

```
//fabric is a global, we might move it to be on the _u_ namespace but for now its easy to new up
var fabric = new Fabric();

//basic usage is pretty easy:
fabric.subscribe({
  "urn": "this:is:my:urn",
  "callback": function(data) { console.log(data) }
});

// * is a single "word" wildcard, # is a multi "word" wildcard
fabric.subscribe({
  "urn": "this:is:*:urn",
  "callback": function(data) { console.log(data) }
});

fabric.subscribe({
  "urn": "this:is:#",
  "callback": function(data) { console.log(data) }
});

fabric.publish({
  "urn": "this:is:my:urn",
  data: { "foo":"bar"}
});

//expects:
// {
//  raw: {urn: "this:is:my:urn"},
//  matches: ["this", "is", "my", "urn"],
//  data: {foo:"bar"}
// }

// {
//  raw: {urn: "this:is:my:urn"},
//  matches: ["this", "is", "my", "urn"],
//  data: {foo:"bar"}
// }

// {
//  raw: {urn: "this:is:my:urn"},
//  matches: ["this", "is", "my urn"],
//  data: {foo:"bar"}
// }

//request/fulfil and command/notify are really just semantic abstractions
fabric.subscribe({
  urn: "request:urn",
  callback: function(data) {
    fabric.fulfill({
      urn: data.cbUrn,
      data: "blah"
    });
  }
});

fabric.request({
  urn: "request:urn",
  callback: function(data) {
    console.log(data);
  }
});

fabric.subscribe({
  urn: "command:urn",
  callback: function(data) {
    fabric.notify({
      urn: data.cbUrn,
      data: "blah"
    });
  }
});

fabric.command({
  urn: "command:urn",
  callback: function(data) {
    console.log(data);
  }
});

//queue is where it gets a little different
fabric.enqueue({
  urn: "queue:urn",
  data: {"foo": "bar"}
});

fabric.peek({
  urn:"queue:*",
  callback: function(data) {
    console.log(data);
    fabric.handle({key:data.key})
  }
});

fabric.enqueue({
  urn: "queue:OtherUrn",
  data: {"foo": "bar"}
});

fabric.peek({
  urn:"queue:*",
  callback: function(data) {
    console.log(data);
    fabric.release({key:data.key})
  }
});


```

### Notes
* This sucker is fairly robust, it doesn't use promises at the moment but that is something we are considering so that the methods of subscribe etc would return a promise that would be fulfilled instead of taking a callback, but for now they are independant libs
* This sucker is crazy fast behind the scenes and doesn't store any references to scope objects so no scope leak zombies
* if you need a callback to be executed in a specific "scope" then you need to bind it or fucntion factory it before you call the fabric methods
