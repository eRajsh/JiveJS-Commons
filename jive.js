var _ = function() {
    var undefined;
    var arrayPool = [], objectPool = [];
    var idCounter = 0;
    var indicatorObject = {};
    var keyPrefix = +new Date() + "";
    var largeArraySize = 75;
    var maxPoolSize = 40;
    var whitespace = " 	\f ﻿" + "\n\r\u2028\u2029" + " ᠎             　";
    var reEmptyStringLeading = /\b__p \+= '';/g, reEmptyStringMiddle = /\b(__p \+=) '' \+/g, reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
    var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
    var reFlags = /\w*$/;
    var reFuncName = /^\s*function[ \n\r\t]+\w/;
    var reInterpolate = /<%=([\s\S]+?)%>/g;
    var reLeadingSpacesAndZeros = RegExp("^[" + whitespace + "]*0+(?=.$)");
    var reNoMatch = /($^)/;
    var reThis = /\bthis\b/;
    var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;
    var contextProps = [ "Array", "Boolean", "Date", "Error", "Function", "Math", "Number", "Object", "RegExp", "String", "_", "attachEvent", "clearTimeout", "isFinite", "isNaN", "parseInt", "setImmediate", "setTimeout" ];
    var shadowedProps = [ "constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf" ];
    var templateCounter = 0;
    var argsClass = "[object Arguments]", arrayClass = "[object Array]", boolClass = "[object Boolean]", dateClass = "[object Date]", errorClass = "[object Error]", funcClass = "[object Function]", numberClass = "[object Number]", objectClass = "[object Object]", regexpClass = "[object RegExp]", stringClass = "[object String]";
    var cloneableClasses = {};
    cloneableClasses[funcClass] = false;
    cloneableClasses[argsClass] = cloneableClasses[arrayClass] = cloneableClasses[boolClass] = cloneableClasses[dateClass] = cloneableClasses[numberClass] = cloneableClasses[objectClass] = cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;
    var debounceOptions = {
        leading: false,
        maxWait: 0,
        trailing: false
    };
    var descriptor = {
        configurable: false,
        enumerable: false,
        value: null,
        writable: false
    };
    var iteratorData = {
        args: "",
        array: null,
        bottom: "",
        firstArg: "",
        init: "",
        keys: null,
        loop: "",
        shadowedProps: null,
        support: null,
        top: "",
        useHas: false
    };
    var objectTypes = {
        "boolean": false,
        "function": true,
        object: true,
        number: false,
        string: false,
        undefined: false
    };
    var stringEscapes = {
        "\\": "\\",
        "'": "'",
        "\n": "n",
        "\r": "r",
        "	": "t",
        "\u2028": "u2028",
        "\u2029": "u2029"
    };
    var root = objectTypes[typeof window] && window || this;
    var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;
    var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;
    var freeGlobal = objectTypes[typeof global] && global;
    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }
    function baseIndexOf(array, value, fromIndex) {
        var index = (fromIndex || 0) - 1, length = array ? array.length : 0;
        while (++index < length) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
    function cacheIndexOf(cache, value) {
        var type = typeof value;
        cache = cache.cache;
        if (type == "boolean" || value == null) {
            return cache[value] ? 0 : -1;
        }
        if (type != "number" && type != "string") {
            type = "object";
        }
        var key = type == "number" ? value : keyPrefix + value;
        cache = (cache = cache[type]) && cache[key];
        return type == "object" ? cache && baseIndexOf(cache, value) > -1 ? 0 : -1 : cache ? 0 : -1;
    }
    function cachePush(value) {
        var cache = this.cache, type = typeof value;
        if (type == "boolean" || value == null) {
            cache[value] = true;
        } else {
            if (type != "number" && type != "string") {
                type = "object";
            }
            var key = type == "number" ? value : keyPrefix + value, typeCache = cache[type] || (cache[type] = {});
            if (type == "object") {
                (typeCache[key] || (typeCache[key] = [])).push(value);
            } else {
                typeCache[key] = true;
            }
        }
    }
    function charAtCallback(value) {
        return value.charCodeAt(0);
    }
    function compareAscending(a, b) {
        var ac = a.criteria, bc = b.criteria;
        if (ac !== bc) {
            if (ac > bc || typeof ac == "undefined") {
                return 1;
            }
            if (ac < bc || typeof bc == "undefined") {
                return -1;
            }
        }
        return a.index - b.index;
    }
    function createCache(array) {
        var index = -1, length = array.length, first = array[0], mid = array[length / 2 | 0], last = array[length - 1];
        if (first && typeof first == "object" && mid && typeof mid == "object" && last && typeof last == "object") {
            return false;
        }
        var cache = getObject();
        cache["false"] = cache["null"] = cache["true"] = cache["undefined"] = false;
        var result = getObject();
        result.array = array;
        result.cache = cache;
        result.push = cachePush;
        while (++index < length) {
            result.push(array[index]);
        }
        return result;
    }
    function escapeStringChar(match) {
        return "\\" + stringEscapes[match];
    }
    function getArray() {
        return arrayPool.pop() || [];
    }
    function getObject() {
        return objectPool.pop() || {
            array: null,
            cache: null,
            criteria: null,
            "false": false,
            index: 0,
            "null": false,
            number: null,
            object: null,
            push: null,
            string: null,
            "true": false,
            undefined: false,
            value: null
        };
    }
    function isNode(value) {
        return typeof value.toString != "function" && typeof (value + "") == "string";
    }
    function releaseArray(array) {
        array.length = 0;
        if (arrayPool.length < maxPoolSize) {
            arrayPool.push(array);
        }
    }
    function releaseObject(object) {
        var cache = object.cache;
        if (cache) {
            releaseObject(cache);
        }
        object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
        if (objectPool.length < maxPoolSize) {
            objectPool.push(object);
        }
    }
    function slice(array, start, end) {
        start || (start = 0);
        if (typeof end == "undefined") {
            end = array ? array.length : 0;
        }
        var index = -1, length = end - start || 0, result = Array(length < 0 ? 0 : length);
        while (++index < length) {
            result[index] = array[start + index];
        }
        return result;
    }
    function runInContext(context) {
        context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;
        var Array = context.Array, Boolean = context.Boolean, Date = context.Date, Error = context.Error, Function = context.Function, Math = context.Math, Number = context.Number, Object = context.Object, RegExp = context.RegExp, String = context.String, TypeError = context.TypeError;
        var arrayRef = [];
        var errorProto = Error.prototype, objectProto = Object.prototype, stringProto = String.prototype;
        var oldDash = context._;
        var toString = objectProto.toString;
        var reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");
        var ceil = Math.ceil, clearTimeout = context.clearTimeout, floor = Math.floor, fnToString = Function.prototype.toString, getPrototypeOf = reNative.test(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf, hasOwnProperty = objectProto.hasOwnProperty, now = reNative.test(now = Date.now) && now || function() {
            return +new Date();
        }, push = arrayRef.push, propertyIsEnumerable = objectProto.propertyIsEnumerable, setTimeout = context.setTimeout, splice = arrayRef.splice;
        var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == "function" && !reNative.test(setImmediate) && setImmediate;
        var defineProperty = function() {
            try {
                var o = {}, func = reNative.test(func = Object.defineProperty) && func, result = func(o, o, o) && func;
            } catch (e) {}
            return result;
        }();
        var nativeCreate = reNative.test(nativeCreate = Object.create) && nativeCreate, nativeIsArray = reNative.test(nativeIsArray = Array.isArray) && nativeIsArray, nativeIsFinite = context.isFinite, nativeIsNaN = context.isNaN, nativeKeys = reNative.test(nativeKeys = Object.keys) && nativeKeys, nativeMax = Math.max, nativeMin = Math.min, nativeParseInt = context.parseInt, nativeRandom = Math.random;
        var ctorByClass = {};
        ctorByClass[arrayClass] = Array;
        ctorByClass[boolClass] = Boolean;
        ctorByClass[dateClass] = Date;
        ctorByClass[funcClass] = Function;
        ctorByClass[objectClass] = Object;
        ctorByClass[numberClass] = Number;
        ctorByClass[regexpClass] = RegExp;
        ctorByClass[stringClass] = String;
        var nonEnumProps = {};
        nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = {
            constructor: true,
            toLocaleString: true,
            toString: true,
            valueOf: true
        };
        nonEnumProps[boolClass] = nonEnumProps[stringClass] = {
            constructor: true,
            toString: true,
            valueOf: true
        };
        nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = {
            constructor: true,
            toString: true
        };
        nonEnumProps[objectClass] = {
            constructor: true
        };
        (function() {
            var length = shadowedProps.length;
            while (length--) {
                var key = shadowedProps[length];
                for (var className in nonEnumProps) {
                    if (hasOwnProperty.call(nonEnumProps, className) && !hasOwnProperty.call(nonEnumProps[className], key)) {
                        nonEnumProps[className][key] = false;
                    }
                }
            }
        })();
        function lodash(value) {
            return value && typeof value == "object" && !isArray(value) && hasOwnProperty.call(value, "__wrapped__") ? value : new lodashWrapper(value);
        }
        function lodashWrapper(value, chainAll) {
            this.__chain__ = !!chainAll;
            this.__wrapped__ = value;
        }
        lodashWrapper.prototype = lodash.prototype;
        var support = lodash.support = {};
        (function() {
            var ctor = function() {
                this.x = 1;
            }, object = {
                "0": 1,
                length: 1
            }, props = [];
            ctor.prototype = {
                valueOf: 1,
                y: 1
            };
            for (var key in new ctor()) {
                props.push(key);
            }
            for (key in arguments) {}
            support.argsClass = toString.call(arguments) == argsClass;
            support.argsObject = arguments.constructor == Object && !(arguments instanceof Array);
            support.enumErrorProps = propertyIsEnumerable.call(errorProto, "message") || propertyIsEnumerable.call(errorProto, "name");
            support.enumPrototypes = propertyIsEnumerable.call(ctor, "prototype");
            support.funcDecomp = !reNative.test(context.WinRTError) && reThis.test(runInContext);
            support.funcNames = typeof Function.name == "string";
            support.nonEnumArgs = key != 0;
            support.nonEnumShadows = !/valueOf/.test(props);
            support.ownLast = props[0] != "x";
            support.spliceObjects = (arrayRef.splice.call(object, 0, 1), !object[0]);
            support.unindexedChars = "x"[0] + Object("x")[0] != "xx";
            try {
                support.nodeClass = !(toString.call(document) == objectClass && !({
                    toString: 0
                } + ""));
            } catch (e) {
                support.nodeClass = true;
            }
        })(1);
        lodash.templateSettings = {
            escape: /<%-([\s\S]+?)%>/g,
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: reInterpolate,
            variable: "",
            imports: {
                _: lodash
            }
        };
        var iteratorTemplate = function(obj) {
            var __p = "var index, iterable = " + obj.firstArg + ", result = " + obj.init + ";\nif (!iterable) return result;\n" + obj.top + ";";
            if (obj.array) {
                __p += "\nvar length = iterable.length; index = -1;\nif (" + obj.array + ") {  ";
                if (support.unindexedChars) {
                    __p += "\n  if (isString(iterable)) {\n    iterable = iterable.split('')\n  }  ";
                }
                __p += "\n  while (++index < length) {\n    " + obj.loop + ";\n  }\n}\nelse {  ";
            } else if (support.nonEnumArgs) {
                __p += "\n  var length = iterable.length; index = -1;\n  if (length && isArguments(iterable)) {\n    while (++index < length) {\n      index += '';\n      " + obj.loop + ";\n    }\n  } else {  ";
            }
            if (support.enumPrototypes) {
                __p += "\n  var skipProto = typeof iterable == 'function';\n  ";
            }
            if (support.enumErrorProps) {
                __p += "\n  var skipErrorProps = iterable === errorProto || iterable instanceof Error;\n  ";
            }
            var conditions = [];
            if (support.enumPrototypes) {
                conditions.push('!(skipProto && index == "prototype")');
            }
            if (support.enumErrorProps) {
                conditions.push('!(skipErrorProps && (index == "message" || index == "name"))');
            }
            if (obj.useHas && obj.keys) {
                __p += "\n  var ownIndex = -1,\n      ownProps = objectTypes[typeof iterable] && keys(iterable),\n      length = ownProps ? ownProps.length : 0;\n\n  while (++ownIndex < length) {\n    index = ownProps[ownIndex];\n";
                if (conditions.length) {
                    __p += "    if (" + conditions.join(" && ") + ") {\n  ";
                }
                __p += obj.loop + ";    ";
                if (conditions.length) {
                    __p += "\n    }";
                }
                __p += "\n  }  ";
            } else {
                __p += "\n  for (index in iterable) {\n";
                if (obj.useHas) {
                    conditions.push("hasOwnProperty.call(iterable, index)");
                }
                if (conditions.length) {
                    __p += "    if (" + conditions.join(" && ") + ") {\n  ";
                }
                __p += obj.loop + ";    ";
                if (conditions.length) {
                    __p += "\n    }";
                }
                __p += "\n  }    ";
                if (support.nonEnumShadows) {
                    __p += "\n\n  if (iterable !== objectProto) {\n    var ctor = iterable.constructor,\n        isProto = iterable === (ctor && ctor.prototype),\n        className = iterable === stringProto ? stringClass : iterable === errorProto ? errorClass : toString.call(iterable),\n        nonEnum = nonEnumProps[className];\n      ";
                    for (k = 0; k < 7; k++) {
                        __p += "\n    index = '" + obj.shadowedProps[k] + "';\n    if ((!(isProto && nonEnum[index]) && hasOwnProperty.call(iterable, index))";
                        if (!obj.useHas) {
                            __p += " || (!nonEnum[index] && iterable[index] !== objectProto[index])";
                        }
                        __p += ") {\n      " + obj.loop + ";\n    }      ";
                    }
                    __p += "\n  }    ";
                }
            }
            if (obj.array || support.nonEnumArgs) {
                __p += "\n}";
            }
            __p += obj.bottom + ";\nreturn result";
            return __p;
        };
        function baseBind(bindData) {
            var func = bindData[0], partialArgs = bindData[2], thisArg = bindData[4];
            function bound() {
                if (partialArgs) {
                    var args = partialArgs.slice();
                    push.apply(args, arguments);
                }
                if (this instanceof bound) {
                    var thisBinding = baseCreate(func.prototype), result = func.apply(thisBinding, args || arguments);
                    return isObject(result) ? result : thisBinding;
                }
                return func.apply(thisArg, args || arguments);
            }
            setBindData(bound, bindData);
            return bound;
        }
        function baseClone(value, isDeep, callback, stackA, stackB) {
            if (callback) {
                var result = callback(value);
                if (typeof result != "undefined") {
                    return result;
                }
            }
            var isObj = isObject(value);
            if (isObj) {
                var className = toString.call(value);
                if (!cloneableClasses[className] || !support.nodeClass && isNode(value)) {
                    return value;
                }
                var ctor = ctorByClass[className];
                switch (className) {
                  case boolClass:
                  case dateClass:
                    return new ctor(+value);

                  case numberClass:
                  case stringClass:
                    return new ctor(value);

                  case regexpClass:
                    result = ctor(value.source, reFlags.exec(value));
                    result.lastIndex = value.lastIndex;
                    return result;
                }
            } else {
                return value;
            }
            var isArr = isArray(value);
            if (isDeep) {
                var initedStack = !stackA;
                stackA || (stackA = getArray());
                stackB || (stackB = getArray());
                var length = stackA.length;
                while (length--) {
                    if (stackA[length] == value) {
                        return stackB[length];
                    }
                }
                result = isArr ? ctor(value.length) : {};
            } else {
                result = isArr ? slice(value) : assign({}, value);
            }
            if (isArr) {
                if (hasOwnProperty.call(value, "index")) {
                    result.index = value.index;
                }
                if (hasOwnProperty.call(value, "input")) {
                    result.input = value.input;
                }
            }
            if (!isDeep) {
                return result;
            }
            stackA.push(value);
            stackB.push(result);
            (isArr ? baseEach : forOwn)(value, function(objValue, key) {
                result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
            });
            if (initedStack) {
                releaseArray(stackA);
                releaseArray(stackB);
            }
            return result;
        }
        function baseCreate(prototype, properties) {
            return isObject(prototype) ? nativeCreate(prototype) : {};
        }
        if (!nativeCreate) {
            baseCreate = function() {
                function Object() {}
                return function(prototype) {
                    if (isObject(prototype)) {
                        Object.prototype = prototype;
                        var result = new Object();
                        Object.prototype = null;
                    }
                    return result || context.Object();
                };
            }();
        }
        function baseCreateCallback(func, thisArg, argCount) {
            if (typeof func != "function") {
                return identity;
            }
            if (typeof thisArg == "undefined" || !("prototype" in func)) {
                return func;
            }
            var bindData = func.__bindData__;
            if (typeof bindData == "undefined") {
                if (support.funcNames) {
                    bindData = !func.name;
                }
                bindData = bindData || !support.funcDecomp;
                if (!bindData) {
                    var source = fnToString.call(func);
                    if (!support.funcNames) {
                        bindData = !reFuncName.test(source);
                    }
                    if (!bindData) {
                        bindData = reThis.test(source);
                        setBindData(func, bindData);
                    }
                }
            }
            if (bindData === false || bindData !== true && bindData[1] & 1) {
                return func;
            }
            switch (argCount) {
              case 1:
                return function(value) {
                    return func.call(thisArg, value);
                };

              case 2:
                return function(a, b) {
                    return func.call(thisArg, a, b);
                };

              case 3:
                return function(value, index, collection) {
                    return func.call(thisArg, value, index, collection);
                };

              case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(thisArg, accumulator, value, index, collection);
                };
            }
            return bind(func, thisArg);
        }
        function baseCreateWrapper(bindData) {
            var func = bindData[0], bitmask = bindData[1], partialArgs = bindData[2], partialRightArgs = bindData[3], thisArg = bindData[4], arity = bindData[5];
            var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, key = func;
            function bound() {
                var thisBinding = isBind ? thisArg : this;
                if (partialArgs) {
                    var args = partialArgs.slice();
                    push.apply(args, arguments);
                }
                if (partialRightArgs || isCurry) {
                    args || (args = slice(arguments));
                    if (partialRightArgs) {
                        push.apply(args, partialRightArgs);
                    }
                    if (isCurry && args.length < arity) {
                        bitmask |= 16 & ~32;
                        return baseCreateWrapper([ func, isCurryBound ? bitmask : bitmask & ~3, args, null, thisArg, arity ]);
                    }
                }
                args || (args = arguments);
                if (isBindKey) {
                    func = thisBinding[key];
                }
                if (this instanceof bound) {
                    thisBinding = baseCreate(func.prototype);
                    var result = func.apply(thisBinding, args);
                    return isObject(result) ? result : thisBinding;
                }
                return func.apply(thisBinding, args);
            }
            setBindData(bound, bindData);
            return bound;
        }
        function baseDifference(array, values) {
            var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, isLarge = length >= largeArraySize && indexOf === baseIndexOf, result = [];
            if (isLarge) {
                var cache = createCache(values);
                if (cache) {
                    indexOf = cacheIndexOf;
                    values = cache;
                } else {
                    isLarge = false;
                }
            }
            while (++index < length) {
                var value = array[index];
                if (indexOf(values, value) < 0) {
                    result.push(value);
                }
            }
            if (isLarge) {
                releaseObject(values);
            }
            return result;
        }
        function baseFlatten(array, isShallow, isStrict, fromIndex) {
            var index = (fromIndex || 0) - 1, length = array ? array.length : 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value && typeof value == "object" && typeof value.length == "number" && (isArray(value) || isArguments(value))) {
                    if (!isShallow) {
                        value = baseFlatten(value, isShallow, isStrict);
                    }
                    var valIndex = -1, valLength = value.length, resIndex = result.length;
                    result.length += valLength;
                    while (++valIndex < valLength) {
                        result[resIndex++] = value[valIndex];
                    }
                } else if (!isStrict) {
                    result.push(value);
                }
            }
            return result;
        }
        function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
            if (callback) {
                var result = callback(a, b);
                if (typeof result != "undefined") {
                    return !!result;
                }
            }
            if (a === b) {
                return a !== 0 || 1 / a == 1 / b;
            }
            var type = typeof a, otherType = typeof b;
            if (a === a && !(a && objectTypes[type]) && !(b && objectTypes[otherType])) {
                return false;
            }
            if (a == null || b == null) {
                return a === b;
            }
            var className = toString.call(a), otherClass = toString.call(b);
            if (className == argsClass) {
                className = objectClass;
            }
            if (otherClass == argsClass) {
                otherClass = objectClass;
            }
            if (className != otherClass) {
                return false;
            }
            switch (className) {
              case boolClass:
              case dateClass:
                return +a == +b;

              case numberClass:
                return a != +a ? b != +b : a == 0 ? 1 / a == 1 / b : a == +b;

              case regexpClass:
              case stringClass:
                return a == String(b);
            }
            var isArr = className == arrayClass;
            if (!isArr) {
                var aWrapped = hasOwnProperty.call(a, "__wrapped__"), bWrapped = hasOwnProperty.call(b, "__wrapped__");
                if (aWrapped || bWrapped) {
                    return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
                }
                if (className != objectClass || !support.nodeClass && (isNode(a) || isNode(b))) {
                    return false;
                }
                var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor, ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;
                if (ctorA != ctorB && !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) && ("constructor" in a && "constructor" in b)) {
                    return false;
                }
            }
            var initedStack = !stackA;
            stackA || (stackA = getArray());
            stackB || (stackB = getArray());
            var length = stackA.length;
            while (length--) {
                if (stackA[length] == a) {
                    return stackB[length] == b;
                }
            }
            var size = 0;
            result = true;
            stackA.push(a);
            stackB.push(b);
            if (isArr) {
                length = a.length;
                size = b.length;
                result = size == a.length;
                if (!result && !isWhere) {
                    return result;
                }
                while (size--) {
                    var index = length, value = b[size];
                    if (isWhere) {
                        while (index--) {
                            if (result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB)) {
                                break;
                            }
                        }
                    } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
                        break;
                    }
                }
                return result;
            }
            forIn(b, function(value, key, b) {
                if (hasOwnProperty.call(b, key)) {
                    size++;
                    return result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB);
                }
            });
            if (result && !isWhere) {
                forIn(a, function(value, key, a) {
                    if (hasOwnProperty.call(a, key)) {
                        return result = --size > -1;
                    }
                });
            }
            if (initedStack) {
                releaseArray(stackA);
                releaseArray(stackB);
            }
            return result;
        }
        function baseMerge(object, source, callback, stackA, stackB) {
            (isArray(source) ? forEach : forOwn)(source, function(source, key) {
                var found, isArr, result = source, value = object[key];
                if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
                    var stackLength = stackA.length;
                    while (stackLength--) {
                        if (found = stackA[stackLength] == source) {
                            value = stackB[stackLength];
                            break;
                        }
                    }
                    if (!found) {
                        var isShallow;
                        if (callback) {
                            result = callback(value, source);
                            if (isShallow = typeof result != "undefined") {
                                value = result;
                            }
                        }
                        if (!isShallow) {
                            value = isArr ? isArray(value) ? value : [] : isPlainObject(value) ? value : {};
                        }
                        stackA.push(source);
                        stackB.push(value);
                        if (!isShallow) {
                            baseMerge(value, source, callback, stackA, stackB);
                        }
                    }
                } else {
                    if (callback) {
                        result = callback(value, source);
                        if (typeof result == "undefined") {
                            result = source;
                        }
                    }
                    if (typeof result != "undefined") {
                        value = result;
                    }
                }
                object[key] = value;
            });
        }
        function baseRandom(min, max) {
            return min + floor(nativeRandom() * (max - min + 1));
        }
        function baseUniq(array, isSorted, callback) {
            var index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [];
            var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf, seen = callback || isLarge ? getArray() : result;
            if (isLarge) {
                var cache = createCache(seen);
                if (cache) {
                    indexOf = cacheIndexOf;
                    seen = cache;
                } else {
                    isLarge = false;
                    seen = callback ? seen : (releaseArray(seen), result);
                }
            }
            while (++index < length) {
                var value = array[index], computed = callback ? callback(value, index, array) : value;
                if (isSorted ? !index || seen[seen.length - 1] !== computed : indexOf(seen, computed) < 0) {
                    if (callback || isLarge) {
                        seen.push(computed);
                    }
                    result.push(value);
                }
            }
            if (isLarge) {
                releaseArray(seen.array);
                releaseObject(seen);
            } else if (callback) {
                releaseArray(seen);
            }
            return result;
        }
        function createAggregator(setter) {
            return function(collection, callback, thisArg) {
                var result = {};
                callback = lodash.createCallback(callback, thisArg, 3);
                if (isArray(collection)) {
                    var index = -1, length = collection.length;
                    while (++index < length) {
                        var value = collection[index];
                        setter(result, value, callback(value, index, collection), collection);
                    }
                } else {
                    baseEach(collection, function(value, key, collection) {
                        setter(result, value, callback(value, key, collection), collection);
                    });
                }
                return result;
            };
        }
        function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
            var isBind = bitmask & 1, isBindKey = bitmask & 2, isCurry = bitmask & 4, isCurryBound = bitmask & 8, isPartial = bitmask & 16, isPartialRight = bitmask & 32;
            if (!isBindKey && !isFunction(func)) {
                throw new TypeError();
            }
            if (isPartial && !partialArgs.length) {
                bitmask &= ~16;
                isPartial = partialArgs = false;
            }
            if (isPartialRight && !partialRightArgs.length) {
                bitmask &= ~32;
                isPartialRight = partialRightArgs = false;
            }
            var bindData = func && func.__bindData__;
            if (bindData && bindData !== true) {
                bindData = bindData.slice();
                if (isBind && !(bindData[1] & 1)) {
                    bindData[4] = thisArg;
                }
                if (!isBind && bindData[1] & 1) {
                    bitmask |= 8;
                }
                if (isCurry && !(bindData[1] & 4)) {
                    bindData[5] = arity;
                }
                if (isPartial) {
                    push.apply(bindData[2] || (bindData[2] = []), partialArgs);
                }
                if (isPartialRight) {
                    push.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
                }
                bindData[1] |= bitmask;
                return createWrapper.apply(null, bindData);
            }
            var creater = bitmask == 1 || bitmask === 17 ? baseBind : baseCreateWrapper;
            return creater([ func, bitmask, partialArgs, partialRightArgs, thisArg, arity ]);
        }
        function createIterator() {
            iteratorData.shadowedProps = shadowedProps;
            iteratorData.array = iteratorData.bottom = iteratorData.loop = iteratorData.top = "";
            iteratorData.init = "iterable";
            iteratorData.useHas = true;
            for (var object, index = 0; object = arguments[index]; index++) {
                for (var key in object) {
                    iteratorData[key] = object[key];
                }
            }
            var args = iteratorData.args;
            iteratorData.firstArg = /^[^,]+/.exec(args)[0];
            var factory = Function("baseCreateCallback, errorClass, errorProto, hasOwnProperty, " + "indicatorObject, isArguments, isArray, isString, keys, objectProto, " + "objectTypes, nonEnumProps, stringClass, stringProto, toString", "return function(" + args + ") {\n" + iteratorTemplate(iteratorData) + "\n}");
            return factory(baseCreateCallback, errorClass, errorProto, hasOwnProperty, indicatorObject, isArguments, isArray, isString, iteratorData.keys, objectProto, objectTypes, nonEnumProps, stringClass, stringProto, toString);
        }
        function escapeHtmlChar(match) {
            return htmlEscapes[match];
        }
        function getIndexOf() {
            var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
            return result;
        }
        var setBindData = !defineProperty ? noop : function(func, value) {
            descriptor.value = value;
            defineProperty(func, "__bindData__", descriptor);
        };
        function shimIsPlainObject(value) {
            var ctor, result;
            if (!(value && toString.call(value) == objectClass) || (ctor = value.constructor, 
            isFunction(ctor) && !(ctor instanceof ctor)) || !support.argsClass && isArguments(value) || !support.nodeClass && isNode(value)) {
                return false;
            }
            if (support.ownLast) {
                forIn(value, function(value, key, object) {
                    result = hasOwnProperty.call(object, key);
                    return false;
                });
                return result !== false;
            }
            forIn(value, function(value, key) {
                result = key;
            });
            return typeof result == "undefined" || hasOwnProperty.call(value, result);
        }
        function unescapeHtmlChar(match) {
            return htmlUnescapes[match];
        }
        function isArguments(value) {
            return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == argsClass || false;
        }
        if (!support.argsClass) {
            isArguments = function(value) {
                return value && typeof value == "object" && typeof value.length == "number" && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee") || false;
            };
        }
        var isArray = nativeIsArray || function(value) {
            return value && typeof value == "object" && typeof value.length == "number" && toString.call(value) == arrayClass || false;
        };
        var shimKeys = createIterator({
            args: "object",
            init: "[]",
            top: "if (!(objectTypes[typeof object])) return result",
            loop: "result.push(index)"
        });
        var keys = !nativeKeys ? shimKeys : function(object) {
            if (!isObject(object)) {
                return [];
            }
            if (support.enumPrototypes && typeof object == "function" || support.nonEnumArgs && object.length && isArguments(object)) {
                return shimKeys(object);
            }
            return nativeKeys(object);
        };
        var eachIteratorOptions = {
            args: "collection, callback, thisArg",
            top: "callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3)",
            array: "typeof length == 'number'",
            keys: keys,
            loop: "if (callback(iterable[index], index, collection) === false) return result"
        };
        var defaultsIteratorOptions = {
            args: "object, source, guard",
            top: "var args = arguments,\n" + "    argsIndex = 0,\n" + "    argsLength = typeof guard == 'number' ? 2 : args.length;\n" + "while (++argsIndex < argsLength) {\n" + "  iterable = args[argsIndex];\n" + "  if (iterable && objectTypes[typeof iterable]) {",
            keys: keys,
            loop: "if (typeof result[index] == 'undefined') result[index] = iterable[index]",
            bottom: "  }\n}"
        };
        var forOwnIteratorOptions = {
            top: "if (!objectTypes[typeof iterable]) return result;\n" + eachIteratorOptions.top,
            array: false
        };
        var htmlEscapes = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        var htmlUnescapes = invert(htmlEscapes);
        var reEscapedHtml = RegExp("(" + keys(htmlUnescapes).join("|") + ")", "g"), reUnescapedHtml = RegExp("[" + keys(htmlEscapes).join("") + "]", "g");
        var baseEach = createIterator(eachIteratorOptions);
        var assign = createIterator(defaultsIteratorOptions, {
            top: defaultsIteratorOptions.top.replace(";", ";\n" + "if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {\n" + "  var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);\n" + "} else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {\n" + "  callback = args[--argsLength];\n" + "}"),
            loop: "result[index] = callback ? callback(result[index], iterable[index]) : iterable[index]"
        });
        function clone(value, isDeep, callback, thisArg) {
            if (typeof isDeep != "boolean" && isDeep != null) {
                thisArg = callback;
                callback = isDeep;
                isDeep = false;
            }
            return baseClone(value, isDeep, typeof callback == "function" && baseCreateCallback(callback, thisArg, 1));
        }
        function cloneDeep(value, callback, thisArg) {
            return baseClone(value, true, typeof callback == "function" && baseCreateCallback(callback, thisArg, 1));
        }
        function create(prototype, properties) {
            var result = baseCreate(prototype);
            return properties ? assign(result, properties) : result;
        }
        var defaults = createIterator(defaultsIteratorOptions);
        function findKey(object, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forOwn(object, function(value, key, object) {
                if (callback(value, key, object)) {
                    result = key;
                    return false;
                }
            });
            return result;
        }
        function findLastKey(object, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forOwnRight(object, function(value, key, object) {
                if (callback(value, key, object)) {
                    result = key;
                    return false;
                }
            });
            return result;
        }
        var forIn = createIterator(eachIteratorOptions, forOwnIteratorOptions, {
            useHas: false
        });
        function forInRight(object, callback, thisArg) {
            var pairs = [];
            forIn(object, function(value, key) {
                pairs.push(key, value);
            });
            var length = pairs.length;
            callback = baseCreateCallback(callback, thisArg, 3);
            while (length--) {
                if (callback(pairs[length--], pairs[length], object) === false) {
                    break;
                }
            }
            return object;
        }
        var forOwn = createIterator(eachIteratorOptions, forOwnIteratorOptions);
        function forOwnRight(object, callback, thisArg) {
            var props = keys(object), length = props.length;
            callback = baseCreateCallback(callback, thisArg, 3);
            while (length--) {
                var key = props[length];
                if (callback(object[key], key, object) === false) {
                    break;
                }
            }
            return object;
        }
        function functions(object) {
            var result = [];
            forIn(object, function(value, key) {
                if (isFunction(value)) {
                    result.push(key);
                }
            });
            return result.sort();
        }
        function has(object, property) {
            return object ? hasOwnProperty.call(object, property) : false;
        }
        function invert(object) {
            var index = -1, props = keys(object), length = props.length, result = {};
            while (++index < length) {
                var key = props[index];
                result[object[key]] = key;
            }
            return result;
        }
        function isBoolean(value) {
            return value === true || value === false || value && typeof value == "object" && toString.call(value) == boolClass || false;
        }
        function isDate(value) {
            return value && typeof value == "object" && toString.call(value) == dateClass || false;
        }
        function isElement(value) {
            return value && value.nodeType === 1 || false;
        }
        function isEmpty(value) {
            var result = true;
            if (!value) {
                return result;
            }
            var className = toString.call(value), length = value.length;
            if (className == arrayClass || className == stringClass || (support.argsClass ? className == argsClass : isArguments(value)) || className == objectClass && typeof length == "number" && isFunction(value.splice)) {
                return !length;
            }
            forOwn(value, function() {
                return result = false;
            });
            return result;
        }
        function isEqual(a, b, callback, thisArg) {
            return baseIsEqual(a, b, typeof callback == "function" && baseCreateCallback(callback, thisArg, 2));
        }
        function isFinite(value) {
            return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
        }
        function isFunction(value) {
            return typeof value == "function";
        }
        if (isFunction(/x/)) {
            isFunction = function(value) {
                return typeof value == "function" && toString.call(value) == funcClass;
            };
        }
        function isObject(value) {
            return !!(value && objectTypes[typeof value]);
        }
        function isNaN(value) {
            return isNumber(value) && value != +value;
        }
        function isNull(value) {
            return value === null;
        }
        function isNumber(value) {
            return typeof value == "number" || value && typeof value == "object" && toString.call(value) == numberClass || false;
        }
        var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
            if (!(value && toString.call(value) == objectClass) || !support.argsClass && isArguments(value)) {
                return false;
            }
            var valueOf = value.valueOf, objProto = typeof valueOf == "function" && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);
            return objProto ? value == objProto || getPrototypeOf(value) == objProto : shimIsPlainObject(value);
        };
        function isRegExp(value) {
            return value && objectTypes[typeof value] && toString.call(value) == regexpClass || false;
        }
        function isString(value) {
            return typeof value == "string" || value && typeof value == "object" && toString.call(value) == stringClass || false;
        }
        function isUndefined(value) {
            return typeof value == "undefined";
        }
        function merge(object) {
            var args = arguments, length = 2;
            if (!isObject(object)) {
                return object;
            }
            if (typeof args[2] != "number") {
                length = args.length;
            }
            if (length > 3 && typeof args[length - 2] == "function") {
                var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
            } else if (length > 2 && typeof args[length - 1] == "function") {
                callback = args[--length];
            }
            var sources = slice(arguments, 1, length), index = -1, stackA = getArray(), stackB = getArray();
            while (++index < length) {
                baseMerge(object, sources[index], callback, stackA, stackB);
            }
            releaseArray(stackA);
            releaseArray(stackB);
            return object;
        }
        function omit(object, callback, thisArg) {
            var result = {};
            if (typeof callback != "function") {
                var props = [];
                forIn(object, function(value, key) {
                    props.push(key);
                });
                props = baseDifference(props, baseFlatten(arguments, true, false, 1));
                var index = -1, length = props.length;
                while (++index < length) {
                    var key = props[index];
                    result[key] = object[key];
                }
            } else {
                callback = lodash.createCallback(callback, thisArg, 3);
                forIn(object, function(value, key, object) {
                    if (!callback(value, key, object)) {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        function pairs(object) {
            var index = -1, props = keys(object), length = props.length, result = Array(length);
            while (++index < length) {
                var key = props[index];
                result[index] = [ key, object[key] ];
            }
            return result;
        }
        function pick(object, callback, thisArg) {
            var result = {};
            if (typeof callback != "function") {
                var index = -1, props = baseFlatten(arguments, true, false, 1), length = isObject(object) ? props.length : 0;
                while (++index < length) {
                    var key = props[index];
                    if (key in object) {
                        result[key] = object[key];
                    }
                }
            } else {
                callback = lodash.createCallback(callback, thisArg, 3);
                forIn(object, function(value, key, object) {
                    if (callback(value, key, object)) {
                        result[key] = value;
                    }
                });
            }
            return result;
        }
        function transform(object, callback, accumulator, thisArg) {
            var isArr = isArray(object);
            if (accumulator == null) {
                if (isArr) {
                    accumulator = [];
                } else {
                    var ctor = object && object.constructor, proto = ctor && ctor.prototype;
                    accumulator = baseCreate(proto);
                }
            }
            if (callback) {
                callback = lodash.createCallback(callback, thisArg, 4);
                (isArr ? baseEach : forOwn)(object, function(value, index, object) {
                    return callback(accumulator, value, index, object);
                });
            }
            return accumulator;
        }
        function values(object) {
            var index = -1, props = keys(object), length = props.length, result = Array(length);
            while (++index < length) {
                result[index] = object[props[index]];
            }
            return result;
        }
        function at(collection) {
            var args = arguments, index = -1, props = baseFlatten(args, true, false, 1), length = args[2] && args[2][args[1]] === collection ? 1 : props.length, result = Array(length);
            if (support.unindexedChars && isString(collection)) {
                collection = collection.split("");
            }
            while (++index < length) {
                result[index] = collection[props[index]];
            }
            return result;
        }
        function contains(collection, target, fromIndex) {
            var index = -1, indexOf = getIndexOf(), length = collection ? collection.length : 0, result = false;
            fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
            if (isArray(collection)) {
                result = indexOf(collection, target, fromIndex) > -1;
            } else if (typeof length == "number") {
                result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
            } else {
                baseEach(collection, function(value) {
                    if (++index >= fromIndex) {
                        return !(result = value === target);
                    }
                });
            }
            return result;
        }
        var countBy = createAggregator(function(result, value, key) {
            hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1;
        });
        function every(collection, callback, thisArg) {
            var result = true;
            callback = lodash.createCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    if (!(result = !!callback(collection[index], index, collection))) {
                        break;
                    }
                }
            } else {
                baseEach(collection, function(value, index, collection) {
                    return result = !!callback(value, index, collection);
                });
            }
            return result;
        }
        function filter(collection, callback, thisArg) {
            var result = [];
            callback = lodash.createCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (callback(value, index, collection)) {
                        result.push(value);
                    }
                }
            } else {
                baseEach(collection, function(value, index, collection) {
                    if (callback(value, index, collection)) {
                        result.push(value);
                    }
                });
            }
            return result;
        }
        function find(collection, callback, thisArg) {
            callback = lodash.createCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (callback(value, index, collection)) {
                        return value;
                    }
                }
            } else {
                var result;
                baseEach(collection, function(value, index, collection) {
                    if (callback(value, index, collection)) {
                        result = value;
                        return false;
                    }
                });
                return result;
            }
        }
        function findLast(collection, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            forEachRight(collection, function(value, index, collection) {
                if (callback(value, index, collection)) {
                    result = value;
                    return false;
                }
            });
            return result;
        }
        function forEach(collection, callback, thisArg) {
            if (callback && typeof thisArg == "undefined" && isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    if (callback(collection[index], index, collection) === false) {
                        break;
                    }
                }
            } else {
                baseEach(collection, callback, thisArg);
            }
            return collection;
        }
        function forEachRight(collection, callback, thisArg) {
            var iterable = collection, length = collection ? collection.length : 0;
            callback = callback && typeof thisArg == "undefined" ? callback : baseCreateCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                while (length--) {
                    if (callback(collection[length], length, collection) === false) {
                        break;
                    }
                }
            } else {
                if (typeof length != "number") {
                    var props = keys(collection);
                    length = props.length;
                } else if (support.unindexedChars && isString(collection)) {
                    iterable = collection.split("");
                }
                baseEach(collection, function(value, key, collection) {
                    key = props ? props[--length] : --length;
                    return callback(iterable[key], key, collection);
                });
            }
            return collection;
        }
        var groupBy = createAggregator(function(result, value, key) {
            (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
        });
        var indexBy = createAggregator(function(result, value, key) {
            result[key] = value;
        });
        function invoke(collection, methodName) {
            var args = slice(arguments, 2), index = -1, isFunc = typeof methodName == "function", length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            forEach(collection, function(value) {
                result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
            });
            return result;
        }
        function map(collection, callback, thisArg) {
            var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            callback = lodash.createCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                while (++index < length) {
                    result[index] = callback(collection[index], index, collection);
                }
            } else {
                baseEach(collection, function(value, key, collection) {
                    result[++index] = callback(value, key, collection);
                });
            }
            return result;
        }
        function max(collection, callback, thisArg) {
            var computed = -Infinity, result = computed;
            if (typeof callback != "function" && thisArg && thisArg[callback] === collection) {
                callback = null;
            }
            if (callback == null && isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (value > result) {
                        result = value;
                    }
                }
            } else {
                callback = callback == null && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3);
                baseEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    if (current > computed) {
                        computed = current;
                        result = value;
                    }
                });
            }
            return result;
        }
        function min(collection, callback, thisArg) {
            var computed = Infinity, result = computed;
            if (typeof callback != "function" && thisArg && thisArg[callback] === collection) {
                callback = null;
            }
            if (callback == null && isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    var value = collection[index];
                    if (value < result) {
                        result = value;
                    }
                }
            } else {
                callback = callback == null && isString(collection) ? charAtCallback : lodash.createCallback(callback, thisArg, 3);
                baseEach(collection, function(value, index, collection) {
                    var current = callback(value, index, collection);
                    if (current < computed) {
                        computed = current;
                        result = value;
                    }
                });
            }
            return result;
        }
        var pluck = map;
        function reduce(collection, callback, accumulator, thisArg) {
            var noaccum = arguments.length < 3;
            callback = lodash.createCallback(callback, thisArg, 4);
            if (isArray(collection)) {
                var index = -1, length = collection.length;
                if (noaccum) {
                    accumulator = collection[++index];
                }
                while (++index < length) {
                    accumulator = callback(accumulator, collection[index], index, collection);
                }
            } else {
                baseEach(collection, function(value, index, collection) {
                    accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, collection);
                });
            }
            return accumulator;
        }
        function reduceRight(collection, callback, accumulator, thisArg) {
            var noaccum = arguments.length < 3;
            callback = lodash.createCallback(callback, thisArg, 4);
            forEachRight(collection, function(value, index, collection) {
                accumulator = noaccum ? (noaccum = false, value) : callback(accumulator, value, index, collection);
            });
            return accumulator;
        }
        function reject(collection, callback, thisArg) {
            callback = lodash.createCallback(callback, thisArg, 3);
            return filter(collection, function(value, index, collection) {
                return !callback(value, index, collection);
            });
        }
        function sample(collection, n, guard) {
            if (collection && typeof collection.length != "number") {
                collection = values(collection);
            } else if (support.unindexedChars && isString(collection)) {
                collection = collection.split("");
            }
            if (n == null || guard) {
                return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
            }
            var result = shuffle(collection);
            result.length = nativeMin(nativeMax(0, n), result.length);
            return result;
        }
        function shuffle(collection) {
            var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            forEach(collection, function(value) {
                var rand = baseRandom(0, ++index);
                result[index] = result[rand];
                result[rand] = value;
            });
            return result;
        }
        function size(collection) {
            var length = collection ? collection.length : 0;
            return typeof length == "number" ? length : keys(collection).length;
        }
        function some(collection, callback, thisArg) {
            var result;
            callback = lodash.createCallback(callback, thisArg, 3);
            if (isArray(collection)) {
                var index = -1, length = collection.length;
                while (++index < length) {
                    if (result = callback(collection[index], index, collection)) {
                        break;
                    }
                }
            } else {
                baseEach(collection, function(value, index, collection) {
                    return !(result = callback(value, index, collection));
                });
            }
            return !!result;
        }
        function sortBy(collection, callback, thisArg) {
            var index = -1, length = collection ? collection.length : 0, result = Array(typeof length == "number" ? length : 0);
            callback = lodash.createCallback(callback, thisArg, 3);
            forEach(collection, function(value, key, collection) {
                var object = result[++index] = getObject();
                object.criteria = callback(value, key, collection);
                object.index = index;
                object.value = value;
            });
            length = result.length;
            result.sort(compareAscending);
            while (length--) {
                var object = result[length];
                result[length] = object.value;
                releaseObject(object);
            }
            return result;
        }
        function toArray(collection) {
            if (collection && typeof collection.length == "number") {
                return support.unindexedChars && isString(collection) ? collection.split("") : slice(collection);
            }
            return values(collection);
        }
        var where = filter;
        function compact(array) {
            var index = -1, length = array ? array.length : 0, result = [];
            while (++index < length) {
                var value = array[index];
                if (value) {
                    result.push(value);
                }
            }
            return result;
        }
        function difference(array) {
            return baseDifference(array, baseFlatten(arguments, true, true, 1));
        }
        function findIndex(array, callback, thisArg) {
            var index = -1, length = array ? array.length : 0;
            callback = lodash.createCallback(callback, thisArg, 3);
            while (++index < length) {
                if (callback(array[index], index, array)) {
                    return index;
                }
            }
            return -1;
        }
        function findLastIndex(array, callback, thisArg) {
            var length = array ? array.length : 0;
            callback = lodash.createCallback(callback, thisArg, 3);
            while (length--) {
                if (callback(array[length], length, array)) {
                    return length;
                }
            }
            return -1;
        }
        function first(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = -1;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (++index < length && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback;
                if (n == null || thisArg) {
                    return array ? array[0] : undefined;
                }
            }
            return slice(array, 0, nativeMin(nativeMax(0, n), length));
        }
        function flatten(array, isShallow, callback, thisArg) {
            if (typeof isShallow != "boolean" && isShallow != null) {
                thisArg = callback;
                callback = typeof isShallow != "function" && thisArg && thisArg[isShallow] === array ? null : isShallow;
                isShallow = false;
            }
            if (callback != null) {
                array = map(array, callback, thisArg);
            }
            return baseFlatten(array, isShallow);
        }
        function indexOf(array, value, fromIndex) {
            if (typeof fromIndex == "number") {
                var length = array ? array.length : 0;
                fromIndex = fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0;
            } else if (fromIndex) {
                var index = sortedIndex(array, value);
                return array[index] === value ? index : -1;
            }
            return baseIndexOf(array, value, fromIndex);
        }
        function initial(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = length;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (index-- && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback == null || thisArg ? 1 : callback || n;
            }
            return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
        }
        function intersection(array) {
            var args = arguments, argsLength = args.length, argsIndex = -1, caches = getArray(), index = -1, indexOf = getIndexOf(), length = array ? array.length : 0, result = [], seen = getArray();
            while (++argsIndex < argsLength) {
                var value = args[argsIndex];
                caches[argsIndex] = indexOf === baseIndexOf && (value ? value.length : 0) >= largeArraySize && createCache(argsIndex ? args[argsIndex] : seen);
            }
            outer: while (++index < length) {
                var cache = caches[0];
                value = array[index];
                if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
                    argsIndex = argsLength;
                    (cache || seen).push(value);
                    while (--argsIndex) {
                        cache = caches[argsIndex];
                        if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
                            continue outer;
                        }
                    }
                    result.push(value);
                }
            }
            while (argsLength--) {
                cache = caches[argsLength];
                if (cache) {
                    releaseObject(cache);
                }
            }
            releaseArray(caches);
            releaseArray(seen);
            return result;
        }
        function last(array, callback, thisArg) {
            var n = 0, length = array ? array.length : 0;
            if (typeof callback != "number" && callback != null) {
                var index = length;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (index-- && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback;
                if (n == null || thisArg) {
                    return array ? array[length - 1] : undefined;
                }
            }
            return slice(array, nativeMax(0, length - n));
        }
        function lastIndexOf(array, value, fromIndex) {
            var index = array ? array.length : 0;
            if (typeof fromIndex == "number") {
                index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
            }
            while (index--) {
                if (array[index] === value) {
                    return index;
                }
            }
            return -1;
        }
        function pull(array) {
            var args = arguments, argsIndex = 0, argsLength = args.length, length = array ? array.length : 0;
            while (++argsIndex < argsLength) {
                var index = -1, value = args[argsIndex];
                while (++index < length) {
                    if (array[index] === value) {
                        splice.call(array, index--, 1);
                        length--;
                    }
                }
            }
            return array;
        }
        function range(start, end, step) {
            start = +start || 0;
            step = typeof step == "number" ? step : +step || 1;
            if (end == null) {
                end = start;
                start = 0;
            }
            var index = -1, length = nativeMax(0, ceil((end - start) / (step || 1))), result = Array(length);
            while (++index < length) {
                result[index] = start;
                start += step;
            }
            return result;
        }
        function remove(array, callback, thisArg) {
            var index = -1, length = array ? array.length : 0, result = [];
            callback = lodash.createCallback(callback, thisArg, 3);
            while (++index < length) {
                var value = array[index];
                if (callback(value, index, array)) {
                    result.push(value);
                    splice.call(array, index--, 1);
                    length--;
                }
            }
            return result;
        }
        function rest(array, callback, thisArg) {
            if (typeof callback != "number" && callback != null) {
                var n = 0, index = -1, length = array ? array.length : 0;
                callback = lodash.createCallback(callback, thisArg, 3);
                while (++index < length && callback(array[index], index, array)) {
                    n++;
                }
            } else {
                n = callback == null || thisArg ? 1 : nativeMax(0, callback);
            }
            return slice(array, n);
        }
        function sortedIndex(array, value, callback, thisArg) {
            var low = 0, high = array ? array.length : low;
            callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
            value = callback(value);
            while (low < high) {
                var mid = low + high >>> 1;
                callback(array[mid]) < value ? low = mid + 1 : high = mid;
            }
            return low;
        }
        function union(array) {
            return baseUniq(baseFlatten(arguments, true, true));
        }
        function uniq(array, isSorted, callback, thisArg) {
            if (typeof isSorted != "boolean" && isSorted != null) {
                thisArg = callback;
                callback = typeof isSorted != "function" && thisArg && thisArg[isSorted] === array ? null : isSorted;
                isSorted = false;
            }
            if (callback != null) {
                callback = lodash.createCallback(callback, thisArg, 3);
            }
            return baseUniq(array, isSorted, callback);
        }
        function without(array) {
            return baseDifference(array, slice(arguments, 1));
        }
        function zip() {
            var array = arguments.length > 1 ? arguments : arguments[0], index = -1, length = array ? max(pluck(array, "length")) : 0, result = Array(length < 0 ? 0 : length);
            while (++index < length) {
                result[index] = pluck(array, index);
            }
            return result;
        }
        function zipObject(keys, values) {
            var index = -1, length = keys ? keys.length : 0, result = {};
            while (++index < length) {
                var key = keys[index];
                if (values) {
                    result[key] = values[index];
                } else if (key) {
                    result[key[0]] = key[1];
                }
            }
            return result;
        }
        function after(n, func) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            return function() {
                if (--n < 1) {
                    return func.apply(this, arguments);
                }
            };
        }
        function bind(func, thisArg) {
            return arguments.length > 2 ? createWrapper(func, 17, slice(arguments, 2), null, thisArg) : createWrapper(func, 1, null, null, thisArg);
        }
        function bindAll(object) {
            var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object), index = -1, length = funcs.length;
            while (++index < length) {
                var key = funcs[index];
                object[key] = createWrapper(object[key], 1, null, null, object);
            }
            return object;
        }
        function bindKey(object, key) {
            return arguments.length > 2 ? createWrapper(key, 19, slice(arguments, 2), null, object) : createWrapper(key, 3, null, null, object);
        }
        function compose() {
            var funcs = arguments, length = funcs.length;
            while (length--) {
                if (!isFunction(funcs[length])) {
                    throw new TypeError();
                }
            }
            return function() {
                var args = arguments, length = funcs.length;
                while (length--) {
                    args = [ funcs[length].apply(this, args) ];
                }
                return args[0];
            };
        }
        function createCallback(func, thisArg, argCount) {
            var type = typeof func;
            if (func == null || type == "function") {
                return baseCreateCallback(func, thisArg, argCount);
            }
            if (type != "object") {
                return function(object) {
                    return object[func];
                };
            }
            var props = keys(func), key = props[0], a = func[key];
            if (props.length == 1 && a === a && !isObject(a)) {
                return function(object) {
                    var b = object[key];
                    return a === b && (a !== 0 || 1 / a == 1 / b);
                };
            }
            return function(object) {
                var length = props.length, result = false;
                while (length--) {
                    if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
                        break;
                    }
                }
                return result;
            };
        }
        function curry(func, arity) {
            arity = typeof arity == "number" ? arity : +arity || func.length;
            return createWrapper(func, 4, null, null, null, arity);
        }
        function debounce(func, wait, options) {
            var args, maxTimeoutId, result, stamp, thisArg, timeoutId, trailingCall, lastCalled = 0, maxWait = false, trailing = true;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            wait = nativeMax(0, wait) || 0;
            if (options === true) {
                var leading = true;
                trailing = false;
            } else if (isObject(options)) {
                leading = options.leading;
                maxWait = "maxWait" in options && (nativeMax(wait, options.maxWait) || 0);
                trailing = "trailing" in options ? options.trailing : trailing;
            }
            var delayed = function() {
                var remaining = wait - (now() - stamp);
                if (remaining <= 0) {
                    if (maxTimeoutId) {
                        clearTimeout(maxTimeoutId);
                    }
                    var isCalled = trailingCall;
                    maxTimeoutId = timeoutId = trailingCall = undefined;
                    if (isCalled) {
                        lastCalled = now();
                        result = func.apply(thisArg, args);
                        if (!timeoutId && !maxTimeoutId) {
                            args = thisArg = null;
                        }
                    }
                } else {
                    timeoutId = setTimeout(delayed, remaining);
                }
            };
            var maxDelayed = function() {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                maxTimeoutId = timeoutId = trailingCall = undefined;
                if (trailing || maxWait !== wait) {
                    lastCalled = now();
                    result = func.apply(thisArg, args);
                    if (!timeoutId && !maxTimeoutId) {
                        args = thisArg = null;
                    }
                }
            };
            return function() {
                args = arguments;
                stamp = now();
                thisArg = this;
                trailingCall = trailing && (timeoutId || !leading);
                if (maxWait === false) {
                    var leadingCall = leading && !timeoutId;
                } else {
                    if (!maxTimeoutId && !leading) {
                        lastCalled = stamp;
                    }
                    var remaining = maxWait - (stamp - lastCalled), isCalled = remaining <= 0;
                    if (isCalled) {
                        if (maxTimeoutId) {
                            maxTimeoutId = clearTimeout(maxTimeoutId);
                        }
                        lastCalled = stamp;
                        result = func.apply(thisArg, args);
                    } else if (!maxTimeoutId) {
                        maxTimeoutId = setTimeout(maxDelayed, remaining);
                    }
                }
                if (isCalled && timeoutId) {
                    timeoutId = clearTimeout(timeoutId);
                } else if (!timeoutId && wait !== maxWait) {
                    timeoutId = setTimeout(delayed, wait);
                }
                if (leadingCall) {
                    isCalled = true;
                    result = func.apply(thisArg, args);
                }
                if (isCalled && !timeoutId && !maxTimeoutId) {
                    args = thisArg = null;
                }
                return result;
            };
        }
        function defer(func) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var args = slice(arguments, 1);
            return setTimeout(function() {
                func.apply(undefined, args);
            }, 1);
        }
        if (setImmediate) {
            defer = function(func) {
                if (!isFunction(func)) {
                    throw new TypeError();
                }
                return setImmediate.apply(context, arguments);
            };
        }
        function delay(func, wait) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var args = slice(arguments, 2);
            return setTimeout(function() {
                func.apply(undefined, args);
            }, wait);
        }
        function memoize(func, resolver) {
            if (!isFunction(func)) {
                throw new TypeError();
            }
            var memoized = function() {
                var cache = memoized.cache, key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];
                return hasOwnProperty.call(cache, key) ? cache[key] : cache[key] = func.apply(this, arguments);
            };
            memoized.cache = {};
            return memoized;
        }
        function once(func) {
            var ran, result;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            return function() {
                if (ran) {
                    return result;
                }
                ran = true;
                result = func.apply(this, arguments);
                func = null;
                return result;
            };
        }
        function partial(func) {
            return createWrapper(func, 16, slice(arguments, 1));
        }
        function partialRight(func) {
            return createWrapper(func, 32, null, slice(arguments, 1));
        }
        function throttle(func, wait, options) {
            var leading = true, trailing = true;
            if (!isFunction(func)) {
                throw new TypeError();
            }
            if (options === false) {
                leading = false;
            } else if (isObject(options)) {
                leading = "leading" in options ? options.leading : leading;
                trailing = "trailing" in options ? options.trailing : trailing;
            }
            debounceOptions.leading = leading;
            debounceOptions.maxWait = wait;
            debounceOptions.trailing = trailing;
            return debounce(func, wait, debounceOptions);
        }
        function wrap(value, wrapper) {
            return createWrapper(wrapper, 16, [ value ]);
        }
        function escape(string) {
            return string == null ? "" : String(string).replace(reUnescapedHtml, escapeHtmlChar);
        }
        function identity(value) {
            return value;
        }
        function mixin(object, source) {
            var ctor = object, isFunc = !source || isFunction(ctor);
            if (!source) {
                ctor = lodashWrapper;
                source = object;
                object = lodash;
            }
            forEach(functions(source), function(methodName) {
                var func = object[methodName] = source[methodName];
                if (isFunc) {
                    ctor.prototype[methodName] = function() {
                        var value = this.__wrapped__, args = [ value ];
                        push.apply(args, arguments);
                        var result = func.apply(object, args);
                        if (value && typeof value == "object" && value === result) {
                            return this;
                        }
                        result = new ctor(result);
                        result.__chain__ = this.__chain__;
                        return result;
                    };
                }
            });
        }
        function noConflict() {
            context._ = oldDash;
            return this;
        }
        function noop() {}
        var parseInt = nativeParseInt(whitespace + "08") == 8 ? nativeParseInt : function(value, radix) {
            return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, "") : value, radix || 0);
        };
        function random(min, max, floating) {
            var noMin = min == null, noMax = max == null;
            if (floating == null) {
                if (typeof min == "boolean" && noMax) {
                    floating = min;
                    min = 1;
                } else if (!noMax && typeof max == "boolean") {
                    floating = max;
                    noMax = true;
                }
            }
            if (noMin && noMax) {
                max = 1;
            }
            min = +min || 0;
            if (noMax) {
                max = min;
                min = 0;
            } else {
                max = +max || 0;
            }
            if (floating || min % 1 || max % 1) {
                var rand = nativeRandom();
                return nativeMin(min + rand * (max - min + parseFloat("1e-" + ((rand + "").length - 1))), max);
            }
            return baseRandom(min, max);
        }
        function result(object, property) {
            if (object) {
                var value = object[property];
                return isFunction(value) ? object[property]() : value;
            }
        }
        function template(text, data, options) {
            var settings = lodash.templateSettings;
            text = String(text || "");
            options = defaults({}, options, settings);
            var imports = defaults({}, options.imports, settings.imports), importsKeys = keys(imports), importsValues = values(imports);
            var isEvaluating, index = 0, interpolate = options.interpolate || reNoMatch, source = "__p += '";
            var reDelimiters = RegExp((options.escape || reNoMatch).source + "|" + interpolate.source + "|" + (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + "|" + (options.evaluate || reNoMatch).source + "|$", "g");
            text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
                interpolateValue || (interpolateValue = esTemplateValue);
                source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);
                if (escapeValue) {
                    source += "' +\n__e(" + escapeValue + ") +\n'";
                }
                if (evaluateValue) {
                    isEvaluating = true;
                    source += "';\n" + evaluateValue + ";\n__p += '";
                }
                if (interpolateValue) {
                    source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
                }
                index = offset + match.length;
                return match;
            });
            source += "';\n";
            var variable = options.variable, hasVariable = variable;
            if (!hasVariable) {
                variable = "obj";
                source = "with (" + variable + ") {\n" + source + "\n}\n";
            }
            source = (isEvaluating ? source.replace(reEmptyStringLeading, "") : source).replace(reEmptyStringMiddle, "$1").replace(reEmptyStringTrailing, "$1;");
            source = "function(" + variable + ") {\n" + (hasVariable ? "" : variable + " || (" + variable + " = {});\n") + "var __t, __p = '', __e = _.escape" + (isEvaluating ? ", __j = Array.prototype.join;\n" + "function print() { __p += __j.call(arguments, '') }\n" : ";\n") + source + "return __p\n}";
            var sourceURL = "\n/*\n//# sourceURL=" + (options.sourceURL || "/lodash/template/source[" + templateCounter++ + "]") + "\n*/";
            try {
                var result = Function(importsKeys, "return " + source + sourceURL).apply(undefined, importsValues);
            } catch (e) {
                e.source = source;
                throw e;
            }
            if (data) {
                return result(data);
            }
            result.source = source;
            return result;
        }
        function times(n, callback, thisArg) {
            n = (n = +n) > -1 ? n : 0;
            var index = -1, result = Array(n);
            callback = baseCreateCallback(callback, thisArg, 1);
            while (++index < n) {
                result[index] = callback(index);
            }
            return result;
        }
        function unescape(string) {
            return string == null ? "" : String(string).replace(reEscapedHtml, unescapeHtmlChar);
        }
        function uniqueId(prefix) {
            var id = ++idCounter;
            return String(prefix == null ? "" : prefix) + id;
        }
        function chain(value) {
            value = new lodashWrapper(value);
            value.__chain__ = true;
            return value;
        }
        function tap(value, interceptor) {
            interceptor(value);
            return value;
        }
        function wrapperChain() {
            this.__chain__ = true;
            return this;
        }
        function wrapperToString() {
            return String(this.__wrapped__);
        }
        function wrapperValueOf() {
            return this.__wrapped__;
        }
        lodash.after = after;
        lodash.assign = assign;
        lodash.at = at;
        lodash.bind = bind;
        lodash.bindAll = bindAll;
        lodash.bindKey = bindKey;
        lodash.chain = chain;
        lodash.compact = compact;
        lodash.compose = compose;
        lodash.countBy = countBy;
        lodash.create = create;
        lodash.createCallback = createCallback;
        lodash.curry = curry;
        lodash.debounce = debounce;
        lodash.defaults = defaults;
        lodash.defer = defer;
        lodash.delay = delay;
        lodash.difference = difference;
        lodash.filter = filter;
        lodash.flatten = flatten;
        lodash.forEach = forEach;
        lodash.forEachRight = forEachRight;
        lodash.forIn = forIn;
        lodash.forInRight = forInRight;
        lodash.forOwn = forOwn;
        lodash.forOwnRight = forOwnRight;
        lodash.functions = functions;
        lodash.groupBy = groupBy;
        lodash.indexBy = indexBy;
        lodash.initial = initial;
        lodash.intersection = intersection;
        lodash.invert = invert;
        lodash.invoke = invoke;
        lodash.keys = keys;
        lodash.map = map;
        lodash.max = max;
        lodash.memoize = memoize;
        lodash.merge = merge;
        lodash.min = min;
        lodash.omit = omit;
        lodash.once = once;
        lodash.pairs = pairs;
        lodash.partial = partial;
        lodash.partialRight = partialRight;
        lodash.pick = pick;
        lodash.pluck = pluck;
        lodash.pull = pull;
        lodash.range = range;
        lodash.reject = reject;
        lodash.remove = remove;
        lodash.rest = rest;
        lodash.shuffle = shuffle;
        lodash.sortBy = sortBy;
        lodash.tap = tap;
        lodash.throttle = throttle;
        lodash.times = times;
        lodash.toArray = toArray;
        lodash.transform = transform;
        lodash.union = union;
        lodash.uniq = uniq;
        lodash.values = values;
        lodash.where = where;
        lodash.without = without;
        lodash.wrap = wrap;
        lodash.zip = zip;
        lodash.zipObject = zipObject;
        lodash.collect = map;
        lodash.drop = rest;
        lodash.each = forEach;
        lodash.eachRight = forEachRight;
        lodash.extend = assign;
        lodash.methods = functions;
        lodash.object = zipObject;
        lodash.select = filter;
        lodash.tail = rest;
        lodash.unique = uniq;
        lodash.unzip = zip;
        mixin(lodash);
        lodash.clone = clone;
        lodash.cloneDeep = cloneDeep;
        lodash.contains = contains;
        lodash.escape = escape;
        lodash.every = every;
        lodash.find = find;
        lodash.findIndex = findIndex;
        lodash.findKey = findKey;
        lodash.findLast = findLast;
        lodash.findLastIndex = findLastIndex;
        lodash.findLastKey = findLastKey;
        lodash.has = has;
        lodash.identity = identity;
        lodash.indexOf = indexOf;
        lodash.isArguments = isArguments;
        lodash.isArray = isArray;
        lodash.isBoolean = isBoolean;
        lodash.isDate = isDate;
        lodash.isElement = isElement;
        lodash.isEmpty = isEmpty;
        lodash.isEqual = isEqual;
        lodash.isFinite = isFinite;
        lodash.isFunction = isFunction;
        lodash.isNaN = isNaN;
        lodash.isNull = isNull;
        lodash.isNumber = isNumber;
        lodash.isObject = isObject;
        lodash.isPlainObject = isPlainObject;
        lodash.isRegExp = isRegExp;
        lodash.isString = isString;
        lodash.isUndefined = isUndefined;
        lodash.lastIndexOf = lastIndexOf;
        lodash.mixin = mixin;
        lodash.noConflict = noConflict;
        lodash.noop = noop;
        lodash.parseInt = parseInt;
        lodash.random = random;
        lodash.reduce = reduce;
        lodash.reduceRight = reduceRight;
        lodash.result = result;
        lodash.runInContext = runInContext;
        lodash.size = size;
        lodash.some = some;
        lodash.sortedIndex = sortedIndex;
        lodash.template = template;
        lodash.unescape = unescape;
        lodash.uniqueId = uniqueId;
        lodash.all = every;
        lodash.any = some;
        lodash.detect = find;
        lodash.findWhere = find;
        lodash.foldl = reduce;
        lodash.foldr = reduceRight;
        lodash.include = contains;
        lodash.inject = reduce;
        forOwn(lodash, function(func, methodName) {
            if (!lodash.prototype[methodName]) {
                lodash.prototype[methodName] = function() {
                    var args = [ this.__wrapped__ ], chainAll = this.__chain__;
                    push.apply(args, arguments);
                    var result = func.apply(lodash, args);
                    return chainAll ? new lodashWrapper(result, chainAll) : result;
                };
            }
        });
        lodash.first = first;
        lodash.last = last;
        lodash.sample = sample;
        lodash.take = first;
        lodash.head = first;
        forOwn(lodash, function(func, methodName) {
            var callbackable = methodName !== "sample";
            if (!lodash.prototype[methodName]) {
                lodash.prototype[methodName] = function(n, guard) {
                    var chainAll = this.__chain__, result = func(this.__wrapped__, n, guard);
                    return !chainAll && (n == null || guard && !(callbackable && typeof n == "function")) ? result : new lodashWrapper(result, chainAll);
                };
            }
        });
        lodash.VERSION = "2.3.0";
        lodash.prototype.chain = wrapperChain;
        lodash.prototype.toString = wrapperToString;
        lodash.prototype.value = wrapperValueOf;
        lodash.prototype.valueOf = wrapperValueOf;
        baseEach([ "join", "pop", "shift" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                var chainAll = this.__chain__, result = func.apply(this.__wrapped__, arguments);
                return chainAll ? new lodashWrapper(result, chainAll) : result;
            };
        });
        baseEach([ "push", "reverse", "sort", "unshift" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                func.apply(this.__wrapped__, arguments);
                return this;
            };
        });
        baseEach([ "concat", "slice", "splice" ], function(methodName) {
            var func = arrayRef[methodName];
            lodash.prototype[methodName] = function() {
                return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
            };
        });
        if (!support.spliceObjects) {
            baseEach([ "pop", "shift", "splice" ], function(methodName) {
                var func = arrayRef[methodName], isSplice = methodName == "splice";
                lodash.prototype[methodName] = function() {
                    var chainAll = this.__chain__, value = this.__wrapped__, result = func.apply(value, arguments);
                    if (value.length === 0) {
                        delete value[0];
                    }
                    return chainAll || isSplice ? new lodashWrapper(result, chainAll) : result;
                };
            });
        }
        return lodash;
    }
    var _ = runInContext();
    if (typeof define == "function" && typeof define.amd == "object" && define.amd) {
        root._ = _;
        define(function() {
            return _;
        });
    } else if (freeExports && freeModule) {
        if (moduleExports) {
            (freeModule.exports = _)._ = _;
        } else {
            freeExports._ = _;
        }
    } else {
        root._ = _;
    }
    return _;
}.call(this);

(function() {
    "use strict";
    var i = 0;
    _.__i__ = function() {
        return i++;
    };
    _.fileSystemError = function(e) {
        var msg = "";
        switch (e.name) {
          case "QUOTA_EXCEEDED_ERR":
            msg = "QUOTA_EXCEEDED_ERR";
            break;

          case "NOT_FOUND_ERR":
            msg = "NOT_FOUND_ERR";
            break;

          case "SECURITY_ERR":
            msg = "SECURITY_ERR";
            break;

          case "INVALID_MODIFICATION_ERR":
            msg = "INVALID_MODIFICATION_ERR";
            break;

          case "INVALID_STATE_ERR":
            msg = "INVALID_STATE_ERR";
            break;

          default:
            msg = "Unknown Error";
            break;
        }
        console.log("Error: " + msg);
        return;
    };
    _.lockProperty = function(scope, prop) {
        Object.defineProperty(scope, prop, {
            enumerable: true,
            configurable: false,
            writable: false
        });
        return;
    };
    _.createProps = function(scope, props) {
        for (var i = 0; i < props.length; i++) {
            Object.defineProperty(scope, props[i].name, props[i].attrs);
        }
        return;
    };
    _.createProp = function(scope, prop) {
        Object.defineProperty(scope, prop.name, prop.attrs);
        return;
    };
    _.updateProp = function(scope, prop) {
        Object.defineProperty(scope, prop.name, prop.attrs);
        return;
    };
    _.parseVersion = function(version) {
        var versions = version.split(",");
        var resp = {};
        if (versions.length > 1) {
            var start = versions[0].charAt(0);
            var end = versions[1].charAt(versions[1].length - 1);
            if (start == "[") {
                resp.gte = versions[0].substring(1).trim();
            } else if (start == "(" || start == "{") {
                resp.gt = versions[0].substring(1).trim();
            }
            if (end == "]") {
                resp.lte = versions[1].substring(0, versions[1].length - 1).trim();
            } else if (end == ")" || end == "}") {
                resp.lt = versions[1].substring(0, versions[1].length - 1).trim();
            }
        } else {
            resp.eq = versions[0];
        }
        return resp;
    };
    _.sanitizeVersion = function(version) {
        var num = 0;
        var splits = version.split(".");
        var dif = 3 - splits.length;
        for (var i = 0; i < dif; i++) {
            splits.push(0);
        }
        num += parseInt(splits[0], 10) * 1e6;
        num += parseInt(splits[1], 10) * 1e3;
        num += parseInt(splits[2], 10);
        return num;
    };
    _.versionMatch = function(exp, imp) {
        var target = _.sanitizeVersion(exp.eq);
        if (imp.eq && _.sanitizeVersion(imp.eq) != target) return false;
        if (imp.gte && _.sanitizeVersion(imp.gte) > target) return false;
        if (imp.gt && _.sanitizeVersion(imp.gt) >= target) return false;
        if (imp.lte && _.sanitizeVersion(imp.lte) < target) return false;
        if (imp.lt && _.sanitizeVersion(imp.lt) <= target) return false;
        return true;
    };
    _.hash = function(str) {
        if (_.isNormalObject(str)) {
            str = JSON.stringify(str);
        }
        str = _.encode_utf8(str);
        var table = "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D";
        var crc = 0, x = 0, y = 0;
        crc = crc ^ -1;
        for (var i = 0, iTop = str.length; i < iTop; i++) {
            y = (crc ^ str.charCodeAt(i)) & 255;
            x = "0x" + table.substr(y * 9, 8);
            crc = crc >>> 8 ^ x;
        }
        return crc ^ -1;
    };
    _.encode_utf8 = function(str) {
        return unescape(encodeURIComponent(str));
    };
    _.decode_utf8 = function(str) {
        return decodeURIComponent(escape(str));
    };
    _.queryStringEncode = function(obj) {
        var ret = [];
        if (_.isNormalObject(obj)) {
            for (var key in obj) {
                ret.push(_.encode_utf8(key) + "=" + _.encode_utf8(obj[key]));
            }
        }
        return ret.join("&");
    };
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
    var linkify_regex = new RegExp("(" + "\\b([a-z][-a-z0-9+.]+://|www\\.)" + "[^\\s'\"<>()]+" + "|" + "\\b[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}\\b" + ")", "gi");
    var youtube_regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    _.youtube_parser = function(url) {
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
            var l = m[0].replace(/\.*$/, "");
            var yt = _.youtube_parser(l);
            var vm = _.vimeo_parser(l);
            if (yt) {
                result += "<div class='video-container'><iframe id='ytplayer' type='text/html' src='http://www.youtube.com/embed/" + yt + "?autoplay=0' frameborder='0' allowfullscreen></iframe></div>";
            } else if (vm) {
                result += "<div class='video-container'><iframe src='http://player.vimeo.com/video/" + vm + "' frameborder='0' allowFullScreen></iframe></div>";
            } else if (l.indexOf("@") > 0) {
                result += '<a target="_blank" href="';
                result += "mailto:";
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            } else if (l.indexOf(":/") < 0) {
                result += '<a target="_blank" href="';
                result += "http://";
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            } else {
                result += '<a target="_blank" href="';
                result += l + '">' + string.substr(m.index, l.length) + "</a>";
            }
            p = m.index + l.length;
        }
        return result + string.substr(p);
    };
    _.getCurrentLocationRoute = function() {
        var data = {
            route: window.location.pathname + window.location.hash,
            host: window.location.host,
            pathname: window.location.pathname,
            search: window.location.search,
            href: window.location.href,
            hash: window.location.hash
        };
        data.route = data.route.replace(/\/#\/|\/#|#/, "/");
        data.route = data.route.replace(/^\/|\/$/g, "");
        data.route = data.route.replace(/\//g, ":");
        return data;
    };
    _.getByteLength = function(str) {
        if (str === null || str === undefined) {
            return 0;
        }
        var m = encodeURIComponent(str).match(/%[89ABab]/g);
        return str.length + (m ? m.length : 0);
    };
    _.getOption = function(target, optionName) {
        if (!target || !optionName) {
            return;
        }
        if (target.options && optionName in target.options && target.options[optionName] !== undefined) {
            return target.options[optionName];
        } else {
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
        if (keys) {
            aKeys = keys;
            bKeys = keys;
            for (var i = 0; i < keys.length; i++) {
                if (tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
                    return false;
                }
            }
        } else {
            aKeys = tempAKeys;
            bKeys = tempBKeys;
        }
        for (i = 0; i < aKeys.length; i++) {
            dirtyKeys[aKeys[i]] = dirtyKeys[aKeys[i]] || {};
            dirtyKeys[aKeys[i]].aVal = a[aKeys[i]];
        }
        for (i = 0; i < bKeys.length; i++) {
            dirtyKeys[bKeys[i]] = dirtyKeys[bKeys[i]] || {};
            dirtyKeys[bKeys[i]].bVal = b[bKeys[i]];
            if (typeof dirtyKeys[bKeys[i]].aVal !== "undefined" && _.isEqual(dirtyKeys[bKeys[i]].aVal, dirtyKeys[bKeys[i]].bVal, null, options) || typeof dirtyKeys[bKeys[i]].aVal === "undefined" && typeof dirtyKeys[bKeys[i]].bVal === "undefined") {
                delete dirtyKeys[bKeys[i]];
            }
        }
        keysArray = Object.keys(dirtyKeys);
        for (i = 0; i < keysArray.length; i++) {
            dirtyKeys[keysArray[i]].diff = _.diffValues(dirtyKeys[keysArray[i]].aVal, dirtyKeys[keysArray[i]].bVal, options);
        }
        return dirtyKeys;
    };
    _.diffValues = function(a, b, options) {
        options = options || {
            arrayOrderMatters: false
        };
        var aType, bType;
        if (typeof a === "undefined") {
            aType = "undefined";
        } else {
            aType = Object.prototype.toString.call(a);
        }
        if (typeof b === "undefined") {
            bType = "undefined";
        } else {
            bType = Object.prototype.toString.call(b);
        }
        if (aType !== bType) {
            return {
                from: {
                    type: aType,
                    value: a
                },
                to: {
                    type: bType,
                    value: b
                }
            };
        } else {
            switch (aType) {
              case "[object Object]":
                return {
                    objectChange: _.dirtyKeys(a, b)
                };
                break;

              case "[object Array]":
                var ret = {
                    removed: [],
                    added: [],
                    changed: []
                };
                if (options.arrayOrderMatters) {
                    var i, j;
                    var iMax = a.length;
                    var jMax = b.length;
                    while (i < aMax && j < bMax) {
                        if (_.isEqual(a[i], b[j])) {
                            i++;
                            j++;
                        }
                        if (j < jMax && i < iMax) {
                            ret.changed.push({
                                index: i,
                                from: a[i],
                                to: b[j],
                                diff: _.diffValues(a[i], b[j], options)
                            });
                            j++;
                            i++;
                        } else if (i < iMax && j >= jMax) {
                            ret.removed.push({
                                index: i,
                                from: a[i],
                                to: null
                            });
                            i++;
                        } else if (j < jMax && i >= iMax) {
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
                    for (i = 0; i < a.length; i++) {
                        aIndexMatched = false;
                        for (j = 0; j < b.length; j++) {
                            if (_.isEqual(a[i], b[j])) {
                                aIndexMatched = true;
                                aIndexesMatched.push(i);
                                bIndexesMatched.push(j);
                                break;
                            }
                        }
                        if (!aIndexMatched) {
                            ret.removed.push({
                                index: null,
                                from: a[i],
                                to: null
                            });
                        }
                    }
                    for (j = 0; j < b.length; j++) {
                        bIndexMatched = false;
                        if (bIndexesMatched.indexOf(j) >= 0) {
                            continue;
                        }
                        ret.added.push({
                            index: null,
                            from: null,
                            to: b[j]
                        });
                    }
                    return ret;
                }
                break;

              default:
                return {
                    from: {
                        type: aType,
                        value: a
                    },
                    to: {
                        type: bType,
                        value: b
                    }
                };
                break;
            }
        }
    };
    _.isDirtyEqual = function(a, b, keys, options) {
        keys = keys || null;
        options = options || {};
        var aKeys, bKeys, aType, bType;
        if (a === b || a == b) {
            return true;
        }
        aType = Object.prototype.toString.call(a);
        bType = Object.prototype.toString.call(b);
        if (aType !== bType) {
            return false;
        }
        switch (aType) {
          case "[object Object]":
            var tempAKeys = Object.keys(a);
            var tempBKeys = Object.keys(b);
            if (keys) {
                aKeys = keys;
                bKeys = keys;
                for (var i = 0; i < keys.length; i++) {
                    if (tempAKeys.indexOf(keys[i]) === -1 || tempBKeys.indexOf(keys[i]) === -1) {
                        return false;
                    }
                }
            } else {
                aKeys = tempAKeys;
                bKeys = tempBKeys;
            }
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            if (keys || _.isDirtyEqual(aKeys, bKeys, null, options)) {
                for (var i = 0; i < aKeys.length; i++) {
                    if (!_.isDirtyEqual(a[aKeys[i]], b[bKeys[i]], null, options)) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
            break;

          case "[object Array]":
            if (a.length !== b.length) {
                return false;
            }
            for (var i = 0; i < a.length; i++) {
                if (!_.isDirtyEqual(a[i], b[i], null, options)) {
                    return false;
                }
            }
            return true;
            break;

          case "[object Function]":
            if (a.toString() !== b.toString()) {
                return false;
            }
            break;

          case "[object Number]":
            if (a != b) {
                return false;
            }
            break;

          case "[object Date]":
            if (a.getTime() != b.getTime()) {
                return false;
            } else {
                return true;
            }
            break;
        }
        return false;
    };
    _.isNormalObject = function(item) {
        return Boolean(item) && Object.prototype.toString.call(item) === "[object Object]";
    };
    var isUrnRegex = /^[^:]+:.*[^:]$/;
    _.isUrn = function(urn) {
        return _.isString(urn) && isUrnRegex.exec(urn);
    };
    _.isRegex = _.isRegExp;
    _.genericizeTargetSelectorQueryString = function(ele) {
        var qs = [];
        if (ele.globalSelectorString != "" && ele.globalSelectorString != null && ele.globalSelectorString != undefined) {
            return ele.globalSelectorString;
        }
        qs = recursiveGenericizeTargetSelectorQueryString(ele, qs);
        qs = qs.join(" > ");
        ele.globalSelectorString = qs;
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
    }
    _.whiteListDomEvent = function(e, ele) {
        ele = ele || e.currentTarget;
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
        canonicalizeMenu: function(menu) {
            var canonicalMenu = canonicalMenu || {};
            for (var i = 0; i < menu.length; i++) {
                var menuData = menu[i].data;
                var conflictData = {};
                var conflictsCounter = {};
                for (var menuName in menuData) {
                    canonicalMenu[menuName] = canonicalMenu[menuName] || {
                        children: {},
                        "class": "",
                        name: "",
                        parentClass: ""
                    };
                    if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(menuData[menuName].children).length === 0) {
                        canonicalMenu[menuName]["name"] = menuData[menuName]["name"] || "";
                        canonicalMenu[menuName]["class"] += " " + (menuData[menuName]["class"] || "");
                        canonicalMenu[menuName]["parentClass"] += " " + (menuData[menuName]["parentClass"] || "");
                    } else {
                        if (Object.keys(menuData[menuName].children).length === 0 || Object.keys(canonicalMenu[menuName].children).length === 0) {
                            conflictsCounter[menuName] = conflictsCounter[menuName] || 0;
                            conflictsCounter[menuName]++;
                            conflictData[menuName + " (" + conflictsCounter[menuName] + ")"] = menuData[menuName];
                        } else {
                            canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, menuData[menuName].children || {});
                            canonicalMenu[menuName]["name"] = menuData[menuName]["name"] || "";
                            canonicalMenu[menuName]["class"] += " " + (menuData[menuName]["class"] || "");
                            canonicalMenu[menuName]["parentClass"] += " " + (menuData[menuName]["parentClass"] || "");
                        }
                    }
                }
                for (var menuName in conflictData) {
                    canonicalMenu[menuName] = canonicalMenu[menuName] || {
                        children: {},
                        "class": "",
                        name: "",
                        parentClass: ""
                    };
                    if (Object.keys(canonicalMenu[menuName].children).length === 0 && Object.keys(conflictData[menuName].children).length === 0) {
                        canonicalMenu[menuName]["name"] = conflictData[menuName]["name"] || "";
                        canonicalMenu[menuName]["class"] += " " + (conflictData[menuName]["class"] || "");
                        canonicalMenu[menuName]["parentClass"] += " " + (conflictData[menuName]["parentClass"] || "");
                    } else {
                        canonicalMenu[menuName].children = _.viewHelpers.canonicalizeMenuChildren(canonicalMenu[menuName].children, conflictData[menuName].children || {});
                        canonicalMenu[menuName]["name"] = conflictData[menuName]["name"] || "";
                        canonicalMenu[menuName]["class"] += " " + (conflictData[menuName]["class"] || "");
                        canonicalMenu[menuName]["parentClass"] += " " + (conflictData[menuName]["parentClass"] || "");
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
                    canonicalizedChildren[key]["class"] = currentChildren[key]["class"] + " " + newChildren[key]["class"];
                    canonicalizedChildren[key]["name"] = currentChildren[key]["name"] + " " + newChildren[key]["name"];
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
            if (lastTime && lastTime.getTime) {
                lastTime = lastTime.getTime();
            } else if (lastTime) {
                lastTime = new Date(lastTime).getTime();
            } else {
                lastTime = new Date().getTime();
            }
            if (firstTime && firstTime.getTime) {
                firstTime = firstTime.getTime();
            } else if (firstTime) {
                firstTime = new Date(firstTime).getTime();
            } else {
                firstTime = new Date().getTime();
            }
            var diff = Math.abs(lastTime - firstTime);
            var days = diff / (1e3 * 60 * 60 * 24);
            var hours = days % 1 * 24;
            var minutes = hours % 1 * 60;
            days = Math.floor(days);
            hours = Math.floor(hours);
            minutes = Math.floor(minutes);
            if (days) {
                days += "d ";
                hours += "hr";
                return days + hours;
            } else if (hours) {
                hours += "hr ";
                minutes += "m";
                return hours + minutes;
            } else {
                minutes += "m";
                return minutes;
            }
        },
        formatDate: function(format, date) {
            var ret = "";
            if (!_.isDate(date)) {
                date = new Date(date);
                if (!_.isDate(date)) {
                    date = new Date();
                }
            }
            ret = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
            return ret;
        },
        formatTime: function(format, date) {
            var ret = "";
            if (!_.isDate(date)) {
                date = new Date(date);
                if (!_.isDate(date)) {
                    date = new Date();
                }
            }
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var AMPM;
            if (hours >= 12) {
                hours -= 12;
                AMPM = "PM";
            } else {
                AMPM = "AM";
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            ret = hours + ":" + minutes + " " + AMPM;
            return ret;
        },
        escapeHtml: _.escape
    };
    return _;
})();

(function() {
    "use strict";
    _.enableRetardMode = function() {
        if (!Object.keys) {
            Object.keys = function() {
                "use strict";
                var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !{
                    toString: null
                }.propertyIsEnumerable("toString"), dontEnums = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ], dontEnumsLength = dontEnums.length;
                return function(obj) {
                    if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
                        throw new TypeError("Object.keys called on non-object");
                    }
                    var result = [], prop, i;
                    for (prop in obj) {
                        if (hasOwnProperty.call(obj, prop)) {
                            result.push(prop);
                        }
                    }
                    if (hasDontEnumBug) {
                        for (i = 0; i < dontEnumsLength; i++) {
                            if (hasOwnProperty.call(obj, dontEnums[i])) {
                                result.push(dontEnums[i]);
                            }
                        }
                    }
                    return result;
                };
            }();
        }
        if (!Object.create) {
            Object.create = function() {
                function F() {}
                return function(o) {
                    if (arguments.length != 1) {
                        throw new Error("Object.create implementation only accepts one parameter.");
                    }
                    F.prototype = o;
                    return new F();
                };
            }();
        }
        if (!Object.freeze) {
            Object.freeze = function(obj) {
                return obj;
            };
            Object.isFrozen = function() {
                return false;
            };
        }
        if (!Object.seal) {
            Object.seal = function(obj) {
                return obj;
            };
            Object.isSealed = function() {
                return false;
            };
        }
        if (!Object.preventExtensions) {
            Object.preventExtensions = function(obj) {
                return obj;
            };
            Object.isExtensible = function() {
                return false;
            };
        }
        if (!Function.prototype.bind) {
            Function.prototype.bind = function(oThis) {
                if (typeof this !== "function") {
                    throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                }
                var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function() {}, fBound = function() {
                    return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
                };
                fNOP.prototype = this.prototype;
                fBound.prototype = new fNOP();
                return fBound;
            };
        }
        if (!Array.prototype.forEach) {
            Array.prototype.forEach = function forEach(callback, thisArg) {
                "use strict";
                var T, k;
                if (this == null) {
                    throw new TypeError("this is null or not defined");
                }
                var kValue, O = Object(this), len = O.length >>> 0;
                if ({}.toString.call(callback) !== "[object Function]") {
                    throw new TypeError(callback + " is not a function");
                }
                if (arguments.length >= 2) {
                    T = thisArg;
                }
                k = 0;
                while (k < len) {
                    if (k in O) {
                        kValue = O[k];
                        callback.call(T, kValue, k, O);
                    }
                    k++;
                }
            };
        }
        if (!Array.prototype.map) {
            Array.prototype.map = function(callback, thisArg) {
                var T, A, k;
                if (this == null) {
                    throw new TypeError(" this is null or not defined");
                }
                var O = Object(this);
                var len = O.length >>> 0;
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function");
                }
                if (thisArg) {
                    T = thisArg;
                }
                A = new Array(len);
                k = 0;
                while (k < len) {
                    var kValue, mappedValue;
                    if (k in O) {
                        kValue = O[k];
                        mappedValue = callback.call(T, kValue, k, O);
                        A[k] = mappedValue;
                    }
                    k++;
                }
                return A;
            };
        }
        if (!Array.prototype.filter) {
            Array.prototype.filter = function(fun) {
                "use strict";
                if (!this) {
                    throw new TypeError();
                }
                var objects = Object(this);
                var len = objects.length >>> 0;
                if (typeof fun !== "function") {
                    throw new TypeError();
                }
                var res = [];
                var thisp = arguments[1];
                for (var i in objects) {
                    if (objects.hasOwnProperty(i)) {
                        if (fun.call(thisp, objects[i], i, objects)) {
                            res.push(objects[i]);
                        }
                    }
                }
                return res;
            };
        }
        if (!("every" in Array.prototype)) {
            Array.prototype.every = function(tester, that) {
                for (var i = 0, n = this.length; i < n; i++) if (i in this && !tester.call(that, this[i], i, this)) return false;
                return true;
            };
        }
        if (!("some" in Array.prototype)) {
            Array.prototype.some = function(tester, that) {
                for (var i = 0, n = this.length; i < n; i++) if (i in this && tester.call(that, this[i], i, this)) return true;
                return false;
            };
        }
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(searchElement) {
                "use strict";
                if (this == null) {
                    throw new TypeError();
                }
                var n, k, t = Object(this), len = t.length >>> 0;
                if (len === 0) {
                    return -1;
                }
                n = 0;
                if (arguments.length > 1) {
                    n = Number(arguments[1]);
                    if (n != n) {
                        n = 0;
                    } else if (n != 0 && n != Infinity && n != -Infinity) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
                if (n >= len) {
                    return -1;
                }
                for (k = n >= 0 ? n : Math.max(len - Math.abs(n), 0); k < len; k++) {
                    if (k in t && t[k] === searchElement) {
                        return k;
                    }
                }
                return -1;
            };
        }
        if (!String.prototype.trim) {
            String.prototype.trim = function() {
                return this.replace(/^\s+|\s+$/g, "");
            };
        }
        if (!("lastIndexOf" in Array.prototype)) {
            Array.prototype.lastIndexOf = function(find, i) {
                if (i === undefined) i = this.length - 1;
                if (i < 0) i += this.length;
                if (i > this.length - 1) i = this.length - 1;
                for (i++; i-- > 0; ) if (i in this && this[i] === find) return i;
                return -1;
            };
        }
    };
})();

(function(global, undefined) {
    "use strict";
    var nextHandle = 1;
    var freeHandle;
    var cbsByHandle = [];
    var argsByHandle = [];
    var howMany = 0;
    global.setImmediateDebug = function() {
        return {
            nextHandle: nextHandle,
            freeHandle: freeHandle,
            cbsByHandle: cbsByHandle,
            argsByHandle: argsByHandle,
            howMany: howMany
        };
    };
    var handle;
    function addFromSetImmediate(cb, args) {
        handle = freeHandle !== undefined ? freeHandle : nextHandle++;
        cbsByHandle[handle] = cb;
        argsByHandle[handle] = args;
        freeHandle = undefined;
        return handle;
    }
    function runIfPresent(key) {
        key = parseInt(key, 10);
        cbsByHandle[key] ? cbsByHandle[key].apply(undefined, argsByHandle[key]) : false;
        freeHandle = key;
        howMany++;
    }
    function canUseNextTick() {
        return typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
    }
    function canUsePostMessage() {
        if (!global.postMessage || global.importScripts) {
            return false;
        }
        var postMessageIsAsynchronous = true;
        var oldOnMessage = global.onmessage;
        global.onmessage = function() {
            postMessageIsAsynchronous = false;
        };
        global.postMessage("", "*");
        global.onmessage = oldOnMessage;
        return postMessageIsAsynchronous;
    }
    function canUseMessageChannel() {
        return !!global.MessageChannel;
    }
    function installNextTickImplementation(attachTo) {
        attachTo.setImmediate = function() {
            var args = arguments;
            process.nextTick(function() {
                args[0].call(undefined, Array.prototype.slice.call(args, 1));
            });
        };
    }
    function installPostMessageImplementation(attachTo) {
        var MESSAGE_PREFIX = "com.setImmediate" + Math.random();
        var MESSAGE_PREFIX_LENGTH = MESSAGE_PREFIX.length;
        function isStringAndStartsWith(string) {
            return typeof string === "string" && string.substring(0, MESSAGE_PREFIX_LENGTH) === MESSAGE_PREFIX;
        }
        function onGlobalMessage(event) {
            if (event.source === global && isStringAndStartsWith(event.data)) {
                runIfPresent(event.data.substring(MESSAGE_PREFIX_LENGTH));
            }
        }
        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            global.postMessage(MESSAGE_PREFIX + addFromSetImmediate(cb, args), "*");
        };
    }
    function installMessageChannelImplementation(attachTo) {
        var channel = new global.MessageChannel();
        channel.port1.onmessage = function(event) {
            runIfPresent(event.data);
        };
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            channel.port2.postMessage(addFromSetImmediate(cb, args));
        };
    }
    function installSetTimeoutImplementation(attachTo) {
        attachTo.setImmediate = function() {
            var cb = arguments[0];
            var args = Array.prototype.slice.call(arguments, 1);
            global.setTimeout(function() {
                cb.call(undefined, args);
            }, 0);
        };
    }
    if (!global.setImmediate) {
        var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ? Object.getPrototypeOf(global) : global;
        if (canUseNextTick()) {
            installNextTickImplementation(attachTo);
        } else if (canUsePostMessage()) {
            installPostMessageImplementation(attachTo);
        } else if (canUseMessageChannel()) {
            installMessageChannelImplementation(attachTo);
        } else {
            installSetTimeoutImplementation(attachTo);
        }
    }
})(typeof self === "object" && self ? self : this);

(function() {
    "use strict";
    Set.prototype = Object.create(Object.prototype);
    Set.prototype.get = function(key) {
        return this.find(key);
    };
    Set.prototype.has = function(key) {
        if (this.find(key)) {
            return true;
        }
        return false;
    };
    Set.prototype.toString = function() {
        return "[object Set]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Set.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Set.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Set.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Set(seed) {
        var innerData = [];
        if (seed !== null && seed != undefined && typeof seed !== "undefined") innerData = seed;
        this.add = function(key) {
            if (this.find(key) === undefined) innerData.push(key);
        };
        this["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i] === key) {
                    innerData.splice(i, 1);
                    break;
                }
            }
        };
        this.size = function() {
            return innerData.length;
        };
        this.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i] === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        this.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(this, "add", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        return this;
    }
    _.Set = Set;
})();

(function() {
    "use strict";
    Map.prototype = Object.create(Object.prototype);
    Map.prototype.get = function(key) {
        var res = this.find(key);
        if (res) {
            return res.val;
        }
        return null;
    };
    Map.prototype.has = function(key) {
        if (this.find(key)) {
            return true;
        }
        return false;
    };
    Map.prototype.toString = function() {
        return "[object Map]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Map.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Map.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(Map.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Map(seed) {
        var innerData = [];
        this.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        this.size = function() {
            return innerData.length;
        };
        this.set = function(key, val) {
            var res = this.find(key);
            if (res != undefined) {
                res.val = val;
            } else {
                innerData.push({
                    key: key,
                    val: val
                });
            }
            return;
        };
        this["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    innerData.splice(i, 1);
                    break;
                }
            }
        };
        this.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(this, "find", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "set", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(this, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        if (!_.isArray(seed)) {
            seed = _.pairs(seed);
        }
        for (var i = 0; i < seed.length; i++) {
            var val = seed[i];
            if (_.isArray(val)) {
                this.set(val[0], val[1]);
            } else {
                for (var prop in val) {
                    this.set(prop, val[prop]);
                }
            }
        }
        return this;
    }
    _.Map = Map;
})();

(function() {
    "use strict";
    WeakMap.prototype = Object.create(Object.prototype);
    WeakMap.prototype.get = function(key) {
        var res = this.find(key);
        if (res) return res.val;
    };
    WeakMap.prototype.has = function(key) {
        if (this.find(key)) return true; else return false;
    };
    WeakMap.prototype.toString = function() {
        return "[object WeakMap]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(WeakMap.prototype, "get", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(WeakMap.prototype, "has", {
            enumerable: false,
            writable: false
        });
        Object.defineProperty(WeakMap.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function WeakMap(seed) {
        var innerData = [];
        var that = this;
        that.explanation = "This is a Shim polyfil for the concept of a ES6.WeakMap.";
        that.find = function(key) {
            var ret = undefined;
            for (var i = 0; i < innerData.length; i++) {
                if (innerData[i].key === key) {
                    ret = innerData[i];
                    break;
                }
            }
            return ret;
        };
        that.size = function() {
            return innerData.length;
        };
        that.set = function(key, val) {
            var res = this.find(key);
            if (res != undefined) {
                res.val = val;
            } else {
                innerData.push({
                    key: key,
                    val: val
                });
            }
            return;
        };
        that["delete"] = function(key) {
            var i = 0;
            for (i; i < innerData.length; i++) {
                if (innerData[i].key === key) ;
                break;
            }
            innerData.splice(i, 1);
        };
        that.toJSON = function() {
            return innerData;
        };
        if (Object.defineProperties) {
            Object.defineProperty(that, "find", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "size", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "set", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "delete", {
                enumerable: false,
                writable: false
            });
            Object.defineProperty(that, "toJSON", {
                enumerable: false,
                writable: false
            });
        }
        if (!_.isArray(seed)) seed = _.pairs(seed);
        for (var i = 0; i < seed.length; i++) {
            var val = seed[i];
            if (_.isArray(val)) {
                this.set(val[0], val[1]);
            } else {
                for (var prop in val) {
                    this.set(prop, val[prop]);
                }
            }
        }
        return that;
    }
    _.WeakMap = WeakMap;
})();

(function() {
    "use strict";
    Capped.prototype = Object.create(Array.prototype);
    Capped.prototype.toString = function() {
        return "[object Capped]";
    };
    if (Object.defineProperties) {
        Object.defineProperty(Capped.prototype, "toString", {
            enumerable: false,
            writable: false
        });
    }
    function Capped(args, seed) {
        args = args || {};
        _.defaults(args, {
            size: 1e3,
            rotate: true
        });
        var that = this;
        that.push = function() {
            var ms = Array.prototype.slice.call(arguments, 0);
            if (this.length < args.size && args.rotate === false) {
                Array.prototype.push.apply(this, ms);
            } else if (args.rotate == true) {
                Array.prototype.push.apply(this, ms);
            } else {
                return false;
            }
            var toShift = this.length - args.size;
            if (toShift > 0) {
                for (var i = toShift - 1; i >= 0; i--) {
                    this.shift();
                }
            }
            return this;
        };
        if (Object.defineProperties) {
            Object.defineProperty(that, "push", {
                enumerable: false,
                writable: false,
                configurable: false
            });
        }
        if (seed) {
            for (var i = 0; i < seed.length; i++) {
                that.push(seed[i]);
            }
        }
        return that;
    }
    _.Capped = Capped;
})();

(function() {
    "use strict";
    function callback(scope, data, cbs) {
        for (var i = 0; i < cbs.length; i++) {
            setImmediate(function(i) {
                cbs[i].call(scope, data);
            }, i);
        }
    }
    function sanitizeCbs(cbs) {
        if (cbs && {}.toString.call(cbs) !== "[object Array]") {
            cbs = [ cbs ];
        }
        return cbs;
    }
    var Dfd = function(beforeStart, debugMode) {
        this.internalState = 0;
        this.internalWith = this;
        this.internalData = null;
        this.callbacks = {
            done: [],
            fail: [],
            always: [],
            progress: []
        };
        this._pro = null;
        if (beforeStart && {}.toString.call(beforeStart) === "[object Function]") {
            beforeStart.call(this, this);
        }
        if (!debugMode) {
            if (Object.defineProperties) {
                Object.defineProperties(this, {
                    internalState: {
                        enumerable: false,
                        writable: true,
                        configurable: false
                    },
                    internalWith: {
                        enumerable: false,
                        writable: true,
                        configurable: false
                    },
                    internalData: {
                        enumerable: false,
                        writable: true,
                        configurable: false
                    },
                    callbacks: {
                        enumerable: false,
                        writable: false,
                        configurable: false
                    },
                    _pro: {
                        enumerable: false,
                        writable: true,
                        configurable: false
                    }
                });
            }
            if (Object.seal) {
                Object.seal(this);
            }
            if (Object.freeze) {
                Object.freeze(Dfd.prototype);
            }
        }
        return this;
    };
    _.extend(Dfd.prototype, {
        toString: function() {
            return "[object Deferred]";
        },
        Promise: function(dfd, target) {
            this.toString = function() {
                return "[object Promise]";
            };
            this.done = dfd.done.bind(dfd);
            this.fail = dfd.fail.bind(dfd);
            this.progress = dfd.progress.bind(dfd);
            this.always = dfd.always.bind(dfd);
            this.then = dfd.then.bind(dfd);
            this.state = dfd.state.bind(dfd);
            if (target && {}.toString.call(target) === "[object Object]") {
                _.extend(target, this);
                return target;
            }
            return this;
        },
        notify: function(data) {
            if (this.state() == 0) {
                this.internalData = data;
                callback(this.internalWith, this.internalData, this.callbacks.progress);
            }
            return this;
        },
        notifyWith: function(scope, data) {
            if (this.state() == 0) {
                this.internalWith = scope;
                this.internalData = data;
                callback(this.internalWith, this.internalData, this.callbacks.progress);
            }
            return this;
        },
        reject: function(data) {
            if (this.state() == 0) {
                this.internalData = data;
                this.setState(2);
                callback(this.internalWith, this.internalData, this.callbacks.fail.concat(this.callbacks.always));
            }
            return this;
        },
        rejectWith: function(scope, data) {
            if (this.state() == 0) {
                this.internalWith = scope;
                this.internalData = data;
                this.setState(2);
                callback(this.internalWith, this.internalData, this.callbacks.fail.concat(this.callbacks.always));
            }
            return this;
        },
        resolve: function(data) {
            if (this.state() == 0) {
                this.internalData = data;
                this.setState(1);
                callback(this.internalWith, this.internalData, this.callbacks.done.concat(this.callbacks.always));
            }
            return this;
        },
        resolveWith: function(scope, data) {
            if (this.state() == 0) {
                this.internalWith = scope;
                this.internalData = data;
                this.setState(1);
                callback(this.internalWith, this.internalData, this.callbacks.done.concat(this.callbacks.always));
            }
            return this;
        },
        always: function(cbs) {
            cbs = sanitizeCbs(cbs);
            if (cbs.length > 0) {
                if (this.state() !== 0) {
                    callback(this.internalWith, this.internalData, cbs);
                } else {
                    this.callbacks.always = this.callbacks.always.concat(cbs);
                }
            }
            return this.promise();
        },
        done: function(cbs) {
            cbs = sanitizeCbs(cbs);
            if (cbs.length > 0) {
                if (this.state() === 1) {
                    callback(this.internalWith, this.internalData, cbs);
                } else {
                    this.callbacks.done = this.callbacks.done.concat(cbs);
                }
            }
            return this.promise();
        },
        fail: function(cbs) {
            cbs = sanitizeCbs(cbs);
            if (cbs.length > 0) {
                if (this.state() === 2) {
                    callback(this.internalWith, this.internalData, cbs);
                } else {
                    this.callbacks.fail = this.callbacks.fail.concat(cbs);
                }
            }
            return this.promise();
        },
        progress: function(cbs) {
            if (this.state() === 0) {
                cbs = sanitizeCbs(cbs);
                this.callbacks.progress = this.callbacks.progress.concat(cbs);
            }
            return this.promise();
        },
        then: function(doneFilter, failFilter, progressFilter) {
            var newDfd = new Dfd();
            var dF = function(data) {
                if (doneFilter) {
                    data = doneFilter.call(this, data);
                }
                newDfd.resolveWith(this, data);
            };
            this.done(dF);
            var fF = function(data) {
                if (failFilter) {
                    var ret = failFilter.call(this, data);
                }
                newDfd.rejectWith(this, ret);
            };
            this.fail(fF);
            var pF = function(data) {
                if (progressFilter) {
                    var ret = progressFilter.call(this, data);
                }
                newDfd.notifyWith(this, ret);
            };
            this.progress(pF);
            return newDfd.promise();
        },
        when: function() {
            var args = Array.prototype.slice.call(arguments);
            var promises = [];
            var newDfd = new Dfd();
            var resolvedCount = 0;
            var handledCount = 0;
            var whenData = [];
            for (var i = 0; i < args.length; i++) {
                if (_.isArray(args[i])) {
                    promises = promises.concat(args[i]);
                } else {
                    promises.push(args[i]);
                }
            }
            for (var i = 0; i < promises.length; i++) {
                if (promises[i].toString() === "[object Promise]" || promises[i].toString() === "[object Deferred]") {
                    var doneFunc = function(i) {
                        return function(data) {
                            whenData[i] = data;
                            resolvedCount++;
                            handledCount++;
                            if (resolvedCount === promises.length) {
                                newDfd.resolve(whenData);
                            }
                        };
                    }(i);
                    promises[i].done(doneFunc);
                    var failFunc = function(i) {
                        return function(e) {
                            handledCount++;
                            whenData[i] = e;
                            if (handledCount === promises.length) {
                                newDfd.reject(whenData);
                            }
                        };
                    }(i);
                    promises[i].fail(failFunc);
                    promises[i].progress(function(e) {
                        newDfd.notify(e);
                    });
                } else if (promises[i]) {
                    whenData[i] = promises[i];
                    resolvedCount++;
                    handledCount++;
                } else {
                    whenData[i] = promises[i];
                    handledCount++;
                }
            }
            if (resolvedCount === promises.length) {
                newDfd.resolve(whenData);
            } else if (handledCount === promises.length) {
                newDfd.reject(whenData);
            }
            return newDfd.promise();
        },
        promise: function(target) {
            if (!this._pro) {
                this._pro = new this.Promise(this, target);
            }
            return this._pro;
        },
        state: function() {
            return this.internalState;
        },
        setState: function(newState) {
            if (newState == 0 || newState == 1 || newState == 2) {
                this.internalState = newState;
            }
            return this.internalState;
        }
    });
    Dfd.when = Dfd.prototype.when;
    _.Dfd = Dfd;
    _.dfd = new Dfd();
    _.dfd.resolve("Only to be used for WHEN magic!!!!");
    return Dfd;
})();

"use strict";

(function() {
    (function(global, undefined) {
        "use strict";
        var tasks = function() {
            function Task(handler, args) {
                this.handler = handler;
                this.args = args;
            }
            Task.prototype.run = function() {
                if (typeof this.handler === "function") {
                    this.handler.apply(undefined, this.args);
                } else {
                    var scriptSource = "" + this.handler;
                    eval(scriptSource);
                }
            };
            var nextHandle = 1;
            var tasksByHandle = {};
            var currentlyRunningATask = false;
            return {
                addFromSetImmediateArguments: function(args) {
                    var handler = args[0];
                    var argsToHandle = Array.prototype.slice.call(args, 1);
                    var task = new Task(handler, argsToHandle);
                    var thisHandle = nextHandle++;
                    tasksByHandle[thisHandle] = task;
                    return thisHandle;
                },
                runIfPresent: function(handle) {
                    if (!currentlyRunningATask) {
                        var task = tasksByHandle[handle];
                        if (task) {
                            currentlyRunningATask = true;
                            task.run();
                            delete tasksByHandle[handle];
                            currentlyRunningATask = false;
                        }
                    } else {
                        global.setTimeout(function() {
                            tasks.runIfPresent(handle);
                        }, 0);
                    }
                },
                remove: function(handle) {
                    delete tasksByHandle[handle];
                }
            };
        }();
        function canUseNextTick() {
            return typeof process === "object" && Object.prototype.toString.call(process) === "[object process]";
        }
        function canUseMessageChannel() {
            return !!global.MessageChannel;
        }
        function canUsePostMessage() {
            if (!global.postMessage || global.importScripts) {
                return false;
            }
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
        function canUseReadyStateChange() {
            return "document" in global && "onreadystatechange" in global.document.createElement("script");
        }
        function installNextTickImplementation(attachTo) {
            attachTo.setImmediate = function() {
                var handle = tasks.addFromSetImmediateArguments(arguments);
                process.nextTick(function() {
                    tasks.runIfPresent(handle);
                });
                return handle;
            };
        }
        function installMessageChannelImplementation(attachTo) {
            var channel = new global.MessageChannel();
            channel.port1.onmessage = function(event) {
                var handle = event.data;
                tasks.runIfPresent(handle);
            };
            attachTo.setImmediate = function() {
                var handle = tasks.addFromSetImmediateArguments(arguments);
                channel.port2.postMessage(handle);
                return handle;
            };
        }
        function installPostMessageImplementation(attachTo) {
            var MESSAGE_PREFIX = "com.setImmediate" + Math.random();
            function isStringAndStartsWith(string, putativeStart) {
                return typeof string === "string" && string.substring(0, putativeStart.length) === putativeStart;
            }
            function onGlobalMessage(event) {
                if (event.source === global && isStringAndStartsWith(event.data, MESSAGE_PREFIX)) {
                    var handle = event.data.substring(MESSAGE_PREFIX.length);
                    tasks.runIfPresent(handle);
                }
            }
            if (global.addEventListener) {
                global.addEventListener("message", onGlobalMessage, false);
            } else {
                global.attachEvent("onmessage", onGlobalMessage);
            }
            attachTo.setImmediate = function() {
                var handle = tasks.addFromSetImmediateArguments(arguments);
                global.postMessage(MESSAGE_PREFIX + handle, "*");
                return handle;
            };
        }
        function installReadyStateChangeImplementation(attachTo) {
            attachTo.setImmediate = function() {
                var handle = tasks.addFromSetImmediateArguments(arguments);
                var scriptEl = global.document.createElement("script");
                scriptEl.onreadystatechange = function() {
                    tasks.runIfPresent(handle);
                    scriptEl.onreadystatechange = null;
                    scriptEl.parentNode.removeChild(scriptEl);
                    scriptEl = null;
                };
                global.document.documentElement.appendChild(scriptEl);
                return handle;
            };
        }
        function installSetTimeoutImplementation(attachTo) {
            attachTo.setImmediate = function() {
                var handle = tasks.addFromSetImmediateArguments(arguments);
                global.setTimeout(function() {
                    tasks.runIfPresent(handle);
                }, 0);
                return handle;
            };
        }
        if (!global.setImmediate) {
            var attachTo = typeof Object.getPrototypeOf === "function" && "setTimeout" in Object.getPrototypeOf(global) ? Object.getPrototypeOf(global) : global;
            if (typeof global !== "undefined" && global.Jive && global.Jive.Features && global.Jive.Features.RetardMode || (typeof Worker === "undefined" || typeof WebSocket === "undefined")) {
                installSetTimeoutImplementation(attachTo);
            } else {
                if (canUseNextTick()) {
                    installNextTickImplementation(attachTo);
                } else if (canUsePostMessage()) {
                    installPostMessageImplementation(attachTo);
                } else if (canUseMessageChannel()) {
                    installMessageChannelImplementation(attachTo);
                } else if (canUseReadyStateChange()) {
                    installReadyStateChangeImplementation(attachTo);
                } else {
                    installSetTimeoutImplementation(attachTo);
                }
            }
            attachTo.clearImmediate = tasks.remove;
        }
    })(typeof global === "object" && global ? global : this);
    function extend(dest, source) {
        for (var prop in source) {
            dest[prop] = source[prop];
        }
        return dest;
    }
    function callback(scope, data, cbs) {
        cbs = cbs || [];
        for (var i = 0; i < cbs.length; i++) {
            setImmediate(function(i) {
                cbs[i].call(scope, data);
            }, i);
        }
    }
    function sanitizeCbs(cbs) {
        if (cbs && {}.toString.call(cbs) !== "[object Array]") {
            cbs = [ cbs ];
        }
        return cbs;
    }
    var State = function(options) {
        var that = this;
        options = options || {
            initState: "new",
            states: [ "new" ]
        };
        options.sync = options.sync || false;
        this.data = null;
        this.internalState = options.initState;
        this.states = [];
        this.callbacks = {
            all: {
                enter: [],
                leave: [],
                on: []
            }
        };
        this.addStates(options.states);
        this.trigger = function(data, cbs) {
            callback(that, data, cbs);
        };
        if (Object.defineProperties) {
            Object.defineProperties(this, {
                internalState: {
                    enumerable: false,
                    writable: true,
                    configurable: false
                },
                states: {
                    enumerable: false,
                    writable: false,
                    configurable: false
                },
                callbacks: {
                    enumerable: false,
                    writable: false,
                    configurable: false
                }
            });
        }
        if (Object.seal) {
            Object.seal(this);
        }
        if (Object.freeze) {
            Object.freeze(State.prototype);
        }
        return this;
    };
    extend(State.prototype, {
        toString: function() {
            return "[object StateMachine]";
        },
        Promise: function(fsm, target) {
            this.toString = function() {
                return "[object StatePromise]";
            };
            this.on = fsm.done.bind(fsm);
            this.state = fsm.state.bind(fsm);
            this.getStates = fsm.getStates.bind(fsm);
            return this;
        },
        on: function(state, cbs, constraint) {
            constraint = constraint || "on";
            cbs = sanitizeCbs(cbs);
            if (cbs.length > 0) {
                var currentState = this.state();
                this.callbacks[state][constraint] = this.callbacks[state][constraint].concat(cbs);
            }
            return;
        },
        go: function(state, data) {
            data = data || {};
            this.data = data;
            if (state != this.state()) {
                var args = {
                    leavingState: this.state(),
                    enteringState: state,
                    data: data
                };
                var cbs = [];
                cbs = cbs.concat(this.callbacks.all.leave).concat(this.callbacks[this.state()].leave);
                this.trigger(args, cbs);
                cbs = [];
                cbs = cbs.concat(this.callbacks.all.enter).concat(this.callbacks[state].enter);
                this.trigger(args, cbs);
                this.setState(state);
                cbs = [];
                cbs = cbs.concat(this.callbacks.all.on).concat(this.callbacks[state].on);
                this.trigger(args, cbs);
            }
            return;
        },
        addStates: function(states) {
            if (!(states && {}.toString.call(states) === "[object Array]")) {
                states = [ states ];
            }
            states.forEach(function(state) {
                this.states.push(state);
                this.callbacks[state] = this.callbacks[state] || {
                    enter: [],
                    leave: [],
                    on: []
                };
            }, this);
        },
        removeStates: function(states) {
            if (!(states && {}.toString.call(states) === "[object Array]")) {
                states = [ states ];
            }
            var toKill = [];
            for (var i = 0; i < this.states.length; i++) {
                if (this.states[i] in states) {
                    toKill.push(i);
                    delete this.callbacks[this.states[i]];
                }
            }
            toKill.forEach(function(index) {
                this.states.splice(index, 1);
            }, this);
        },
        getStates: function() {
            return this.states;
        },
        state: function() {
            return this.internalState;
        },
        setState: function(newState) {
            if (this.states.indexOf(newState) > -1) {
                this.internalState = newState;
            }
            return this.state();
        },
        promise: function() {
            var pro = new this.Promise(this);
            return pro;
        }
    });
    _.State = State;
    return State;
})();

(function(self) {
    var countdown = function(n, cb) {
        var args = [];
        return function() {
            for (var i = 0; i < arguments.length; ++i) args.push(arguments[i]);
            n -= 1;
            if (n == 0) cb.apply(this, args);
        };
    };
    var FilesystemAPIProvider = function() {
        function makeErrorHandler(dfd, finalDfd) {
            return function(e) {
                if (e.code == 1) {
                    dfd.resolve(undefined);
                } else {
                    if (finalDfd) finalDfd.reject(e); else dfd.reject(e);
                }
            };
        }
        function readDirEntries(reader, result) {
            var dfd = new _.Dfd();
            _readDirEntries(reader, result, dfd);
            return dfd.promise();
        }
        function _readDirEntries(reader, result, dfd) {
            reader.readEntries(function(entries) {
                if (entries.length == 0) {
                    dfd.resolve(result);
                } else {
                    result = result.concat(entries);
                    _readDirEntries(reader, result, dfd);
                }
            }, function(err) {
                dfd.reject(err);
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
            get: function(path, options) {
                var dfd = new _.Dfd();
                path = this._prefix + path;
                this._fs.root.getFile(path, {}, function(fileEntry) {
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                            var data = e.target.result;
                            var err;
                            if (options && options.json) {
                                try {
                                    data = JSON.parse(data);
                                } catch (e) {
                                    err = new Error("unable to parse JSON for " + path);
                                }
                            }
                            if (err) {
                                dfd.reject(err);
                            } else {
                                dfd.resolve(data);
                            }
                        };
                        reader.readAsText(file);
                    }, makeErrorHandler(dfd));
                }, makeErrorHandler(dfd));
                return dfd.promise();
            },
            set: function(path, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                path = this._prefix + path;
                this._fs.root.getFile(path, {
                    create: true
                }, function(fileEntry) {
                    fileEntry.createWriter(function(fileWriter) {
                        var blob;
                        fileWriter.onwriteend = function(e) {
                            fileWriter.onwriteend = function() {
                                dfd.resolve();
                            };
                            fileWriter.truncate(blob.size);
                        };
                        fileWriter.onerror = makeErrorHandler(dfd);
                        blob = new Blob([ data ], {
                            type: "application/json"
                        });
                        fileWriter.write(blob);
                    }, makeErrorHandler(dfd));
                }, makeErrorHandler(dfd));
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                this._fs.root.getDirectory(this._prefix, {
                    create: false
                }, function(entry) {
                    var reader = entry.createReader();
                    readDirEntries(reader, []).then(function(entries) {
                        var listing = [];
                        entries.forEach(function(entry) {
                            if (!entry.isDirectory) {
                                if (options.prefix) {
                                    if (entry.name.indexOf(options.prefix) === 0) {
                                        listing.push(entry.name);
                                    }
                                } else {
                                    listing.push(entry.name);
                                }
                            }
                        });
                        dfd.resolve(listing);
                    });
                }, function(error) {
                    dfd.reject(error);
                });
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var failed = false;
                var ecb = function(err) {
                    failed = true;
                    dfd.reject(err);
                };
                this._fs.root.getDirectory(this._prefix, {}, function(entry) {
                    var reader = entry.createReader();
                    reader.readEntries(function(entries) {
                        var latch = countdown(entries.length, function() {
                            if (!failed) {
                                dfd.resolve();
                            }
                        });
                        entries.forEach(function(entry) {
                            if (entry.isDirectory) {
                                entry.removeRecursively(latch, ecb);
                            } else {
                                if (options.prefix) {
                                    if (entry.name.indexOf(options.prefix) === 0) {
                                        entry.remove(latch, ecb);
                                    }
                                } else {
                                    entry.remove(latch, ecb);
                                }
                            }
                        });
                        if (entries.length == 0) dfd.resolve();
                    }, ecb);
                }, ecb);
                return dfd.promise();
            },
            remove: function(path) {
                var dfd = new _.Dfd();
                var finalDfd = new _.Dfd();
                path = this._prefix + path;
                this._fs.root.getFile(path, {
                    create: false
                }, function(entry) {
                    entry.remove(function() {
                        dfd.done(finalDfd.resolve);
                    }, function(err) {
                        finalDfd.reject(err);
                    });
                }, makeErrorHandler(finalDfd));
                return finalDfd.promise();
            },
            getCapacity: function() {
                return this._capacity;
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                self.requestFileSystem = self.requestFileSystem || self.webkitRequestFileSystem;
                var persistentStorage = navigator.persistentStorage = navigator.persistentStorage || navigator.webkitPersistentStorage;
                var temporaryStorage = navigator.temporaryStorage = navigator.temporaryStorage || navigator.webkitTemporaryStorage;
                self.resolveLocalFileSystemURL = self.resolveLocalFileSystemURL || self.webkitResolveLocalFileSystemURL;
                if (!requestFileSystem) {
                    dfd.reject("No FSAPI");
                    return dfd.promise();
                }
                var prefix = config.name + "/";
                persistentStorage.requestQuota(config.size, function(numBytes) {
                    requestFileSystem(PERSISTENT, numBytes, function(fs) {
                        fs.root.getDirectory(config.name, {
                            create: true
                        }, function() {
                            dfd.resolve(new FSAPI(fs, numBytes, prefix));
                        }, function(err) {
                            dfd.reject(err);
                        });
                    }, function(err) {
                        dfd.reject(err);
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            }
        };
    }();
    var IndexedDBProvider = function() {
        var URL = self.URL || self.webkitURL;
        function IDB(db) {
            this._db = db;
            this.type = "IndexedDB";
            this._supportsBlobs = false;
        }
        IDB.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readonly");
                var get = transaction.objectStore("files").get(docKey);
                get.onsuccess = function(e) {
                    var data = e.target.result;
                    if (options && options.json) {
                        data = JSON.parse(data);
                    }
                    dfd.resolve(data);
                };
                get.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readwrite");
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                var put = transaction.objectStore("files").put(data, docKey);
                put.onsuccess = function(e) {
                    dfd.resolve(e.target.result);
                };
                put.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            remove: function(docKey) {
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readwrite");
                var del = transaction.objectStore("files").delete(docKey);
                put.onsuccess = function(e) {
                    dfd.resolve(e.target.result);
                };
                del.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var transaction = this._db.transaction([ "files" ], "readonly");
                var cursor = transaction.objectStore(store).openCursor();
                var listing = [];
                cursor.onsuccess = function(e) {
                    var cursor = e.target.result;
                    if (cursor) {
                        if (options.prefix) {
                            if (cursor.key.indexOf(options.prefix) === 0) {
                                listing.push(cursor.key);
                            }
                        } else {
                            listing.push(cursor.key);
                        }
                        listing.push(cursor.key);
                        cursor.continue();
                    } else {
                        dfd.resolve(listing);
                    }
                };
                cursor.onerror = function(e) {
                    dfd.reject(e);
                };
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var t = this._db.transaction([ "files" ], "readwrite");
                if (!options.prefix) {
                    var req1 = t.objectStore("files").clear();
                    req1.onsuccess = function(e) {
                        dfd.resolve(e.target.result);
                    };
                    req1.onerror = function(e) {
                        dfd.reject(e);
                    };
                } else {
                    var scope = this;
                    this.list(options).done(function(listing) {
                        var dfds = [ true ];
                        listing.forEach(function(item) {
                            dfds.push(scope.remove(item));
                        });
                        _.Dfd.when(dfds).done(function(ret) {
                            dfd.resolve(ret);
                        }).fail(function(e) {
                            dfd.reject(e);
                        });
                    }).fail(function(e) {
                        dfd.reject(e);
                    });
                }
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                var indexedDB = self.indexedDB || self.webkitIndexedDB || self.mozIndexedDB || self.OIndexedDB || self.msIndexedDB, IDBTransaction = self.IDBTransaction || self.webkitIDBTransaction || self.OIDBTransaction || self.msIDBTransaction, dbVersion = 2;
                if (!indexedDB || !IDBTransaction) {
                    dfd.reject("No IndexedDB");
                    return dfd.promise();
                }
                var request = indexedDB.open(config.name, dbVersion);
                function createObjectStore(db) {
                    db.createObjectStore("files");
                }
                request.onerror = function(event) {
                    dfd.reject(event);
                };
                request.onsuccess = function(event) {
                    var db = request.result;
                    db.onerror = function(event) {
                        console.log(event);
                    };
                    if (db.setVersion) {
                        if (db.version != dbVersion) {
                            var setVersion = db.setVersion(dbVersion);
                            setVersion.onsuccess = function() {
                                createObjectStore(db);
                                dfd.resolve();
                            };
                        } else {
                            dfd.resolve(new IDB(db));
                        }
                    } else {
                        dfd.resolve(new IDB(db));
                    }
                };
                request.onupgradeneeded = function(event) {
                    createObjectStore(event.target.result);
                };
                return dfd.promise();
            }
        };
    }();
    var WebSQLProvider = function() {
        var URL = self.URL || self.webkitURL;
        function WSQL(db) {
            this._db = db;
            this.type = "WebSQL";
        }
        WSQL.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                this._db.transaction(function(tx) {
                    tx.executeSql("SELECT value FROM files WHERE fname = ?", [ docKey ], function(tx, res) {
                        if (res.rows.length == 0) {
                            dfd.resolve(undefined);
                        } else {
                            var data = res.rows.item(0).value;
                            if (options && options.json) {
                                data = JSON.parse(data);
                            }
                            dfd.resolve(data);
                        }
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                this._db.transaction(function(tx) {
                    tx.executeSql("INSERT OR REPLACE INTO files (fname, value) VALUES(?, ?)", [ docKey, data ]);
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve();
                });
                return dfd.promise();
            },
            remove: function(docKey) {
                var dfd = new _.Dfd();
                this._db.transaction(function(tx) {
                    tx.executeSql("DELETE FROM files WHERE fname = ?", [ docKey ]);
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve();
                });
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var select = "SELECT fname FROM files";
                var vals = [];
                if (options.prefix) {
                    select += " WHERE fname LIKE ?";
                    vals = [ options.prefix + "%" ];
                }
                this._db.transaction(function(tx) {
                    tx.executeSql(select, vals, function(tx, res) {
                        var listing = [];
                        for (var i = 0; i < res.rows.length; ++i) {
                            listing.push(res.rows.item(i)["fname"]);
                        }
                        dfd.resolve(listing);
                    }, function(err) {
                        dfd.reject(err);
                    });
                });
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var dfd = new _.Dfd();
                var query = "DELETE FROM files";
                var vals = [];
                if (options.prefix) {
                    query += " WHERE fname LIKE ?";
                    vals = [ options.prefix + "%" ];
                }
                this._db.transaction(function(tx) {
                    tx.executeSql(query, vals, function() {
                        dfd.resolve();
                    });
                }, function(err) {
                    dfd.reject(err);
                });
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var openDb = self.openDatabase;
                var dfd = new _.Dfd();
                if (!openDb) {
                    dfd.reject("No WebSQL");
                    return dfd.promise();
                }
                var db = openDb(config.name, "1.0", "large local storage", config.size);
                db.transaction(function(tx) {
                    tx.executeSql("CREATE TABLE IF NOT EXISTS files (fname unique, value)");
                }, function(err) {
                    dfd.reject(err);
                }, function() {
                    dfd.resolve(new WSQL(db));
                });
                return dfd.promise();
            }
        };
    }();
    var LocalStorageProvider = function() {
        function LS(options) {
            if (!options.type) {
                options.type = "LocalStorage";
            }
            this.type = options.type;
            if (this.type === "SessionStorage") {
                this.store = sessionStorage;
            } else {
                this.store = localStorage;
            }
            this._prefix = options.name + ":";
        }
        LS.prototype = {
            get: function(docKey, options) {
                var dfd = new _.Dfd();
                var data = this.store.getItem(this._prefix + docKey);
                if (options && options.json) {
                    data = JSON.parse(data);
                }
                dfd.resolve(data);
                return dfd.promise();
            },
            set: function(docKey, data, options) {
                var dfd = new _.Dfd();
                if (options && options.json) {
                    data = JSON.stringify(data);
                }
                this.store.setItem(this._prefix + docKey, data);
                dfd.resolve();
                return dfd.promise();
            },
            remove: function(docKey, options) {
                var dfd = new _.Dfd();
                this.store.removeItem(this._prefix + docKey);
                dfd.resolve();
                return dfd.promise();
            },
            list: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var listing = Object.keys(this.store);
                var ret = [];
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                listing.forEach(function(item) {
                    if (item.indexOf(prefix) === 0) {
                        ret.push(item.substr(that._prefix.length - 1));
                    }
                });
                dfd.resolve(ret);
                return dfd.promise();
            },
            clear: function(options) {
                options = options || {};
                var that = this;
                var dfd = new _.Dfd();
                var listing = Object.keys(this.store);
                var prefix = this._prefix;
                if (options.prefix) {
                    prefix += options.prefix;
                }
                listing.forEach(function(item) {
                    if (item.indexOf(prefix) === 0) {
                        that.store.removeItem(item);
                    }
                });
                dfd.resolve();
                return dfd.promise();
            }
        };
        return {
            init: function(config) {
                var dfd = new _.Dfd();
                dfd.resolve(new LS(config));
                return dfd.promise();
            }
        };
    }();
    var LargeLocalStorage = function() {
        var providers = {
            FileSystemAPI: FilesystemAPIProvider,
            IndexedDB: IndexedDBProvider,
            WebSQL: WebSQLProvider,
            LocalStorage: LocalStorageProvider,
            SessionStorage: LocalStorageProvider
        };
        var defaultConfig = {
            size: 10 * 1024 * 1024,
            name: "lls"
        };
        function selectImplementation(config) {
            if (!config) config = {};
            config = _.defaults(config, defaultConfig);
            if (config.forceProvider) {
                return providers[config.forceProvider].init(config);
            }
            var dfd = new _.Dfd();
            LocalStorageProvider.init(config).done(function(ret) {
                dfd.resolve(ret);
            }).fail(function() {
                IndexedDBProvider.init(config).done(function(ret) {
                    dfd.resolve(ret);
                }).fail(function() {
                    FilesystemAPIProvider.init(config).done(function(ret) {
                        dfd.resolve(ret);
                    }).fail(function() {
                        WebSQLProvider.init(config).done(function(ret) {
                            dfd.resolve(ret);
                        }).fail(function() {
                            dfd.reject("I have nothing.... leave me alone :(");
                        });
                    });
                });
            });
            return dfd.promise();
        }
        function LargeLocalStorage(config) {
            var scope = this;
            var dfd = new _.Dfd();
            selectImplementation(config).done(function(impl) {
                scope._impl = impl;
                dfd.resolve(scope);
            }).fail(function(e) {
                dfd.reject("No storage provider found");
            });
            scope.initialized = dfd.promise();
            return scope;
        }
        LargeLocalStorage.prototype = {
            ready: function() {
                return this.initialized;
            },
            list: function(docKey) {
                this._checkAvailability();
                return this._impl.list(docKey);
            },
            remove: function(docKey) {
                this._checkAvailability();
                return this._impl.remove(docKey);
            },
            clear: function() {
                this._checkAvailability();
                return this._impl.clear();
            },
            get: function(docKey, options) {
                this._checkAvailability();
                return this._impl.get(docKey, options);
            },
            set: function(docKey, data, options) {
                this._checkAvailability();
                return this._impl.set(docKey, data, options);
            },
            getCapacity: function() {
                this._checkAvailability();
                if (this._impl.getCapacity) return this._impl.getCapacity(); else return -1;
            },
            _checkAvailability: function() {
                if (!this._impl) {
                    throw {
                        msg: "No storage implementation is available yet.  The user most likely has not granted you app access to FileSystemAPI or IndexedDB",
                        code: "NO_IMPLEMENTATION"
                    };
                }
            }
        };
        return LargeLocalStorage;
    }();
    _.LargeLocalStorage = LargeLocalStorage;
    return LargeLocalStorage;
})(typeof self !== "undefined" ? self : this);

(function() {
    "use strict";
    var urns = {};
    var collections = {};
    var isCollection = function(urn) {
        if (!urn.match(/\:[*#]$/)) {
            return true;
        } else {
            return false;
        }
    };
    var findModel = function(urn) {
        for (var key in urns) {
            if (urns[key].regex.exec(urn)) {
                return urns[key].model;
            }
        }
    };
    var findCollection = function(urn) {
        for (var key in collections) {
            if (collections[key].regex.exec(urn)) {
                return collections[key].collection;
            }
        }
    };
    var makeForModelDeferDfds = {};
    var getDeffered = function(urn) {
        if (makeForModelDeferDfds[urn]) {
            return makeForModelDeferDfds[urn];
        } else {
            for (var key in makeForModelDeferDfds) {
                if (makeForModelDeferDfds[key].regex.exec(urn)) {
                    return makeForModelDeferDfds[key];
                }
            }
        }
    };
    var makeAndGet = function(args, model, collection, dfd, given) {
        var instance = new model(args);
        if (!given) {
            instance.get().done(function() {
                dfd.resolve(instance);
            }).fail(function(e) {
                dfd.reject(e);
            });
        } else {
            collection.insert({
                entry: instance
            });
            dfd.resolve(instance);
        }
    };
    var makeForModel = function(args, given) {
        var dfd = new _.Dfd();
        var collection = findCollection(args.urn);
        var model = findModel(args.urn);
        var instance;
        if (collection) {
            instance = collection.queryOne({
                filter: {
                    urn: args.urn
                }
            });
            if (typeof instance !== "undefined") {
                dfd.resolve(instance);
            } else {
                var alreadyWaiting = getDeffered(args.urn);
                if (alreadyWaiting) {
                    alreadyWaiting.promise.done(function() {
                        instance = collection.queryOne({
                            filter: {
                                urn: args.urn
                            }
                        });
                        if (instance) {
                            dfd.resolve(instance);
                        } else {
                            makeAndGet(args, model, collection, dfd, given);
                        }
                    });
                } else {
                    makeAndGet(args, model, collection, dfd, given);
                }
            }
        } else if (model) {
            makeAndGet(args, model, dfd, given);
        } else {
            dfd.reject("Couldn't find a model registered for " + args.urn);
        }
        return dfd.promise();
    };
    var populateRefs = function(scope, args) {
        args = args || {};
        var dfd = new _.Dfd();
        var dfds = [ true ];
        for (var key in scope._options.refs) {
            (function(key) {
                var ref = scope._options.refs[key];
                if (_.isArray(ref)) {
                    scope[key].forEach(function(item, i) {
                        if (_.isNormalObject(item) && _.isUrn(item.urn) && !(scope[key] instanceof Model)) {
                            dfds.push(makeForModel(item, true).done(function(ret) {
                                scope[key][i] = ret;
                            }));
                        } else if (_.isUrn(item)) {
                            dfds.push(makeForModel({
                                urn: item
                            }).done(function(ret) {
                                scope[key][i] = ret;
                            }));
                        }
                    });
                } else {
                    if (_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn) && !(scope[key] instanceof Model)) {
                        dfds.push(makeForModel(scope[key], true).done(function(ret) {
                            scope[key] = ret;
                        }));
                    } else if (_.isUrn(scope[key])) {
                        dfds.push(makeForModel({
                            urn: scope[key]
                        }).done(function(ret) {
                            scope[key] = ret;
                        }));
                    }
                }
            })(key);
        }
        _.Dfd.when(dfds).always(function() {
            dfd.resolve(scope);
        });
        return dfd.promise();
    };
    var store = function(args, scope) {
        var dfd = new _.Dfd();
        scope = scope || this;
        args.data = args.data || {};
        if (typeof args.remote === "undefined") {
            args.remote = true;
        }
        args.method = args.method.toUpperCase();
        if (scope._options.collection === true) {
            args.urn = args.urn || scope._options.urn;
        }
        if (typeof args === "undefined" || !args.method || !args.urn) {
            dfd.reject("Must Supply args object with method, url, and data");
            return dfd.promise();
        }
        if (scope._options.store.remote && args.remote) {
            if (args.method === "GET" && scope._options.store.localStorage && (true || scope._options._ttl && new Date().getTime() > scope._options._ttl)) {
                local(args, scope).done(function(ret) {
                    dfd.resolve({
                        data: ret,
                        headers: {},
                        status: 200,
                        local: true
                    });
                }).fail(function(e) {
                    dfd.reject(e);
                });
                if (args.method === "GET") {
                    makeForModelDeferDfds[scope.urn] = {
                        promise: dfd.promise(),
                        regex: new RegExp(scope.urn)
                    };
                }
            } else {
                if (args.method === "GET" && scope._options.collection === true) {
                    makeForModelDeferDfds[scope._options.urn] = {
                        promise: dfd.promise(),
                        regex: collections[scope._options.name].regex
                    };
                }
                ajax(args, scope).done(function(ret) {
                    dfd.resolve(ret);
                }).fail(function(e) {
                    dfd.reject(e);
                });
            }
        } else if (scope._options.store.localStorage) {
            local(args, scope).done(function(ret) {
                dfd.resolve(ret);
            }).fail(function(e) {
                dfd.reject(e);
            });
        }
        return dfd.promise();
    };
    var local = function(args, scope) {
        var urn = args.urn;
        if (scope._options.collection === true) {
            var urnArray = scope._options.store.localStorage.split(":");
            urnArray.splice(-1);
            urn = urnArray.join(":");
        }
        switch (args.method) {
          case "GET":
            return self.Jive.Store.get(urn, {
                json: true
            });
            break;

          case "POST":
            return self.Jive.Store.set(urn, args.data, {
                json: true
            });
            break;

          case "PUT":
            return self.Jive.Store.set(urn, args.data, {
                json: true
            });
            break;

          case "PATCH":
            var dfd = new _.Dfd();
            var xhr = self.Jive.Store.get(urn, {
                json: true
            });
            xhr.done(function(ret) {
                _.extend(ret, args.data);
                self.Jive.Store.set(urn, ret, {
                    json: true
                }).done(function(ret) {
                    dfd.resolve(ret);
                }).fail(function(e) {
                    dfd.reject(e);
                });
            }).fail(function(e) {
                dfd.reject(e);
            });
            return dfd.promise();
            break;

          case "DELETE":
            return self.Jive.Store.remove(urn);
            break;

          case "HEAD":
            var dfd = new _.Dfd();
            var xhr = self.Jive.Store.get(urn, {
                json: true
            });
            xhr.done(function(ret) {
                dfd.resolve({
                    lastModified: ret.lastModified,
                    eTag: ret.eTag,
                    ttl: ret.ttl,
                    expires: ret.expires
                });
            }).fail(function(e) {
                dfd.reject(e);
            });
            return dfd.promise();
            break;

          case "OPTIONS":
          default:
            var dfd = new _.Dfd();
            dfd.resolve();
            return dfd.promise();
            break;
        }
    };
    var rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm;
    var parseHeaders = function(headers) {
        var responseHeaders = {};
        var match;
        while (match = rheaders.exec(headers)) {
            responseHeaders[match[1].toLowerCase()] = match[2];
        }
        return responseHeaders;
    };
    var ajax = function(args, scope) {
        scope = scope || this;
        var dfd = new _.Dfd();
        var data = args.data || {};
        var urn = args.urn;
        if ((args.method == "POST" || args.method == "PUT" || args.method == "PATCH") && args.data) {
            data = JSON.stringify(data);
        } else if ((args.method == "GET" || args.method == "DELETE") && args.data) {
            urn += "?" + $.param(data);
        }
        var remote = scope._options.store.remote.replace(/\/$/g, "");
        $.ajax({
            url: remote + "/" + urn,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
            },
            type: args.method,
            data: data,
            dataType: "json"
        }).done(function(data, status, jqXhr) {
            dfd.resolve({
                data: data,
                status: jqXhr.status,
                headers: parseHeaders(jqXhr.getAllResponseHeaders())
            });
        }).fail(function(jqXhr, status, error) {
            dfd.reject({
                e: error,
                status: jqXhr.status,
                headers: parseHeaders(jqXhr.getAllResponseHeaders())
            });
        });
        return dfd.promise();
    };
    var insertFunc = function(args, scope) {
        scope = scope || this;
        args = args || {};
        if (args.entry) {
            var index = scope.entries.indexOf(args.entry.urn);
            if (index !== -1) {
                scope.entries[index] = args.entry;
            } else {
                scope.entries.push(args.entry);
            }
            store({
                method: "POST",
                urn: args.entry.urn,
                data: args.entry._options.persisted,
                remote: false
            }, args.entry);
            scope._options.persisted = scope.toJSON();
            store({
                method: "POST",
                urn: scope.urn,
                data: scope._options.persisted,
                remote: false
            }, scope);
        }
    };
    var postFunc = function(event, ret, scope) {
        scope = scope || this;
        for (var key in ret) {
            scope[key] = ret[key];
        }
        scope._options.persisted = scope.toJSON();
        scope.dispatch({
            event: event,
            data: ret
        });
    };
    var deleteFunc = function(ret, scope) {
        scope = scope || this;
        for (var key in scope) {
            delete scope[key];
        }
        scope._options.subs.forEach(function(sub) {
            scope.off({
                sub: sub
            });
        });
        scope.dispatch({
            event: "deleted",
            data: args
        });
    };
    var doInitializeDefault = function(scope, key) {
        if (_.isFunction(scope._options.keys[key].default)) {
            scope[key] = scope._options.keys[key].default();
        } else {
            switch (scope._options.keys[key].type.toLowerCase()) {
              case "object":
                scope[key] = scope._options.keys[key].default || {};
                break;

              case "array":
                scope[key] = scope._options.keys[key].default || [];
                break;

              case "boolean":
                scope[key] = scope._options.keys[key].default || false;
                break;

              case "string":
                scope[key] = scope._options.keys[key].default || "";
                break;

              case "number":
                scope[key] = scope._options.keys[key].default || NaN;
                break;

              case "date":
                scope[key] = scope._options.keys[key].default || 0;
                break;

              case "regex":
                scope[key] = scope._options.keys[key].default || new Regex();
                break;
            }
        }
    };
    var initializeForInForNotOptimized = function(args, scope) {
        for (var key in scope._options.refs) {
            if (_.isArray(scope._options.refs[key])) {
                scope[key] = scope[key] || [];
            } else {
                scope[key] = scope[key] || null;
            }
        }
        for (var key in scope._options.keys) {
            doInitializeDefault(scope, key);
        }
        for (var key in args) {
            scope[key] = args[key];
        }
    };
    var initialize = function(args, scope) {
        scope = scope || this;
        args = args || {};
        if (scope._options.collection === true) {
            collections[scope._options.name] = {
                regex: _.createRegex({
                    urn: scope._options.urn + ":*"
                }),
                collection: scope
            };
            scope.urn = scope._options.rootUrn || scope.urn || scope._options.urn;
            scope.insert = insertFunc.bind(scope);
        }
        initializeForInForNotOptimized(args, scope);
        populateRefs(scope);
        scope._options.subs = [];
        if (typeof self !== "undefined" && self.Jive && self.Jive.Jazz) {
            scope._options.pubsub = self.Jive.Jazz;
        } else {
            scope._options.pubsub = new _.Fabric();
        }
        scope._options.postFunc = postFunc.bind(scope, "posted");
        scope._options.putFunc = postFunc.bind(scope, "putted");
        scope._options.patchFunc = postFunc.bind(scope, "patched");
        scope._options.deleteFunc = deleteFunc.bind(scope);
        scope._options.persisted = scope.toJSON();
        scope.on({
            event: "post"
        }).progress(function(ret) {
            console.log("WTF is ret in POST?", ret);
            scope._options.postFunc;
        });
        scope.on({
            event: "put"
        }).progress(function(ret) {
            console.log("WTF is ret in PUT?", ret);
            scope._options.putFunc;
        });
        scope.on({
            event: "patch"
        }).progress(function(ret) {
            console.log("WTF is ret in PATCH?", ret);
            scope._options.patchFunc;
        });
        scope.on({
            event: "delete"
        }).progress(function(ret) {
            console.log("WTF is ret in DELETE?", ret);
            scope._options.deleteFunc();
        });
    };
    var Model = function(data, options) {
        var scope = this;
        data = data || {};
        options = options || {};
        scope._options = {
            _excludes: {
                _options: true
            }
        };
        scope.initialize(data);
        return scope;
    };
    Model.prototype = Object.create(Object.prototype);
    Model.prototype.initialize = function(args, scope) {
        scope = scope || this;
        args = args || {};
    };
    Model.prototype.get = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        if (args.force || !scope._options.ttl || scope._options.ttl && new Date().getTime() > scope._options.ttl) {
            var xhr = store({
                method: "GET",
                urn: scope.urn,
                data: args
            }, scope).done(function(ret) {
                if (_.isNormalObject(ret.data)) {
                    if (scope._options.collection === true) {
                        scope.entries = scope.entries || [];
                        for (var i = 0; i < ret.data.entries.length; i++) {
                            if (_.isNormalObject(ret.data.entries[i]) && _.isUrn(ret.data.entries[i].urn)) {
                                var model = findModel(ret.data.entries[i].urn);
                                if (model) {
                                    var instance = new model(ret.data.entries[i]);
                                    setImmediate(function(instance) {
                                        store({
                                            method: "POST",
                                            urn: instance.urn,
                                            data: instance.toJSON(),
                                            remote: false
                                        }, instance);
                                    }, instance);
                                    scope.entries.push(instance);
                                }
                            } else {
                                scope.entries.push(ret.data.entries[i]);
                            }
                        }
                    } else {
                        for (var key in ret.data) {
                            scope[key] = ret.data[key];
                        }
                        var collection = findCollection(scope.urn);
                        if (collection) {
                            var entry = collection.queryOne({
                                filter: {
                                    urn: scope.urn
                                }
                            });
                            if (entry) {
                                var index = collection.entries.indexOf(entry);
                                collection.entries[index] = scope;
                            } else {
                                var index = collection.entries.indexOf(scope.urn);
                                if (index !== -1) {
                                    collection.entries[index] = scope;
                                } else {
                                    collection.entries.push(scope);
                                }
                            }
                        }
                    }
                    scope._options.persisted = scope.toJSON();
                    if (ret.headers["cache-control"] !== "no-cache" && ret.headers["expires"]) {
                        scope._options.ttl = new Date(ret.headers["expires"]).getTime();
                        scope._options.lastModified = new Date(ret.headers["last-modified"]).getTime();
                    } else {
                        scope._options.ttl = Date.now();
                    }
                    scope.dispatch({
                        event: "gotted",
                        data: scope
                    });
                    setImmediate(function() {
                        store({
                            method: "POST",
                            urn: scope.urn,
                            data: scope._options.persisted,
                            remote: false
                        }, scope);
                    });
                    populateRefs(scope, {
                        local: ret.local
                    }).done(function(ret) {
                        dfd.resolve(scope);
                    });
                } else {
                    dfd.reject("Ret was noooo good.");
                }
            }).fail(function(ret) {
                dfd.reject(ret.error);
            });
        } else {
            dfd.resolve(scope);
        }
        return dfd.promise();
    };
    Model.prototype.post = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return store({
            method: "POST",
            urn: scope.urn,
            data: args
        }, scope).done(scope._options.postFunc);
    };
    Model.prototype.put = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "PUT",
            urn: scope.urn,
            data: args
        }, scope).done(scope._options.putFunc);
    };
    Model.prototype.patch = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "PATCH",
            urn: scope.urn,
            data: args
        }, scope).done(scope._options.patchFunc);
    };
    Model.prototype["delete"] = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "DELETE",
            urn: scope.urn,
            data: args
        }, scope).done(scope._options.deleteFunc);
    };
    Model.prototype.options = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "OPTIONS",
            urn: scope.urn,
            data: args
        }, scope).done(function(ret) {
            for (var key in args) {
                scope._options[key] = args[key];
            }
            dfd.resolve(scope);
        });
    };
    Model.prototype.head = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var dfd = new _.Dfd();
        return store({
            method: "HEAD",
            urn: scope.urn,
            data: args
        }, scope).done(function(ret) {
            dfd.resolve(ret.headers);
        });
    };
    var subSelectRecurse = function(ret, keys) {
        var key = keys.shift();
        if (keys.length === 0) {
            return ret[key];
        } else {
            return subSelectRecurse(ret[key], keys);
        }
    };
    var subSelect = function(entry, key) {
        var keys = key.split(".");
        return subSelectRecurse(entry, keys);
    };
    var walkObjectRecurse = function(obj, keys, val) {
        var key = keys.shift();
        if (keys.length === 0) {
            obj[key] = val;
            return obj;
        } else {
            obj[key] = obj[key] || {};
            return walkObjectRecurse(obj[key], keys, val);
        }
    };
    var walkObject = function(obj, key, val) {
        var keys = key.split(".");
        return walkObjectRecurse(obj, keys, val);
    };
    var createFromLazyObject = function(obj, lazyObj) {
        if (typeof lazyObj === undefined) {
            lazyObj = obj;
            obj = {};
        }
        var ret = obj;
        for (var key in lazyObj) {
            var keys = key.split(".");
            for (var i = 0; i < keys.length - 1; i++) {
                obj[keys[i]] = obj[keys[i]] || {};
                obj = obj[keys[i]];
            }
            obj[keys[i]] = lazyObj[key];
        }
        return ret;
    };
    var runFilter = function(filter, value) {
        if (_.isRegExp(filter)) {
            if (!filter.test(value)) {
                return false;
            }
        } else if (filter !== value) {
            return false;
        }
        return true;
    };
    var filterCheckTheBastard = function(entry, filter) {
        for (var key in filter) {
            var length;
            switch (key) {
              case "$nin":
                length = 1;

              case "$in":
                length = length || 0;
                for (var valKey in filter[key]) {
                    var val = subSelect(entry, valKey);
                    if (_.isArray(val)) {
                        var intersection = _.intersection(val, filter[key][valKey]);
                        if (intersection.length === length) {
                            return false;
                        }
                    }
                }
                break;

              default:
                var val = subSelect(entry, key);
                if (!runFilter(filter[key], val)) {
                    return false;
                }
                break;
            }
        }
        return true;
    };
    var sortTheBastard = function(ret, order) {
        ret = ret || [];
        var keys = Object.keys(order).reverse();
        keys.forEach(function(key) {
            ret = ret.sort(function(a, b) {
                var aVal = subSelect(a, key);
                var bVal = subSelect(b, key);
                if (order[key] !== "desc") {
                    return aVal === bVal ? 0 : aVal < bVal ? -1 : 1;
                } else {
                    return aVal === bVal ? 0 : aVal > bVal ? -1 : 1;
                }
            });
        });
        return ret;
    };
    var subSelectTheBastard = function(entry, selects) {
        var ret = {};
        selects.forEach(function(select) {
            var sub = subSelect(entry, select);
            if (typeof sub !== "undefined") {
                var lazyObj = {};
                lazyObj[select] = sub;
                createFromLazyObject(ret, lazyObj);
            }
        });
        return ret;
    };
    Model.prototype.query = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.key = args.key || "entries";
        var ret = [];
        for (var i = 0; i < scope[args.key].length; i++) {
            var entry = scope[args.key][i];
            if (ret.length === args.limit + (args.offset || 0)) {
                break;
            }
            if (typeof args.filter === "undefined" || args.filter && filterCheckTheBastard(entry, args.filter)) {
                var toPush = entry;
                if (args.vm) {
                    toPush = entry.toVM(args);
                } else if (args.select) {
                    toPush = subSelectTheBastard(entry, args.select);
                }
                ret.push(toPush);
            }
        }
        if (args.order) {
            sortTheBastard(ret, args.order);
        }
        if (args.offset) {
            ret.splice(0, args.offset);
        }
        if (args.limit === 1) {
            ret = ret[0];
        }
        return ret;
    };
    Model.prototype.queryOne = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.limit = 1;
        return scope.query(args, scope);
    };
    Model.prototype.dispatch = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var urn = scope.urn + ":";
        if (args.entries) {
            urn += "*:";
        }
        urn += args.event;
        var sub = scope._options.pubsub.publish({
            urn: urn,
            data: args.data
        });
    };
    Model.prototype.on = function(args, scope) {
        scope = scope || this;
        args = args || {};
        var urn;
        if (scope._options.collection === true) {
            urn = scope._options.urn + ":";
        } else {
            urn = scope.urn + ":";
        }
        if (args.entries) {
            urn += "*:";
        }
        urn += args.event;
        var sub = scope._options.pubsub.subscribe({
            urn: urn
        });
        scope._options.subs.push(sub);
        return sub;
    };
    Model.prototype.off = function(args, scope) {
        scope = scope || this;
        args = args || {};
        if (typeof args.sub !== "undefined" && typeof args.sub.id !== "undefined") {
            scope._options.pubsub.unsubscribe({
                id: args.sub.id
            });
            scope._options.subs = _.without(scope._options.subs, sub);
            return true;
        } else {
            return false;
        }
    };
    Model.prototype.validate = function(args, scope) {
        scope = scope || this;
        args = args || {};
    };
    Model.prototype.changes = function(args, scope) {
        scope = scope || this;
        args = args || {};
        return scope._options.changes;
    };
    Model.prototype.changed = function(args, scope) {
        scope = scope || this;
        args = args || {};
        scope._options.changes = _.dirtyKeys(scope._options.persisted, scope.toJSON());
        scope.dispatch({
            event: "changed",
            data: scope._options.changes
        });
    };
    Model.prototype.set = function(args, scope) {
        scope = scope || this;
        args = args || {};
        if (typeof args.val !== "undefined") {
            scope[args.key] = args.val;
        }
        scope._options.changes = scope._options.changes || {};
        scope._options.changes[args.key] = {
            aVal: scope._options.persisted[args.key],
            bVal: scope[args.val]
        };
        scope.dispatch({
            event: "setted",
            data: args
        });
        scope.dispatch({
            event: "changed",
            data: scope._options.changes
        });
    };
    Model.prototype.toJSON = Model.prototype.valueOf = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.excludes = args.excludes || {};
        var excludes = {};
        _.extend(excludes, scope._options.excludes, args.excludes);
        var temp = {};
        var keys = Object.keys(scope);
        for (var i = 0; i < keys.length; i++) {
            if (!excludes[keys[i]]) {
                temp[keys[i]] = scope[keys[i]];
            }
        }
        for (var key in scope._options.refs) {
            if (_.isNormalObject(scope[key]) && _.isUrn(scope[key].urn)) {
                temp[key] = scope[key].urn;
            } else if (_.isArray(scope[key])) {
                temp[key] = [];
                scope[key].forEach(function(entry, i) {
                    if (_.isNormalObject(scope[key][i]) && _.isUrn(scope[key][i].urn)) {
                        temp[key][i] = scope[key][i].urn;
                    } else {
                        temp[key][i] = scope[key][i];
                    }
                });
            } else {
                temp[key] = scope[key];
            }
        }
        return temp;
    };
    Model.prototype.toVM = function(args, scope) {
        scope = scope || this;
        args = args || {};
        args.vm = args.vm || "default";
        args.alreadyToVmed = args.alreadyToVmed || {};
        var ret = {};
        var keys = scope._options.vms[args.vm];
        if (keys === "*" || typeof keys === "undefined") {
            keys = Object.keys(scope);
        }
        if (scope._options.collection === true) {
            ret.entries = [];
            scope.entries.forEach(function(entry) {
                var vmed;
                if (typeof args.alreadyToVmed[entry.urn] === "undefined") {
                    args.alreadyToVmed[entry.urn] = {
                        urn: entry.urn
                    };
                    vmed = entry.toVM(args);
                    for (var vmedKey in vmed) {
                        args.alreadyToVmed[entry.urn][vmedKey] = vmed[vmedKey];
                    }
                } else {
                    vmed = args.alreadyToVmed[entry.urn];
                }
                ret.entries.push(vmed);
            });
        } else {
            args.alreadyToVmed[scope.urn] = ret;
            keys.forEach(function(key) {
                if (scope._options.refs[key]) {
                    if (_.isArray(scope._options.refs[key])) {
                        ret[key] = [];
                        scope[key].forEach(function(entry) {
                            var vmed;
                            if (typeof args.alreadyToVmed[entry.urn] === "undefined") {
                                args.alreadyToVmed[entry.urn] = {
                                    urn: entry.urn
                                };
                                vmed = entry.toVM(args);
                                for (var vmedKey in vmed) {
                                    args.alreadyToVmed[entry.urn][vmedKey] = vmed[vmedKey];
                                }
                            } else {
                                vmed = args.alreadyToVmed[entry.urn];
                            }
                            ret[key].push(vmed);
                        });
                    } else {
                        var vmed;
                        if (typeof args.alreadyToVmed[scope[key].urn] === "undefined") {
                            args.alreadyToVmed[scope[key].urn] = {
                                urn: scope[key].urn
                            };
                            vmed = scope[key].toVM(args);
                            for (var vmedKey in vmed) {
                                args.alreadyToVmed[scope[key].urn][vmedKey] = vmed[vmedKey];
                            }
                        } else {
                            vmed = args.alreadyToVmed[scope[key].urn];
                        }
                        ret[key] = vmed;
                    }
                } else {
                    var sub = subSelect(scope, key);
                    walkObject(ret, key, sub);
                }
            });
        }
        return ret;
    };
    _.updateProp(Model.prototype, {
        name: "get",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "post",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "put",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "patch",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "delete",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "options",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "head",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "query",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "queryOne",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "dispatch",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "on",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "off",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "validate",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "changes",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "changed",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "set",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "toJSON",
        attrs: {
            enumerable: false
        }
    });
    _.updateProp(Model.prototype, {
        name: "toVM",
        attrs: {
            enumerable: false
        }
    });
    var parseSchema = function(schema, model) {
        model._options.urn = schema.urn;
        model._options.rootUrn = schema.rootUrn;
        model._options.name = schema.name;
        urns[model._options.urn] = {
            regex: _.createRegex({
                urn: model._options.urn
            }),
            model: model
        };
        model._options.collection = isCollection(model._options.urn);
        if (typeof schema.store === "undefined") {
            if (typeof window !== "undefined") {
                if (document.localStorage) {
                    model._options.store = {
                        localStorage: "Jive:Data"
                    };
                } else {
                    model._options.store = {
                        memory: "Jive.Data"
                    };
                }
            } else {
                model._options.store = {
                    mongo: "mongoConnectionUrl"
                };
            }
        } else {
            model._options.store = schema.store;
        }
        if (typeof schema.vms === "undefined") {
            schema.vms = {
                "default": "*"
            };
        }
        model._options.vms = schema.vms;
        model._options.refs = schema.refs || {};
        for (var key in model._options.refs) {
            model._options.excludes[key] = true;
        }
        model._options.keys = schema.keys || {};
        _.updateProp(model, {
            name: "_options",
            attrs: {
                enumerable: false
            }
        });
        _.lockProperty(model._options, "refs");
        _.lockProperty(model._options, "keys");
    };
    Model.create = function(schema) {
        var newModel = function(data, options) {
            var scope = this;
            data = data || {};
            options = options || {};
            scope._options = _.clone(newModel._options);
            _.extend(scope._options, options);
            initialize(data, scope);
            scope.initialize(data);
            return scope;
        };
        newModel._options = {
            excludes: {
                _options: true
            }
        };
        newModel.prototype = Object.create(Model.prototype);
        parseSchema(schema, newModel);
        if (schema.urn[schema.urn.length - 1] === "*") {
            var collectionSchema = _.clone(schema);
            var urnArray = schema.urn.split(":");
            urnArray.splice(-1);
            collectionSchema.urn = urnArray.join(":");
            collectionSchema.rootUrn = schema.rootUrn;
            if (collectionSchema.store.localStore) {
                collectionSchema.store.localStore = collectionSchema.urn;
            }
            if (!findModel(collectionSchema.urn)) {
                collectionSchema.refs = {
                    entries: [ {
                        type: "urn"
                    } ]
                };
                collectionSchema.keys = {
                    lastModified: {
                        type: "date"
                    },
                    createdDate: {
                        type: "date"
                    }
                };
                var newCollection = Model.create(collectionSchema);
                new newCollection();
            }
        }
        return newModel;
    };
    _.updateProp(Model, {
        name: "create",
        attrs: {
            enumerable: false
        }
    });
    Model.getCollections = function() {
        return collections;
    };
    _.updateProp(Model, {
        name: "getCollections",
        attrs: {
            enumerable: false
        }
    });
    _.Model = Model;
})();

(function() {
    var LinkedHashMap = function() {
        this._size = 0;
        this._map = {};
        this._Entry = function(key, value) {
            this.prev = null;
            this.next = null;
            this.key = key;
            this.value = value;
        };
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
            if (this.entry === null) {
                return null;
            }
            var value = this.entry[this.property];
            this.entry = this.entry.next;
            return value;
        }
    };
    LinkedHashMap.prototype = {
        put: function(key, value) {
            var entry;
            if (!this.containsKey(key)) {
                entry = new this._Entry(key, value);
                if (this._size === 0) {
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
        remove: function(key) {
            var entry;
            if (this.containsKey(key)) {
                this._size--;
                entry = this._map[key];
                delete this._map[key];
                if (entry === this._head) {
                    this._head = entry.next;
                    this._head.prev = null;
                } else if (entry === this._tail) {
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
        containsKey: function(key) {
            return this._map.hasOwnProperty(key);
        },
        containsValue: function(value) {
            for (var key in this._map) {
                if (this._map.hasOwnProperty(key)) {
                    if (this._map[key].value === value) {
                        return true;
                    }
                }
            }
            return false;
        },
        get: function(key) {
            return this.containsKey(key) ? this._map[key].value : null;
        },
        clear: function() {
            this._size = 0;
            this._map = {};
            this._head = this._tail = null;
        },
        keys: function(from) {
            var keys = [], start = null;
            if (from) {
                start = this.containsKey(from) ? this._map[from] : null;
            } else {
                start = this._head;
            }
            for (var cur = start; cur != null; cur = cur.next) {
                keys.push(cur.key);
            }
            return keys;
        },
        values: function(from) {
            var values = [], start = null;
            if (from) {
                start = this.containsKey(from) ? this._map[from] : null;
            } else {
                start = this._head;
            }
            for (var cur = start; cur != null; cur = cur.next) {
                values.push(cur.value);
            }
            return values;
        },
        iterator: function(from, type) {
            var property = "value";
            if (type && (type === "key" || type === "keys")) {
                property = "key";
            }
            var entry = this.containsKey(from) ? this._map[from] : null;
            return new _Iterator(entry, property);
        },
        size: function() {
            return this._size;
        }
    };
    _.LinkedHashMap = LinkedHashMap;
})();

(function() {
    "use strict";
    function createRegex(args) {
        var parts = args.urn.split(":");
        var reg = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] == "*") {
                reg.push("([^:]*?)");
            } else if (parts[i] == "#") {
                reg.push("([\\s\\S]*)");
            } else {
                reg.push("(" + parts[i] + ")");
            }
        }
        var regex = new RegExp("^" + reg.join("\\:\\b") + "$", "i");
        return regex;
    }
    _.createRegex = _.createRegex || createRegex;
    var Fabric = function(args) {
        args = args || {};
        var AutoInc = 0;
        this.__i__ = function() {
            return AutoInc++;
        };
        var peekTimeout = args.peekTimeout || 5e3;
        var bindings = {};
        var subscriptions = {};
        var queue = {};
        var processing = {};
        var replay = args.replay ? true : false;
        var store = null;
        if (replay) {
            if (args.persistenceProvider) {
                store = args.persistenceProvider;
            } else {
                store = new _.LinkedHashMap();
            }
        }
        function cb(args) {
            if (args.next) {
                args.data = args.cb.call(null, {
                    data: args.data,
                    matches: args.matches,
                    raw: args.raw,
                    binding: args.binding,
                    key: args.key
                });
                args.index++;
                var next = bindings[args.binding].subs[args.index];
                args.cb = args.next;
                if (next) {
                    args.next = next.callback;
                } else if (typeof args.cb === "function") {
                    args.next = true;
                } else {
                    args.next = undefined;
                }
                if (args.next) {
                    setImmediate(function(args) {
                        cb(args);
                    }, args);
                }
            } else {
                args.dfd.notify({
                    data: args.data,
                    matches: args.matches,
                    raw: args.raw,
                    binding: args.binding,
                    key: args.key
                });
                setImmediate(function(args) {
                    if (args.cb) {
                        args.cb.call(null, {
                            data: args.data,
                            matches: args.matches,
                            raw: args.raw,
                            binding: args.binding,
                            key: args.key
                        });
                    }
                }, {
                    cb: args.cb,
                    data: args.data,
                    matches: args.matches,
                    raw: args.raw,
                    binding: args.binding,
                    key: args.key
                });
            }
            return null;
        }
        var triggerPublishSeed = {};
        function triggerPublish(args) {
            if (!args.sync) {
                for (var i = 0; i < args.subs.length; i++) {
                    delete triggerPublishSeed.next;
                    triggerPublishSeed.data = args.data;
                    triggerPublishSeed.matches = args.matches;
                    triggerPublishSeed.binding = args.loc;
                    triggerPublishSeed.raw = args.data;
                    triggerPublishSeed.cb = args.subs[i].callback;
                    triggerPublishSeed.dfd = args.subs[i].dfd;
                    triggerPublishSeed.index = i + 1;
                    triggerPublishSeed.key = args.key;
                    cb(triggerPublishSeed);
                }
            } else {
                triggerPublishSeed.data = args.data;
                triggerPublishSeed.matches = args.matches;
                triggerPublishSeed.binding = args.loc;
                triggerPublishSeed.raw = args.data;
                triggerPublishSeed.cb = args.subs[0].callback;
                triggerPublishSeed.index = 1;
                triggerPublishSeed.key = args.key;
                if (args.subs[1]) {
                    triggerPublishSeed.next = args.subs[1].callback;
                }
                cb(triggerPublishSeed);
            }
            return null;
        }
        this.subscribe = function(args) {
            args = args || {};
            args.key = "subscription_" + this.__i__();
            args.dfd = new _.Dfd();
            bindings[args.urn] = bindings[args.urn] || {
                subs: []
            };
            bindings[args.urn].regex = bindings[args.urn].regex || _.createRegex({
                urn: args.urn
            });
            bindings[args.urn].subs.push(args);
            subscriptions[args.key] = args;
            var ret = args.dfd.promise();
            ret.key = args.key;
            ret.id = args.id;
            ret.callback = args.callback;
            return ret;
        };
        this.unsubscribe = function(args) {
            args = args || {};
            if (_.isString(args)) {
                args = subscriptions[args] || {};
            }
            if (args.key) {
                args = subscriptions[args.key];
                delete subscriptions[args.key];
            }
            var binding = bindings[args.urn];
            if (binding) {
                for (var i = 0; i < binding.subs.length; i++) {
                    if (args.key && args.key == binding.subs[i].key) {
                        bindings[args.urn].subs.splice(i, 1);
                        if (bindings[args.urn].subs.length == 0) {
                            delete bindings[args.urn];
                        }
                    } else if (args.callback && args.callback == binding.subs[i].callback) {
                        bindings[args.urn].subs.splice(i, 1);
                        if (bindings[args.urn].subs.length == 0) {
                            delete bindings[args.urn];
                        }
                    }
                }
                return args;
            } else {
                return false;
            }
        };
        var publishMatches;
        var publishKey;
        function internalPublish(args) {
            var published = false;
            publishKey = null;
            for (publishKey in bindings) {
                if (args.urn == publishKey) {
                    args.subs = bindings[publishKey].subs;
                    args.loc = publishKey;
                    triggerPublish(args);
                    published = true;
                } else {
                    publishMatches = bindings[publishKey].regex.exec(args.urn);
                    if (publishMatches) {
                        publishMatches.splice(0, 1);
                        args.matches = publishMatches;
                        args.subs = bindings[publishKey].subs;
                        args.loc = publishKey;
                        triggerPublish(args);
                        published = true;
                    }
                }
            }
            return {
                published: published,
                key: args.key
            };
        }
        function publishTo(message, subscriptionKeys) {
            var subscription, args, published = false;
            for (var i = 0; i < subscriptionKeys.length; i++) {
                subscription = subscriptions[subscriptionKeys[i]];
                if (subscription) {
                    message.loc = subscription.urn;
                    message.subs = [ subscription ];
                    if (message.urn == subscription.urn) {
                        triggerPublish(message);
                        published = true;
                    } else {
                        publishMatches = bindings[subscription.urn].regex.exec(message.urn);
                        if (publishMatches) {
                            publishMatches.splice(0, 1);
                            message.matches = publishMatches;
                            triggerPublish(message);
                            published = true;
                        }
                    }
                }
            }
            return {
                published: published,
                key: message.key
            };
        }
        this.publish = function(args) {
            args = args || {
                data: {}
            };
            args.data = args.data || {};
            args.key = "message_" + this.__i__();
            args.type = args.type || "publish";
            if (replay) {
                store.put(args.key, args);
            }
            return internalPublish(args);
        };
        this.request = function(args) {
            args = args || {};
            args.data = args.data || {};
            args.data.key = "message_" + this.__i__();
            args.data.cbUrn = args.urn + ":" + args.data.key;
            args.data.type = "request";
            args.data.key = this.subscribe({
                urn: args.data.cbUrn,
                callback: args.callback
            }).key;
            this.publish(args);
            return;
        };
        this.fulfill = function(args) {
            args = args || {};
            args.type = "fulfill";
            var key = args.key;
            var urn = args.urn;
            this.publish(args);
            this.unsubscribe({
                urn: urn,
                key: key
            });
            return;
        };
        this.command = function(args) {
            args = args || {};
            args.data = args.data || {};
            args.data.key = "message_" + this.__i__();
            args.data.cbUrn = args.urn + ":" + args.data.key;
            args.data.type = "command";
            args.data.key = this.subscribe({
                urn: args.data.cbUrn,
                callback: args.callback
            }).key;
            this.publish(args);
            return;
        };
        this.notify = function(args) {
            args = args || {};
            args.type = "notify";
            var key = args.key;
            var urn = args.urn;
            this.publish(args);
            this.unsubscribe({
                urn: urn,
                key: key
            });
            return;
        };
        this.enqueue = function(args) {
            args = args || {};
            args.key = "queued" + this.__i__();
            queue[args.urn] = queue[args.urn] || {
                items: []
            };
            queue[args.urn].regex = _.createRegex({
                urn: args.urn
            });
            queue[args.urn].items.push(args);
            return args;
        };
        this.dequeue = function(args) {
            args = args || {};
            for (var key in queue) {
                if (args.urn == key) {
                    var match = false;
                    var j = 0;
                    for (var i = 0; i < queue[key].items.length; i++) {
                        if (args.key === queue[key].items[i].key) {
                            match = true;
                            j = i;
                            break;
                        }
                    }
                    if (match) {
                        queue[key].items.splice(j, 1);
                        if (queue[key].items.length == 0) {
                            delete queue[key];
                        }
                    }
                }
            }
            return;
        };
        this.peek = function(args) {
            args = args || {};
            args.offset = args.offset || 0;
            var i = 0;
            var message = null;
            var match = null;
            for (var key in queue) {
                if (args.urn == key) {
                    if (queue[key].items.length > args.offset) {
                        message = queue[key].items[args.offset];
                        queue[key].items.splice(args.offset, 1);
                        match = key;
                        break;
                    }
                } else {
                    var matches = queue[key].regex.exec(args.urn);
                    if (matches) {
                        if (queue[key].items.length > args.offset) {
                            match = key;
                            message = queue[key].items[args.offset];
                            matches.splice(0, 1);
                            message.matches = matches;
                            queue[key].items.splice(args.offset, 1);
                            break;
                        }
                    }
                }
            }
            if (message) {
                var timeout = setTimeout(function() {
                    queue[match] = queue[match] || {
                        items: [],
                        regex: _.createRegex({
                            urn: match
                        })
                    };
                    queue[match].items.unshift(message);
                    delete processing[message.key];
                }, peekTimeout);
                processing[message.key] = {
                    message: message,
                    timeout: timeout
                };
                args.callback.call(null, {
                    data: message
                });
            } else {
                args.callback.call(null, {
                    data: {}
                });
            }
            return;
        };
        this.handle = function(args) {
            args = args || {};
            var message = processing[args.key];
            if (message) {
                clearTimeout(message.timeout);
                delete processing[args.key];
            }
            return;
        };
        this.release = function(args) {
            args = args || {};
            queue[processing[args.key].message.urn].items.unshift(processing[args.key].message);
            delete processing[args.key];
            return;
        };
        this.canReplay = function() {
            return replay;
        };
        this.replay = function(from, count, to) {
            if (!replay) {
                throw new Error("Cannot replay events since Fabric was not initialized with replay=true");
            }
            if (!store.containsKey(from)) {
                throw new Error("Cannot replay from '" + from + "', the message ID was not found");
            }
            if (arguments.length === 1) {
                count = -1;
                to = null;
            } else if (arguments.length === 2) {
                if (_.isArray(count)) {
                    to = count;
                    count = -1;
                } else {
                    to = null;
                }
            }
            var publishFunc;
            if (to) {
                publishFunc = function(message) {
                    return publishTo(message, to);
                };
            } else {
                publishFunc = internalPublish;
            }
            var itr = store.iterator(from + 1);
            var numPublished = 0;
            var publishedInfo;
            while (itr.hasNext() && (count < 0 || numPublished < count)) {
                var message = itr.next();
                publishedInfo = publishFunc(message);
                if (publishedInfo.published) {
                    numPublished++;
                }
            }
        };
        this.id = "Fabric_" + this.__i__();
        if (!args.debugMode) {
            if (Object.freeze) {
                Object.freeze(this);
            }
            if (Object.defineProperties) {
                Object.defineProperties(Fabric.prototype, {
                    name: {
                        writable: false
                    },
                    toString: {
                        writable: false
                    }
                });
            }
        } else {
            this.debug = function() {
                return {
                    bindings: bindings,
                    queue: queue,
                    processing: processing
                };
            };
        }
        return this;
    };
    _.extend(Fabric.prototype, {
        name: "Fabric",
        toString: function() {
            return "[object Fabric]";
        }
    });
    _.Fabric = Fabric;
})();
//# sourceMappingURL=jive.js.map