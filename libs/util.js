/**
 * Utils.js returns a utility object on and also sets it on the self._ namesapce
 *     this class has utility functions similar to underscore/lodash but also needed
 *     by the osgi.js framework and bundle.  It could be used outside of this framwork
 *     but in that case it would make more sense just to pick out individual functions.
 * @closure returns a utility object
 * @returns {object} utilities object
 **/
(function() {
	"use strict";

	/**
	 * This is a particularly fun little trick for a globally unique ID generator.
	 * essentially _.__i__() is going to always return a unique integer.  It is then
	 * very easy to generate unique Id's and uniqueID strings by prepending or appending
	 * or mising the __i__ into the middle of another string etc.
	 **/
	var i = 0;
	_.__i__ = function() {
		return i++;
	};

	/**
	 * fileSytemError is a helper for the error callback of some of the new HTML5 file system
	 *     error events... translating them into messages which are easier to understand
	 * @function
	 * @public
	 * @param {error} e - the file sysetm error object
	 * @return {null} null
	 **/
	_.fileSystemError = function(e) {
		var msg = '';
		switch (e.name) {
			case 'QUOTA_EXCEEDED_ERR':
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case 'NOT_FOUND_ERR':
				msg = 'NOT_FOUND_ERR';
				break;
			case 'SECURITY_ERR':
				msg = 'SECURITY_ERR';
				break;
			case 'INVALID_MODIFICATION_ERR':
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case 'INVALID_STATE_ERR':
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
		};
		console.log('Error: ' + msg);
		return;
	};

	/**
	 * lockproperty is a helper for "locking" an objects property
	 * @function
	 * @public
	 * @param {object} scope - scope object
	 * @param {string} prop - the property to lock
	 * @return {null} null
	 **/
	_.lockProperty = function(scope, prop) {
		Object.defineProperty(scope, prop, {
			enumerable: true,
			configurable: false,
			writable: false
		});
		return;
	};

	/**
	 * create props is a helper for creating several properties with
	 *     defined attributes onto the scope object.
	 * @function
	 * @public
	 * @param {Object} scope - scope object
	 * @param {Array} props - the array of properties to set, each array
	 *                      item is an object with a name and attrs property
	 * @return {null} null
	 **/
	_.createProps = function(scope, props) {
		for (var i = 0; i < props.length; i++) {
			Object.defineProperty(scope, props[i].name, props[i].attrs);
		}
		return;
	};

	/**
	 * create prop is a helper for creating a single property with
	 *     defined attributes onto the scope object
	 * @function
	 * @public
	 * @param {Object} scope - scope object
	 * @param {Array} prop - an object with a name and attrs property
	 * @return {null} null
	 **/
	_.createProp = function(scope, prop) {
		Object.defineProperty(scope, prop.name, prop.attrs);
		return;
	};

	/**
	 * update prop is a helper for updating a single property with
	 *     defined attributes onto the scope object, is really the same
	 *     as create prop
	 * @function
	 * @public
	 * @param {Object} scope - scope object
	 * @param {Array} prop - an object with a name and attrs property
	 * @return {null} null
	 **/
	_.updateProp = function(scope, prop) {
		Object.defineProperty(scope, prop.name, prop.attrs);
		return;
	};


	/**
	 * parseVersion takes a OSGI style version string and parses it into a version object
	 *     these versions can take the form of a single string ##.##.## of a range
	 *     from [##.##.##, ##.##.##] or (##.##.##, ##.##.##) where the square bracket
	 *     means up to and including that version and the parenthesis means only up to that version.
	 *     As in the difference between < and <= , or also > and >=
	 * @function
	 * @public
	 * @param {string} version - the OSGi string version property
	 * @return {object} a version object
	 **/
	_.parseVersion = function(version) {
		var versions = version.split(',');
		var resp = {}
		if (versions.length > 1) {
			var start = versions[0].charAt(0);
			var end = versions[1].charAt(versions[1].length - 1);
			if (start == "[") {
				resp.gte = versions[0].substring(1).trim();
			} else if (start == "(" || start == "{") {
				resp.gt = versions[0].substring(1).trim();
			}

			if (end == "]") {
				resp.lte = versions[1].substring(0, versions[1].length - 1).trim()
			} else if (end == ")" || end == "}") {
				resp.lt = versions[1].substring(0, versions[1].length - 1).trim()
			}
		} else {
			resp.eq = versions[0];
		}
		return resp;
	};

	/**
	 * sanitize the version string into a version number.  This is based off
	 *     a string of this format ##.##.## where you have major, minor and micro versions
	 * @function
	 * @public
	 * @param {string} version - the OSGi string version property
	 * @return {int} the version string converted to an integer value for range matching and sorting.
	 **/
	_.sanitizeVersion = function(version) {
		var num = 0;

		//split the version string based on the delimter
		var splits = version.split(".");

		//if the string was not of the proper format then pad it accordingly
		var dif = 3 - splits.length;
		for (var i = 0; i < dif; i++) {
			splits.push(0);
		}

		//convert the split strings into a single sanitized number.
		//this might need revisited if we want to loosen the convention on the
		//versions to allow more than two digits in each "level"
		num += parseInt(splits[0], 10) * 1000000;
		num += parseInt(splits[1], 10) * 1000;
		num += parseInt(splits[2], 10);
		return num;
	};


	/**
	 * Match a target version to a range or single version searcher.  This utilizes
	 *     the sanitizeVersion function to get all versions into an easily comparable format.
	 * @function
	 * @public
	 * @param {object} exp - the target version object from parseVersion,
	 *                   this must be a single version object which has a .eq property
	 * @param {object} imp - the comparator version object from parseVersion
	 * @return {bool} Whether the target version matches the required range or not
	 **/
	_.versionMatch = function(exp, imp) {
		var target = _.sanitizeVersion(exp.eq);

		//if any condition returns true then it does not match
		if (imp.eq && _.sanitizeVersion(imp.eq) != target) return false;
		if (imp.gte && _.sanitizeVersion(imp.gte) > target) return false;
		if (imp.gt && _.sanitizeVersion(imp.gt) >= target) return false;
		if (imp.lte && _.sanitizeVersion(imp.lte) < target) return false;
		if (imp.lt && _.sanitizeVersion(imp.lt) <= target) return false;
		return true;
	};


	/**
	 * Can't take credit for this one, since I found it online, but this baby will take a string and
	 *     essentially "hash" it using a sha or md5 esquq algorithm... It is not a true md5 nor a true sha,
	 *     but is only used for locally hashing a string for quicker comparators for when the string has changed.
	 * @function
	 * @public
	 * @param {String} str - the string to hash, it could be an object that has been stringified etc
	 * @return {Number} the computed hash of the string
	 * Note: theoretical range of -2^32 to 2^32 soooo   -4294967296 to 4294967296 but we add 4294967296
	 * 			so it is from 0 to 8589934592 
	 **/
	_.hash = function(str) {
		if(_.isNormalObject(str)) {
			str = JSON.stringify(str);
		}
		str = _.encode_utf8(str);
		var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
		var crc = 0,
			x = 0,
			y = 0;
		crc = crc ^ (-1);
		for (var i = 0, iTop = str.length; i < iTop; i++) {
			y = (crc ^ str.charCodeAt(i)) & 0xFF;
			x = "0x" + table.substr(y * 9, 8);
			crc = (crc >>> 8) ^ x;
		}
		return crc ^ (-1) + 4294967296;
	};

	/**
	 * a simple wrapper around encodeURIComponent for use by the hash function
	 * @function
	 * @public
	 * @param {string} str - string to encode
	 * @return {string} the encoded string
	 **/
	_.encode_utf8 = function(str) {
		return unescape(encodeURIComponent(str));
	};

	/**
	 * a simple wrapper around decodeURIComponent
	 * @function
	 * @public
	 * @param {string} str - string to decod
	 * @return {string} the decoded string
	 **/
	_.decode_utf8 = function(str) {
		return decodeURIComponent(escape(str));
	};

	/**
	 * Encodes a given object into a URL encoded string.
	 *
	 * @param {Object} obj
	 * @return {String}
	 * @api private
	 */
	_.queryStringEncode = function(obj) {
		var ret = [];
		if (_.isNormalObject(obj)) {
			for (var key in obj) {
				ret.push(_.encode_utf8(key) + "=" + _.encode_utf8(obj[key]));
			}
		}
		return ret.join("&");
	};

	/**
	 * Encodes a given object into a URL encoded string.
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api private
	 */
	_.queryStringDecode = function(str) {
		str = str.replace(/^\?/, "");

		var ret = {};
		if (_.isString(str)) {
			var pairs = str.split("&");
			for (var i = 0; i < pairs.length; i++) {
				var pair = pairs[i].split("=");
				ret[_.decode_utf8(pair[0])] = _.decode_utf8(pair[1]);
			}
		}

		return ret;
	};

	var linkify_regex = new RegExp(
		'('
	// leading scheme:// or "www."
	+ '\\b([a-z][-a-z0-9+.]+://|www\\.)'
	// everything until non-URL character
	+ '[^\\s\'"<>()]+' + '|'
	// email
	+ '\\b[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}\\b' + ')', 'gi');

	/**
	 * "Linkify" the given string of text for inclusion in HTML
	 *
	 * @param {String} string
	 * @param {String}
	 * @api private
	 */

	var youtube_regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;

	_.youtube_parser  = function(url) {
		var match = url.match(youtube_regex);
		if (match && match[1].length == 11) {
			return match[1];
		} else {
			return false;
		}
	};

	var vimeo_regex = /http:\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

	_.vimeo_parser = function(url) {
		var match = url.match(vimeo_regex);
		if (match) {
			return match[2];
		} else {
			return false;
		}
	};

	_.htmlLinkify = function(string) {
		var m;
		var result = "";
		var p = 0;
		while (m = linkify_regex.exec(string)) {
			result += string.substr(p, m.index - p);

			var l = m[0].replace(/\.*$/, ''); // Remove any trailing dots from the url
			var yt = _.youtube_parser(l);
			var vm = _.vimeo_parser(l);

			if (yt) {
				result += "<div class='video-container'><iframe id='ytplayer' type='text/html' src='http://www.youtube.com/embed/" + yt + "?autoplay=0' frameborder='0' allowfullscreen></iframe></div>";
			} else if (vm) {
				result += "<div class='video-container'><iframe src='http://player.vimeo.com/video/" + vm + "' frameborder='0' allowFullScreen></iframe></div>"
			} else if (l.indexOf("@") > 0) {
				result += "<a target=\"_blank\" href=\"";
				result += "mailto:";
				result += l + "\">" + string.substr(m.index, l.length) + "</a>";
			} else if (l.indexOf(":/") < 0) {
				result += "<a target=\"_blank\" href=\"";
				result += "http://";
				result += l + "\">" + string.substr(m.index, l.length) + "</a>";
			} else {
				result += "<a target=\"_blank\" href=\"";
				result += l + "\">" + string.substr(m.index, l.length) + "</a>";
			}
			p = m.index + l.length;
		}
		return result + string.substr(p);
	};

	_.getCurrentLocationRoute = function() {
		var data = {
			route: (window.location.pathname + window.location.hash),
			host: window.location.host,
			pathname: window.location.pathname,
			search: window.location.search,
			href: window.location.href,
			hash: window.location.hash
		};

		// Replace the "#"'s with slashes.
		data.route = data.route.replace(/\/#\/|\/#|#/, "/");
		// Replace leading and trailing slashes
		data.route = data.route.replace(/^\/|\/$/g, "");
		// Replace the slashes with colons.
		data.route = data.route.replace(/\//g, ":");

		return data;
	};

	/**
	 *
	 */
	_.getByteLength = function(str) {
		if (str === null || str === undefined) {
			return 0;
		}
		var m = encodeURIComponent(str).match(/%[89ABab]/g);
		return str.length + (m ? m.length : 0);
	};

	/**
	 * a helper function to access either properties or properties of an options parameter of a target object
	 * @function
	 * @public
	 * @param {object} target - the target object upon which to extract the property
	 * @param {string} optionName - the property to look for
	 * @return {object} the value of the target["options"][optionName] || target[optionName] || undefined
	 **/
	_.getOption = function(target, optionName) {
		if (!target || !optionName) {
			return;
		}

		//if the target has an options property and optionName is in that property not undefined then use that value
		if (target.options && (optionName in target.options) && (target.options[optionName] !== undefined)) {
			return target.options[optionName];
		}
		//otherwise use the value of the optionName property on the target object
		else {
			return target[optionName];
		}
	};

	_.dirtyKeys = function(a, b, keys, options) {
		options = options || {};
		keys = keys || null;
		a = a || {};
		b = b || {};

		var aKeys, bKeys;
		var dirtyKeys = {};
		var keysArray;
		var i = 0;

		var tempAKeys = Object.keys(a);
		var tempBKeys = Object.keys(b);

		if(keys) {
			aKeys = keys;
			bKeys = keys;

			for(var i = 0; i < keys.length; i++) {
				if(tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
					return false;
				}
			}
		} else {
			aKeys = tempAKeys;
			bKeys = tempBKeys;
		}

		for(i = 0; i < aKeys.length; i++) {
			dirtyKeys[aKeys[i]] = dirtyKeys[aKeys[i]] || {};
			dirtyKeys[aKeys[i]].aVal = a[aKeys[i]];
		}

		for(i = 0; i < bKeys.length; i++) {
			dirtyKeys[bKeys[i]] = dirtyKeys[bKeys[i]] || {};
			dirtyKeys[bKeys[i]].bVal = b[bKeys[i]];
			if((typeof dirtyKeys[bKeys[i]].aVal !== 'undefined' && _.isEqual(dirtyKeys[bKeys[i]].aVal, dirtyKeys[bKeys[i]].bVal, null, options))
					|| (typeof dirtyKeys[bKeys[i]].aVal === 'undefined' && typeof dirtyKeys[bKeys[i]].bVal === 'undefined')) {
				delete dirtyKeys[bKeys[i]];
			}
		}
		keysArray = Object.keys(dirtyKeys);
		for(i = 0; i < keysArray.length; i++) {
			dirtyKeys[keysArray[i]].diff = _.diffValues(dirtyKeys[keysArray[i]].aVal, dirtyKeys[keysArray[i]].bVal, options);
		}

		return dirtyKeys;
	};

	_.diffValues = function(a, b, options) {
		options = options || {
			arrayOrderMatters: false
		};
		var aType, bType;
		if(typeof a === "undefined") {
			aType = "undefined";
		} else {
			aType = Object.prototype.toString.call(a);
		}
		if(typeof b === "undefined") {
			bType = "undefined";
		} else {
			bType = Object.prototype.toString.call(b);
		}

		if(aType !== bType) {
			return {
				from: {type: aType, value: a},
				to: {type: bType, value: b}
			};
		} else {
			switch(aType) {
				case '[object Object]':
					return { "objectChange" : _.dirtyKeys(a, b)};
				break;

				case '[object Array]':
					var ret = {
							removed: [],
							added: [],
							changed: []
					};
					if(options.arrayOrderMatters) {
						var i, j;
						var iMax = a.length;
						var jMax = b.length;

						while(i < aMax && j < bMax) {
							if(_.isEqual(a[i], b[j])) {
								i++; j++;
							}
							if(j < jMax && i < iMax) {
								ret.changed.push({
									index: i,
									from: a[i],
									to: b[j],
									diff: _.diffValues(a[i], b[j], options)
								});
								j++; i++;
							} else if(i < iMax && j >= jMax) {
								ret.removed.push({
									index: i,
									from: a[i],
									to: null
								});
								i++;
							} else if(j < jMax && i >= iMax) {
								ret.added.push({
									index: i,
									from: null,
									to: b[j]
								});
								i++;
							}
						}
					} else {
						var aIndexesMatched = [];
						var bIndexesMatched = [];
						var aIndexMatched, bIndexMatched, i = 0, j = 0;
						for(i = 0; i < a.length; i++) {
							aIndexMatched = false;
							for(j = 0; j < b.length; j++) {
								if(_.isEqual(a[i], b[j])) {
									aIndexMatched = true;
									aIndexesMatched.push(i);
									bIndexesMatched.push(j);
									break;
								}
							}
							if(!aIndexMatched) {
								ret.removed.push({
									index: null,
									from: a[i],
									to: null
								});
							}
						}

						for(j = 0; j < b.length; j++ ) {
							bIndexMatched = false;
							if(bIndexesMatched.indexOf(j) >= 0) {
								continue;
							}
							ret.added.push({
								index:null,
								from:null,
								to: b[j]
							});
						}
						return ret;
					}
				break;

				default:
					return {
						from: {type: aType, value: a},
						to: {type: bType, value: b}
					};
				break;
			}
		}
	};

	_.isDirtyEqual = function(a, b, keys, options) {
		keys = keys || null;
		options = options || {};
		var aKeys, bKeys, aType, bType;

		if(a === b || a == b) {
			return true;
		}

		aType = Object.prototype.toString.call(a);
		bType = Object.prototype.toString.call(b);
		if(aType !== bType) {
			return false;
		}

		switch(aType) {
			case '[object Object]':
				var tempAKeys = Object.keys(a);
				var tempBKeys = Object.keys(b);

				if(keys) {
					aKeys = keys;
					bKeys = keys;

					for(var i = 0; i < keys.length; i++) {
						if(tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
							return false;
						}
					}
				} else {
					aKeys = tempAKeys;
					bKeys = tempBKeys;
				}

				if(aKeys.length !== bKeys.length) {
					return false;
				}

				if(keys || _.isDirtyEqual(aKeys, bKeys, null, options)) {

					for(var i = 0; i < aKeys.length; i++) {
						if(!_.isDirtyEqual(a[aKeys[i]], b[bKeys[i]], null, options)) {

							return false;
						}
					}

					return true;
				} else {
					return false;
				}
			break;

			case '[object Array]':
				if(a.length !== b.length) {
					return false;
				}

				for(var i = 0; i < a.length; i++) {
					if(!_.isDirtyEqual(a[i], b[i], null, options)) {
						return false;
					}
				}
				return true;
			break;

			case '[object Function]':
				if(a.toString() !== b.toString()) {
					return false;
				}
			break;

			case '[object Number]':
				if(a != b) {
					return false;
				}
			break;

			case '[object Date]':
				if(a.getTime() != b.getTime()) {
					return false;
				} else {
					return true;
				}
			break;
		}

		return false;
	};

	/**
	 * a simple one liner for whether it is an object or not
	 * @function
	 * @public
	 * @param {???} item - an item of any type, here we are checking the type
	 * @return {bool} whether it is an object or not
	 **/
	_.isNormalObject = function(item) {
		return (Boolean(item) && Object.prototype.toString.call(item) === '[object Object]');
	};

	var isUrnRegex = /^[^:]+:.*[^:]$/;
	_.isUrn = function(urn) {
		return (_.isString(urn) && isUrnRegex.exec(urn));
	};

	// For the lazy
	_.isRegex = _.isRegExp;

	/**
	 * genericizeTargetSelectorQueryString converts a DOM element into a selector.
	 *
	 * @function
	 * @public
	 * @param {DOMElement} ele - A DOM element whose selector string is returned.
	 * @return {String} A selector string that represents the ele.
	 **/
	_.genericizeTargetSelectorQueryString = function(ele) {
		var qs = [];
		if (ele.globalSelectorString != "" && ele.globalSelectorString != null && ele.globalSelectorString != undefined) {
			return ele.globalSelectorString;
		}
		qs = recursiveGenericizeTargetSelectorQueryString(ele, qs);
		qs = qs.join(" > ");
		ele.globalSelectorString = qs;
		//todo ... worry about cache busting this bugger?
		return qs;
	};

	function recursiveGenericizeTargetSelectorQueryString(ele, qs) {
		if (ele.tagName == "BODY" || ele.tagName == "body") {
			qs.unshift("body");
			return qs;
		} else {
			var id = "#" + ele.id;
			if (id != "#") {
				qs.unshift(id);
				return qs;
			}

			var className = "." + ele.className.split(" ").join(".");
			if (className !== ".") {
				var siblings = ele.parentNode.children;
				var siblingsThatMatter = [];
				for (var i = 0; i < siblings.length; i++) {
					if (siblings[i].className.split(" ").join(".") == className) {
						siblingsThatMatter.push(siblings[i]);
					}
				}

				if (siblingsThatMatter.length > 1) {
					var index = Array.prototype.indexOf.call(siblingsThatMatter, ele) + 1;
					className = className + ":nth-child(" + index + ")";
				}
				qs.unshift(className);
				return recursiveGenericizeTargetSelectorQueryString(ele.parentNode, qs);
			}

			var tagName = ele.tagName;
			var siblings = ele.parentNode.children;
			var siblingsThatMatter = [];
			for (var i = 0; i < siblings.length; i++) {
				if (siblings[i].tagName == tagName) {
					siblingsThatMatter.push(siblings[i]);
				}
			}

			if (siblingsThatMatter.length > 1) {
				var index = Array.prototype.indexOf.call(siblingsThatMatter, ele) + 1;
				tagName = tagName + ":nth-child(" + index + ")";
			}
			qs.unshift(tagName);
			return recursiveGenericizeTargetSelectorQueryString(ele.parentNode, qs);
		}
	};

	/**
	 * whiteListDomEvent makes DOM events safe to send across the web-worker edges.
	 * after the last call to debounce.
	 *
	 * @function
	 * @public
	 * @param {Event} e - A DOM event.
	 * @return {Object} An object that has been sanitized for web worker transit.
	 **/
	_.whiteListDomEvent = function(e, ele) {
		ele = ele || e.currentTarget
		var data = {
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			shiftKey: e.shiftKey,
			metaKey: e.metaKey,

			button: e.button,
			charCode: e.charCode,
			keyCode: e.keyCode,
			which: e.which,

			clientX: e.clientX,
			clientY: e.clientY,
			screenX: e.screenX,
			screenY: e.screenY,
			x: e.x,
			y: e.y,
			offsetX: e.offsetX,
			offsetY: e.offsetY,
			pageX: e.pageX,
			pageY: e.pageY,
			layerX: e.layerX,
			layerY: e.layerY,
			webkitMovementX: e.webkitMovementX,
			movementX: e.movementX,
			webkitMovementY: e.webkitMovementY,
			movementY: e.movementY,

			timeStamp: e.timeStamp,
			type: e.type,

			target: _.genericizeTargetSelectorQueryString(e.target),
			currentTarget: _.genericizeTargetSelectorQueryString(ele),

			clipboardData: e.clipboardData,

			targetValue: e.target.value,
			currentTargetValue: e.currentTarget.value
		};

		return data;
	};

	/**
	 * preallocateXhrs Sets up an array of XHRs.
	 *
	 * @function
	 * @public
	 * @param {Array} keys - An array of strings that gets converted to an object and array.
	 * @return {Object} An object that contains both an array and a hash of DFDs/Promises.
	 **/
	_.preallocateXhrs = function(keys) {
		var resp = {
			dfds: {},
			pros: []
		};
		for (var i = 0; i < keys.length; i++) {
			resp.dfds[keys[i]] = new _.Dfd();
			resp.pros.push(resp.dfds[keys[i]].promise());
		}
		return resp;
	};

	_.viewHelpers = {
		
		roundAndPad: function(number, howManyToRound, howManyToPad, roundFunc) {
			howManyToRound = ("" + Math.pow(10, howManyToRound)); 

			var numberArray = ("" + Math[roundFunc](number * howManyToRound)/howManyToRound).split('.');

			if (!numberArray[1]){
				//Wipe the 'undefined' off the array
				numberArray[1] = '';
				for (var i = 0; i < howManyToPad; i++){
					numberArray[1] = numberArray[1] + "0";
				}	
			} else {
				for (var j = 1; j < (howManyToPad - numberArray[1].length); j++){
					numberArray[1] = numberArray[1] + "0";
				}
			}
			//Check if the number is whole, and if so delete the decimal off the end.
			if (!numberArray[1]){
				return numberArray[0];
			} else {
				return numberArray[0] + "." + numberArray[1];
			}			
		},


		roundThreeAndPad: function(number){
			var numberArray = ("" + Math.round(number * 1000)/1000).split('.');

			if (!numberArray[1]) {
				numberArray[1] = "000";
			} else if (numberArray[1].length === 1) {
				numberArray[1] = "" + numberArray[1] + "00";
			} else if (numberArray[1].length === 2) {
				numberArray[1] = "" + numberArray[1] + "0";
			} 

			return numberArray[0] + "." + numberArray[1];
		},


		/**
		 * canonicalizeMenu Makes an awesome object for the menu. It's recursive and it returns
		 * an object with duplicates removed in a special way.
		 *
		 * @function
		 * @public
		 * @param {Object} menu - An object that contains menus
		 * @return {Object} A menu object that has been flattened, de-duped, etc.
		 **/
		canonicalizeMenu: function(menu) {
			var canonicalMenu = canonicalMenu || {};
			for (var i = 0; i < menu.length; i++) {
				var menuData = menu[i].data;
				var conflictData = {};
				var conflictsCounter = {};

				for (var menuName in menuData) {

					canonicalMenu[menuName] = canonicalMenu[menuName] || {
						"children": menuData[menuName]['children'],
						"class": menuData[menuName]['class'],
						"name": menuData[menuName]['name'],
						"link": menuData[menuName]['link'],
						"parentClass": menuData[menuName]['parentClass']
					};  

					if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(menuData[menuName].children).length === 0) {

					} else {
						if (Object.keys(menuData[menuName].children).length === 0 || Object.keys(canonicalMenu[menuName].children).length === 0) {
							conflictsCounter[menuName] = conflictsCounter[menuName] || 0;
							conflictsCounter[menuName]++;
							conflictData[menuName + " (" + conflictsCounter[menuName] + ")"] = menuData[menuName];
						} else {
							canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, (menuData[menuName].children || {}));
						}
					}
				}

				for(var menuName in conflictData) {
					canonicalMenu[menuName] = canonicalMenu[menuName] || {
						"children": conflictData[menuName]['children'],
						"class": conflictData[menuName]['class'],
						"name": conflictData[menuName]['name'],
						"link": conflictData[menuName]['link'],
						"parentClass": conflictData[menuName]['parentClass']
					};

					if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(conflictData[menuName].children).length === 0) {
					
					} else {
						canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, (conflictData[menuName].children || {}));
					}
				}
			}

			return canonicalMenu;
		},

		canonicalizeMenuChildren: function(currentChildren, newChildren) {
			if (!currentChildren && !newChildren) {
				return {};
			}

			var canonicalizedChildren = {};

			var key;
			for (key in currentChildren) {
				canonicalizedChildren[key] = currentChildren[key];
				if (newChildren[key]) {
					canonicalizedChildren[key].children = _.viewHelpers.canonicalizeMenuChildren(currentChildren[key].children, newChildren[key].children);
					canonicalizedChildren[key]['class'] = currentChildren[key]['class'] + " " + newChildren[key]['class'];
					canonicalizedChildren[key]['name'] = currentChildren[key]['name'] + " " + newChildren[key]['name'];
					canonicalizedChildren[key]['link'] = newChildren[key]['link'];
				}
			}

			for (key in newChildren) {
				if (!canonicalizedChildren[key]) {
					canonicalizedChildren[key] = newChildren[key];
				}
			}

			return canonicalizedChildren;
		},

		prettifyDate: function(firstTime, lastTime) {
			if(lastTime && lastTime.getTime) {
				lastTime = lastTime.getTime();
			} else if(lastTime) {
				lastTime = new Date(lastTime).getTime();
			} else {
				lastTime = new Date().getTime();
			}

			if(firstTime && firstTime.getTime) {
				firstTime = firstTime.getTime();
			} else if(firstTime) {
				firstTime = new Date(firstTime).getTime();
			} else {
				firstTime = new Date().getTime();
			}


			var diff = Math.abs(lastTime - firstTime);

			var days = (diff / (1000 * 60 * 60 * 24));
			var hours = ((days % 1) * 24);
			var minutes = ((hours % 1) * 60);

			days = Math.floor(days);
			hours = Math.floor(hours);
			minutes = Math.floor(minutes);

			if(days) {
				days += "d ";
				hours += "hr";
				return (days + hours);
			} else if(hours) {
				hours += "hr ";
				minutes += "m";
				return (hours + minutes);
			} else {
				minutes += "m";
				return minutes;
			}
		},

		formatDate: function(format, date) {
			var ret = "";

			// If it's not a date already, try to make it one
			if(!_.isDate(date)) {
				date = new Date(date);

				if(!_.isDate(date)) {
					// Apparently making it failed, so just make one with now as the time
					// This makes for nice defaults.
					date = new Date();
				}
			}

			ret = date.getFullYear()
				+  "/"
				+  date.getMonth()
				+  "/"
				+  date.getDate();

			return ret;
		},

		formatTime: function(format, date) {
			var ret = "";

			// If it's not a date already, try to make it one
			if(!_.isDate(date)) {
				date = new Date(date);

				if(!_.isDate(date)) {
					// Apparently making it failed, so just make one with now as the time
					// This makes for nice defaults.
					date = new Date();
				}
			}

			var hours = date.getHours();
			var minutes = date.getMinutes();
			var AMPM;

			if(hours >= 12) {
				hours -= 12;
				AMPM = "PM";
			} else {
				AMPM = "AM";
			}

			// Stupid .getMinutes returns "9" if it's "4:09". Damn thing
			if(minutes < 10) {
				minutes = "0" + minutes;
			}

			ret = hours + ":" + minutes + " " + AMPM;

			return ret;
		},

		escapeHtml: _.escape,
		escape: _.escape,
	};

	//return the utility object for direct consumption if needed.
	return _;
})();
