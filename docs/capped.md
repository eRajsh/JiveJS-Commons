# Capped

### An array like object that provides a way to set a maximum size. If you use array operators (other than []'s), the size will never exceed the maximum specified.

#### Usage

##### Constructor
```
new _.Capped([args], [seed]);
```

	- `args`
		- An object that can contain the following keys:
			- `size`
				- The maximum size of the array. Default value is `1000`.
			- `rotate`
				- Whether or not to remove values from the opposite end when full or to ignore requests to add new items. Default is `true` which causes items to be removed.
			- `seed`
				- An array for populating the capped array, similar to the `new Array([seed])` constructor.


###### Example
```
var capped = new _.Capped({ size: 5, roate: true}, [1,2,3,4,5]);

console.log(capped); // [1, 2, 3, 4, 5]

for(var i = 5; i < 10; i++) {
	capped.push(i);
}

console.log(capped.length); // 5
console.log(capped); // [5, 6, 7, 8, 9]
```
