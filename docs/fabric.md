# Fabric
### A library exposing a pub/sub - commande/notify - request/response - and enqueue/peek/handle/release API
Idem on the browser support... catching a pattern yet?  This beauty exposes a message hub/bus/fabric in the client and exposes the API's you'd want for interacting with it.  We elected for a "URI/URN" type method of binding and publishing as opposed to "channel/topic" paradigm... which is really just opinion but fits better in our system.  That plus some AMPQ type wildcard bindings with * and # and you have some fun.

#### Example

```
//fabric is a global, we might move it to be on the _ namespace but for now its easy to new up
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
