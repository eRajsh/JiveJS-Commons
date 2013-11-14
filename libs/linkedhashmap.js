(function () {

	/**
	 * Linked hash map class that has a similar interface to a Java Map.
	 * Values/Keys are maintained in insertion order using a doubly linked list.
	 *
	 * Only String keys are supported.
	 */
	var LinkedHashMap = function() {
		this._size = 0;
		this._map = {};

		// "inner" Entry class
		this._Entry = function(key, value) {
			this.prev = null;
			this.next = null;
			this.key = key;
			this.value = value;
		};

		// doubly linked list instance variables
		this._head = this._tail = null;
	};

	var _Iterator = function(start, property) {
		this.entry = start === null ? null : start;
		this.property = property;
	};

	_Iterator.prototype = {
		hasNext: function() {
			return this.entry !== null;
		},
		next: function() {
			if(this.entry === null) {
				return null;
			}
			var value = this.entry[this.property];
			this.entry = this.entry.next;
			return value;
		}
	};

	LinkedHashMap.prototype = {

		/**
		 * Puts the key/value pair in the HashMap and records
		 * the insertion record if it does not exist.
		 */
		put: function(key, value) {
			var entry;
			if(!this.containsKey(key)) {
				entry = new this._Entry(key, value);
				if(this._size === 0) {
					this._head = entry;
					this._tail = entry;
				} else {
					this._tail.next = entry;
					entry.prev = this._tail;
					this._tail = entry;
				}
				this._size++;
			} else {
				entry = this._map[key];
				entry.value = value;
			}

			this._map[key] = entry;
		},

		/**
		 * Removes the key/value pair from the map and
		 * the key from the insertion order.
		 */
		remove: function(key) {
			var entry;
			if(this.containsKey(key)) {
				this._size--;
				entry = this._map[key];
				delete this._map[key];

				if(entry === this._head) {
					this._head = entry.next;
					this._head.prev = null;
				} else if(entry === this._tail) {
					this._tail = entry.prev;
					this._tail.next = null;
				} else {
					entry.prev.next = entry.next;
					entry.next.prev = entry.prev;
				}
			} else {
				entry = null;
			}

			return entry === null ? null : entry.value;
		},

		/**
		 * Checks if this map contains the given key.
		 */
		containsKey: function(key) {
			return this._map.hasOwnProperty(key);
		},

		/**
		 * Checks if this map contains the given value.
		 * Note that values are not required to be unique.
		 */
		containsValue: function(value) {
			for(var key in this._map) {
				if(this._map.hasOwnProperty(key)) {
					if(this._map[key].value === value) {
						return true;
					}
				}
			}

			return false;
		},

		/**
		 * Returns the value associated with the key.
		 */
		get: function(key) {
			return this.containsKey(key) ? this._map[key].value : null;
		},

		/**
		 * Clears the HashMap and insertion order.
		 */
		clear: function() {
			this._size = 0;
			this._map = {};
			this._head = this._tail = null;
		},

		/**
		 * Returns the HashMap keys in insertion order.
		 *
		 * @param {string} from - The key to start from. If not provided, will start from head.
		 */
		keys: function(from) {
			var keys = [], start = null;

			if(from) {
				start = this.containsKey(from) ? this._map[from] : null;
			} else {
				start = this._head;
			}

			for(var cur = start; cur != null; cur = cur.next) {
				keys.push(cur.key);
			}
			return keys;
		},

		/**
		 * Returns the HashMap values in insertion order.
		 *
		 * @param {string} from - The key to start from when getting the values.
		 */
		values: function(from) {
			var values = [], start = null;

			if(from) {
				start = this.containsKey(from) ? this._map[from] : null;
			} else {
				start = this._head;
			}

			for(var cur = start; cur != null; cur = cur.next) {
				values.push(cur.value);
			}
			return values;
		},

		iterator: function(from, type) {
			var property = "value";
			if(type && (type === "key" || type === "keys")) {
				property = "key";
			}
			var entry = this.containsKey(from) ? this._map[from] : null;
			return new _Iterator(entry, property);
		},

		/**
		 * Returns the size of the map, which is
		 * the number of keys.
		 */
		size: function() {
			return this._size;
		}
	};

	_.LinkedHashMap = LinkedHashMap;
}());
