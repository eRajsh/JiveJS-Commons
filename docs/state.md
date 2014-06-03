# State
## A Finite State Machine
Idem to Promise on the browser compatability and the future timeline.  This baby grew out of the realization that promises and deferred specs are really just artificially handicapped state machines.  They impose an artificial limitation on the amount of states and on the transfer from state to state.  Removing these gives us State.js
### Example

```
//Stashes on the global _ on the property State...
//The closure also returns the State constructor and could be munged to work in AMD/Common if we gave a...

//you construct it up with the states it contains
var state = new _.State({
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
