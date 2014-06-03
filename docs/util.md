# Util
Utils are generic utility methods that are quite nice to use.


### `_.__i__()`
Incrementing function. Returns a number that always goes upward.



### `_.textToDate(targetDateRange, [current]);`
Returns an object with `start` and `stop` keys that are timestamps (not `Date` objects).

- `targetDateRange`
	- string that contains a string specifying the date range you wish to select. Default is `lastDays7`. Valid options are:
		- `default` - same as `lastDays7`
		- `today` - returns the start and end of today as per the current time zone.
		- `yesterday` - returns the start and stop of yesterday.
		- `lastDays{{N}}` - returns the start and stop of the last N days, where N is a positive integer.
		- `thisWeek` - returns the start and stop of the last week, aka the most recent Sunday to the end of Saturday.
		- `lastWeek` - returns the start and stop of the last week, aka two Sundays ago to the end of Saturday that week.
		- `thisMonth` - returns the start and stop of the current month, aka the 1st to the 30th (or 28th/29th/31st).
		- `lastMonth` - returns the start and stop of the previous full month, aka the 1st to the 30th (or 28th/29th/31st) of the previous month.
		- `lastMonth3` - returns the start and stop of the previous three full months, aka the 1st to the 30th (or 28th/29th/31st) of three months ago to the end of the previous month.
		- `lastYear` - returns the start and stop of the previous full year, aka Jaunary 1st to the 31st of Decemeber of last year.
- `current` A `Date` object that all calculations are performed relative to. Default is `new Date()`. 



### `_.lockProperty(obj, key)`
Changes an objects property to enumerable, non-configurable, and non-writable.

- `obj` The object to perform the operation on.
- `key` The path in the object to lock (does not accept dot notation, only goes one level deep).



### `_.queryStringEncode(obj)`
Returns a string with query-string encoded values

- `obj` Object containing key-value pairs to be URL Query parameter encoded



### `_.queryStringDecode(str)`
Takes a query-encoded string and converts it into an object.
- `str` A URL encoded query string



### `_.htmlLinkify(str)`
Takes a standard string and replaces any URLs with links to those URLs, YouTube Videos, Vimeo videos, etc.
- `str` A string that is to have links replaced with HTML links.



### `_.getByteLength(str)`
Returns the number of bytes in a given string.
- `str` A string whose length you wish to check.



### `_.dirtyKeys(a, b, [keys], [options])`
Returns the keys on the objects that are different.
- `a` An object whose keys you wish to check.
- `b` An object whose keys you wish to check.
- `keys` An optional array that contains a subset of keys to check on the `a` and `b` objects.
- `options` An optional object that contains flags to change the functions behaviors.
	- `arrayOrderMatters` A boolean as to whether arrays with the same content and different order is the same array. Defaults to `false`.
