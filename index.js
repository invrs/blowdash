/**
 * @license
 * lodash 3.10.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash include="assign,capitalize,chain,chunk,clone,cloneDeep,debounce,defaults,delay,drop,each,escape,extend,filter,find,findKey,first,flatten,forEach,get,groupBy,indexBy,indexOf,isArray,isEmpty,isEqual,isFunction,isNaN,isObject,isString,kebabCase,keys,last,map,mapValues,merge,noop,omit,padLeft,pick,pluck,pullAt,random,reduce,reject,remove,shuffle,size,sortBy,startCase,transform,trim,trunc,unescape,uniq,values,without,words,zipObject" -d -o index.js`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre-ES5 environments. */
  var undefined;

  /** Used as the semantic version number. */
  var VERSION = '3.10.1';

  /** Used to compose bitmasks for wrapper metadata. */
  var BIND_FLAG = 1,
      BIND_KEY_FLAG = 2,
      CURRY_BOUND_FLAG = 4,
      CURRY_FLAG = 8,
      CURRY_RIGHT_FLAG = 16,
      PARTIAL_FLAG = 32,
      PARTIAL_RIGHT_FLAG = 64,
      ARY_FLAG = 128;

  /** Used as default options for `_.trunc`. */
  var DEFAULT_TRUNC_LENGTH = 30,
      DEFAULT_TRUNC_OMISSION = '...';

  /** Used to detect when a function becomes hot. */
  var HOT_COUNT = 150,
      HOT_SPAN = 16;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /** Used to indicate the type of lazy iteratees. */
  var LAZY_FILTER_FLAG = 1,
      LAZY_MAP_FLAG = 2;

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as the internal argument placeholder. */
  var PLACEHOLDER = '__lodash_placeholder__';

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to match HTML entities and HTML characters. */
  var reEscapedHtml = /&(?:amp|lt|gt|quot|#39|#96);/g,
      reUnescapedHtml = /[&<>"'`]/g,
      reHasEscapedHtml = RegExp(reEscapedHtml.source),
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to match property names within property paths. */
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/,
      rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g;

  /** Used to match [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks). */
  var reComboMark = /[\u0300-\u036f\ufe20-\ufe23]/g;

  /** Used to match backslashes in property paths. */
  var reEscapeChar = /\\(\\)?/g;

  /** Used to match `RegExp` flags from their coerced string values. */
  var reFlags = /\w*$/;

  /** Used to detect host constructors (Safari > 5). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^\d+$/;

  /** Used to match latin-1 supplementary letters (excluding mathematical operators). */
  var reLatin1 = /[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;

  /** Used to match words to create compound words. */
  var reWords = (function() {
    var upper = '[A-Z\\xc0-\\xd6\\xd8-\\xde]',
        lower = '[a-z\\xdf-\\xf6\\xf8-\\xff]+';

    return RegExp(upper + '+(?=' + upper + lower + ')|' + upper + '?' + lower + '|' + upper + '+|[0-9]+', 'g');
  }());

  /** Used to fix the JScript `[[DontEnum]]` bug. */
  var shadowProps = [
    'constructor', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable',
    'toLocaleString', 'toString', 'valueOf'
  ];

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dateTag] = typedArrayTags[errorTag] =
  typedArrayTags[funcTag] = typedArrayTags[mapTag] =
  typedArrayTags[numberTag] = typedArrayTags[objectTag] =
  typedArrayTags[regexpTag] = typedArrayTags[setTag] =
  typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;

  /** Used to identify `toStringTag` values supported by `_.clone`. */
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] =
  cloneableTags[arrayBufferTag] = cloneableTags[boolTag] =
  cloneableTags[dateTag] = cloneableTags[float32Tag] =
  cloneableTags[float64Tag] = cloneableTags[int8Tag] =
  cloneableTags[int16Tag] = cloneableTags[int32Tag] =
  cloneableTags[numberTag] = cloneableTags[objectTag] =
  cloneableTags[regexpTag] = cloneableTags[stringTag] =
  cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
  cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] =
  cloneableTags[mapTag] = cloneableTags[setTag] =
  cloneableTags[weakMapTag] = false;

  /** Used to map latin-1 supplementary letters to basic latin letters. */
  var deburredLetters = {
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcC': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xeC': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss'
  };

  /** Used to map characters to HTML entities. */
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };

  /** Used to map HTML entities to characters. */
  var htmlUnescapes = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#96;': '`'
  };

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global && global.Object && global;

  /** Detect free variable `self`. */
  var freeSelf = objectTypes[typeof self] && self && self.Object && self;

  /** Detect free variable `window`. */
  var freeWindow = objectTypes[typeof window] && window && window.Object && window;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it's the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `compareAscending` which compares values and
   * sorts them in ascending order without guaranteeing a stable sort.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {number} Returns the sort order indicator for `value`.
   */
  function baseCompareAscending(value, other) {
    if (value !== other) {
      var valIsNull = value === null,
          valIsUndef = value === undefined,
          valIsReflexive = value === value;

      var othIsNull = other === null,
          othIsUndef = other === undefined,
          othIsReflexive = other === other;

      if ((value > other && !othIsNull) || !valIsReflexive ||
          (valIsNull && !othIsUndef && othIsReflexive) ||
          (valIsUndef && othIsReflexive)) {
        return 1;
      }
      if ((value < other && !valIsNull) || !othIsReflexive ||
          (othIsNull && !valIsUndef && valIsReflexive) ||
          (othIsUndef && valIsReflexive)) {
        return -1;
      }
    }
    return 0;
  }

  /**
   * The base implementation of `_.findIndex` and `_.findLastIndex` without
   * support for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {Function} predicate The function invoked per iteration.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseFindIndex(array, predicate, fromRight) {
    var length = array.length,
        index = fromRight ? length : -1;

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  /**
   * The base implementation of `_.indexOf` without support for binary searches.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    if (value !== value) {
      return indexOfNaN(array, fromIndex);
    }
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Converts `value` to a string if it's not one. An empty string is returned
   * for `null` or `undefined` values.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    return value == null ? '' : (value + '');
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the first character not found in `chars`.
   */
  function charsLeftIndex(string, chars) {
    var index = -1,
        length = string.length;

    while (++index < length && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last character
   * of `string` that is not found in `chars`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @param {string} chars The characters to find.
   * @returns {number} Returns the index of the last character not found in `chars`.
   */
  function charsRightIndex(string, chars) {
    var index = string.length;

    while (index-- && chars.indexOf(string.charAt(index)) > -1) {}
    return index;
  }

  /**
   * Used by `_.sortBy` to compare transformed elements of a collection and stable
   * sort them in ascending order.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @returns {number} Returns the sort order indicator for `object`.
   */
  function compareAscending(object, other) {
    return baseCompareAscending(object.criteria, other.criteria) || (object.index - other.index);
  }

  /**
   * Used by `_.deburr` to convert latin-1 supplementary letters to basic latin letters.
   *
   * @private
   * @param {string} letter The matched letter to deburr.
   * @returns {string} Returns the deburred letter.
   */
  function deburrLetter(letter) {
    return deburredLetters[letter];
  }

  /**
   * Used by `_.escape` to convert characters to HTML entities.
   *
   * @private
   * @param {string} chr The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
  }

  /**
   * Gets the index at which the first occurrence of `NaN` is found in `array`.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {number} fromIndex The index to search from.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {number} Returns the index of the matched `NaN`, else `-1`.
   */
  function indexOfNaN(array, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 0 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      var other = array[index];
      if (other !== other) {
        return index;
      }
    }
    return -1;
  }

  /**
   * Checks if `value` is a host object in IE < 9.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
   */
  var isHostObject = (function() {
    try {
      Object({ 'toString': 0 } + '');
    } catch(e) {
      return function() { return false; };
    }
    return function(value) {
      // IE < 9 presents many host objects as `Object` objects that can coerce
      // to strings despite having improperly defined `toString` methods.
      return typeof value.toString != 'function' && typeof (value + '') == 'string';
    };
  }());

  /**
   * Checks if `value` is object-like.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Used by `trimmedLeftIndex` and `trimmedRightIndex` to determine if a
   * character code is whitespace.
   *
   * @private
   * @param {number} charCode The character code to inspect.
   * @returns {boolean} Returns `true` if `charCode` is whitespace, else `false`.
   */
  function isSpace(charCode) {
    return ((charCode <= 160 && (charCode >= 9 && charCode <= 13) || charCode == 32 || charCode == 160) || charCode == 5760 || charCode == 6158 ||
      (charCode >= 8192 && (charCode <= 8202 || charCode == 8232 || charCode == 8233 || charCode == 8239 || charCode == 8287 || charCode == 12288 || charCode == 65279)));
  }

  /**
   * Replaces all `placeholder` elements in `array` with an internal placeholder
   * and returns an array of their indexes.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {*} placeholder The placeholder to replace.
   * @returns {Array} Returns the new array of placeholder indexes.
   */
  function replaceHolders(array, placeholder) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      if (array[index] === placeholder) {
        array[index] = PLACEHOLDER;
        result[++resIndex] = index;
      }
    }
    return result;
  }

  /**
   * An implementation of `_.uniq` optimized for sorted arrays without support
   * for callback shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The function invoked per iteration.
   * @returns {Array} Returns the new duplicate free array.
   */
  function sortedUniq(array, iteratee) {
    var seen,
        index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value, index, array) : value;

      if (!index || seen !== computed) {
        seen = computed;
        result[++resIndex] = value;
      }
    }
    return result;
  }

  /**
   * Used by `_.trim` and `_.trimLeft` to get the index of the first non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the first non-whitespace character.
   */
  function trimmedLeftIndex(string) {
    var index = -1,
        length = string.length;

    while (++index < length && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.trim` and `_.trimRight` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedRightIndex(string) {
    var index = string.length;

    while (index-- && isSpace(string.charCodeAt(index))) {}
    return index;
  }

  /**
   * Used by `_.unescape` to convert HTML entities to characters.
   *
   * @private
   * @param {string} chr The matched character to unescape.
   * @returns {string} Returns the unescaped character.
   */
  function unescapeHtmlChar(chr) {
    return htmlUnescapes[chr];
  }

  /*--------------------------------------------------------------------------*/

  /** Used for native method references. */
  var arrayProto = Array.prototype,
      errorProto = Error.prototype,
      objectProto = Object.prototype,
      stringProto = String.prototype;

  /** Used to resolve the decompiled source of functions. */
  var fnToString = Function.prototype.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objToString = objectProto.toString;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /** Native method references. */
  var ArrayBuffer = root.ArrayBuffer,
      propertyIsEnumerable = objectProto.propertyIsEnumerable,
      Set = getNative(root, 'Set'),
      splice = arrayProto.splice,
      Uint8Array = root.Uint8Array,
      WeakMap = getNative(root, 'WeakMap');

  /* Native method references for those with the same name as other `lodash` methods. */
  var nativeCeil = Math.ceil,
      nativeCreate = getNative(Object, 'create'),
      nativeFloor = Math.floor,
      nativeIsArray = getNative(Array, 'isArray'),
      nativeIsFinite = root.isFinite,
      nativeKeys = getNative(Object, 'keys'),
      nativeMax = Math.max,
      nativeMin = Math.min,
      nativeNow = getNative(Date, 'now'),
      nativeRandom = Math.random;

  /** Used as references for `-Infinity` and `Infinity`. */
  var POSITIVE_INFINITY = Number.POSITIVE_INFINITY;

  /** Used as references for the maximum length and index of an array. */
  var MAX_ARRAY_LENGTH = 4294967295,
      MAX_ARRAY_INDEX = MAX_ARRAY_LENGTH - 1,
      HALF_MAX_ARRAY_LENGTH = MAX_ARRAY_LENGTH >>> 1;

  /**
   * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
   * of an array-like value.
   */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to store function metadata. */
  var metaMap = WeakMap && new WeakMap;

  /** Used to lookup unminified function names. */
  var realNames = {};

  /** Used to lookup a type array constructors by `toStringTag`. */
  var ctorByTag = {};
  ctorByTag[float32Tag] = root.Float32Array;
  ctorByTag[float64Tag] = root.Float64Array;
  ctorByTag[int8Tag] = root.Int8Array;
  ctorByTag[int16Tag] = root.Int16Array;
  ctorByTag[int32Tag] = root.Int32Array;
  ctorByTag[uint8Tag] = Uint8Array;
  ctorByTag[uint8ClampedTag] = root.Uint8ClampedArray;
  ctorByTag[uint16Tag] = root.Uint16Array;
  ctorByTag[uint32Tag] = root.Uint32Array;

  /** Used to avoid iterating over non-enumerable properties in IE < 9. */
  var nonEnumProps = {};
  nonEnumProps[arrayTag] = nonEnumProps[dateTag] = nonEnumProps[numberTag] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
  nonEnumProps[boolTag] = nonEnumProps[stringTag] = { 'constructor': true, 'toString': true, 'valueOf': true };
  nonEnumProps[errorTag] = nonEnumProps[funcTag] = nonEnumProps[regexpTag] = { 'constructor': true, 'toString': true };
  nonEnumProps[objectTag] = { 'constructor': true };

  arrayEach(shadowProps, function(key) {
    for (var tag in nonEnumProps) {
      if (hasOwnProperty.call(nonEnumProps, tag)) {
        var props = nonEnumProps[tag];
        props[key] = hasOwnProperty.call(props, key);
      }
    }
  });

  /*------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object which wraps `value` to enable implicit chaining.
   * Methods that operate on and return arrays, collections, and functions can
   * be chained together. Methods that retrieve a single value or may return a
   * primitive value will automatically end the chain returning the unwrapped
   * value. Explicit chaining may be enabled using `_.chain`. The execution of
   * chained methods is lazy, that is, execution is deferred until `_#value`
   * is implicitly or explicitly called.
   *
   * Lazy evaluation allows several methods to support shortcut fusion. Shortcut
   * fusion is an optimization strategy which merge iteratee calls; this can help
   * to avoid the creation of intermediate data structures and greatly reduce the
   * number of iteratee executions.
   *
   * Chaining is supported in custom builds as long as the `_#value` method is
   * directly or indirectly included in the build.
   *
   * In addition to lodash methods, wrappers have `Array` and `String` methods.
   *
   * The wrapper `Array` methods are:
   * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`,
   * `splice`, and `unshift`
   *
   * The wrapper `String` methods are:
   * `replace` and `split`
   *
   * The wrapper methods that support shortcut fusion are:
   * `compact`, `drop`, `dropRight`, `dropRightWhile`, `dropWhile`, `filter`,
   * `first`, `initial`, `last`, `map`, `pluck`, `reject`, `rest`, `reverse`,
   * `slice`, `take`, `takeRight`, `takeRightWhile`, `takeWhile`, `toArray`,
   * and `where`
   *
   * The chainable wrapper methods are:
   * `after`, `ary`, `assign`, `at`, `before`, `bind`, `bindAll`, `bindKey`,
   * `callback`, `chain`, `chunk`, `commit`, `compact`, `concat`, `constant`,
   * `countBy`, `create`, `curry`, `debounce`, `defaults`, `defaultsDeep`,
   * `defer`, `delay`, `difference`, `drop`, `dropRight`, `dropRightWhile`,
   * `dropWhile`, `fill`, `filter`, `flatten`, `flattenDeep`, `flow`, `flowRight`,
   * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
   * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
   * `invoke`, `keys`, `keysIn`, `map`, `mapKeys`, `mapValues`, `matches`,
   * `matchesProperty`, `memoize`, `merge`, `method`, `methodOf`, `mixin`,
   * `modArgs`, `negate`, `omit`, `once`, `pairs`, `partial`, `partialRight`,
   * `partition`, `pick`, `plant`, `pluck`, `property`, `propertyOf`, `pull`,
   * `pullAt`, `push`, `range`, `rearg`, `reject`, `remove`, `rest`, `restParam`,
   * `reverse`, `set`, `shuffle`, `slice`, `sort`, `sortBy`, `sortByAll`,
   * `sortByOrder`, `splice`, `spread`, `take`, `takeRight`, `takeRightWhile`,
   * `takeWhile`, `tap`, `throttle`, `thru`, `times`, `toArray`, `toPlainObject`,
   * `transform`, `union`, `uniq`, `unshift`, `unzip`, `unzipWith`, `values`,
   * `valuesIn`, `where`, `without`, `wrap`, `xor`, `zip`, `zipObject`, `zipWith`
   *
   * The wrapper methods that are **not** chainable by default are:
   * `add`, `attempt`, `camelCase`, `capitalize`, `ceil`, `clone`, `cloneDeep`,
   * `deburr`, `endsWith`, `escape`, `escapeRegExp`, `every`, `find`, `findIndex`,
   * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `findWhere`, `first`,
   * `floor`, `get`, `gt`, `gte`, `has`, `identity`, `includes`, `indexOf`,
   * `inRange`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
   * `isEmpty`, `isEqual`, `isError`, `isFinite` `isFunction`, `isMatch`,
   * `isNative`, `isNaN`, `isNull`, `isNumber`, `isObject`, `isPlainObject`,
   * `isRegExp`, `isString`, `isUndefined`, `isTypedArray`, `join`, `kebabCase`,
   * `last`, `lastIndexOf`, `lt`, `lte`, `max`, `min`, `noConflict`, `noop`,
   * `now`, `pad`, `padLeft`, `padRight`, `parseInt`, `pop`, `random`, `reduce`,
   * `reduceRight`, `repeat`, `result`, `round`, `runInContext`, `shift`, `size`,
   * `snakeCase`, `some`, `sortedIndex`, `sortedLastIndex`, `startCase`,
   * `startsWith`, `sum`, `template`, `trim`, `trimLeft`, `trimRight`, `trunc`,
   * `unescape`, `uniqueId`, `value`, and `words`
   *
   * The wrapper method `sample` will return a wrapped value when `n` is provided,
   * otherwise an unwrapped value is returned.
   *
   * @name _
   * @constructor
   * @category Chain
   * @param {*} value The value to wrap in a `lodash` instance.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var wrapped = _([1, 2, 3]);
   *
   * // returns an unwrapped value
   * wrapped.reduce(function(total, n) {
   *   return total + n;
   * });
   * // => 6
   *
   * // returns a wrapped value
   * var squares = wrapped.map(function(n) {
   *   return n * n;
   * });
   *
   * _.isArray(squares);
   * // => false
   *
   * _.isArray(squares.value());
   * // => true
   */
  function lodash(value) {
    if (isObjectLike(value) && !isArray(value) && !(value instanceof LazyWrapper)) {
      if (value instanceof LodashWrapper) {
        return value;
      }
      if (hasOwnProperty.call(value, '__chain__') && hasOwnProperty.call(value, '__wrapped__')) {
        return wrapperClone(value);
      }
    }
    return new LodashWrapper(value);
  }

  /**
   * The function whose prototype all chaining wrappers inherit from.
   *
   * @private
   */
  function baseLodash() {
    // No operation performed.
  }

  /**
   * The base constructor for creating `lodash` wrapper objects.
   *
   * @private
   * @param {*} value The value to wrap.
   * @param {boolean} [chainAll] Enable chaining for all wrapper methods.
   * @param {Array} [actions=[]] Actions to peform to resolve the unwrapped value.
   */
  function LodashWrapper(value, chainAll, actions) {
    this.__wrapped__ = value;
    this.__actions__ = actions || [];
    this.__chain__ = !!chainAll;
  }

  /**
   * An object environment feature flags.
   *
   * @static
   * @memberOf _
   * @type Object
   */
  var support = lodash.support = {};

  (function(x) {
    var Ctor = function() { this.x = x; },
        object = { '0': x, 'length': x },
        props = [];

    Ctor.prototype = { 'valueOf': x, 'y': x };
    for (var key in new Ctor) { props.push(key); }

    /**
     * Detect if `name` or `message` properties of `Error.prototype` are
     * enumerable by default (IE < 9, Safari < 5.1).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') ||
      propertyIsEnumerable.call(errorProto, 'name');

    /**
     * Detect if `prototype` properties are enumerable by default.
     *
     * Firefox < 3.6, Opera > 9.50 - Opera < 11.60, and Safari < 5.1
     * (if the prototype or a property on the prototype has been set)
     * incorrectly set the `[[Enumerable]]` value of a function's `prototype`
     * property to `true`.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.enumPrototypes = propertyIsEnumerable.call(Ctor, 'prototype');

    /**
     * Detect if properties shadowing those on `Object.prototype` are non-enumerable.
     *
     * In IE < 9 an object's own properties, shadowing non-enumerable ones,
     * are made non-enumerable as well (a.k.a the JScript `[[DontEnum]]` bug).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.nonEnumShadows = !/valueOf/.test(props);

    /**
     * Detect if own properties are iterated after inherited properties (IE < 9).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.ownLast = props[0] != 'x';

    /**
     * Detect if `Array#shift` and `Array#splice` augment array-like objects
     * correctly.
     *
     * Firefox < 10, compatibility modes of IE 8, and IE < 9 have buggy Array
     * `shift()` and `splice()` functions that fail to remove the last element,
     * `value[0]`, of array-like objects even though the "length" property is
     * set to `0`. The `shift()` method is buggy in compatibility modes of IE 8,
     * while `splice()` is buggy regardless of mode in IE < 9.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.spliceObjects = (splice.call(object, 0, 1), !object[0]);

    /**
     * Detect lack of support for accessing string characters by index.
     *
     * IE < 8 can't access characters by index. IE 8 can only access characters
     * by index on string literals, not string objects.
     *
     * @memberOf _.support
     * @type boolean
     */
    support.unindexedChars = ('x'[0] + Object('x')[0]) != 'xx';
  }(1, 0));

  /*------------------------------------------------------------------------*/

  /**
   * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
   *
   * @private
   * @param {*} value The value to wrap.
   */
  function LazyWrapper(value) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__dir__ = 1;
    this.__filtered__ = false;
    this.__iteratees__ = [];
    this.__takeCount__ = POSITIVE_INFINITY;
    this.__views__ = [];
  }

  /**
   * Creates a clone of the lazy wrapper object.
   *
   * @private
   * @name clone
   * @memberOf LazyWrapper
   * @returns {Object} Returns the cloned `LazyWrapper` object.
   */
  function lazyClone() {
    var result = new LazyWrapper(this.__wrapped__);
    result.__actions__ = arrayCopy(this.__actions__);
    result.__dir__ = this.__dir__;
    result.__filtered__ = this.__filtered__;
    result.__iteratees__ = arrayCopy(this.__iteratees__);
    result.__takeCount__ = this.__takeCount__;
    result.__views__ = arrayCopy(this.__views__);
    return result;
  }

  /**
   * Reverses the direction of lazy iteration.
   *
   * @private
   * @name reverse
   * @memberOf LazyWrapper
   * @returns {Object} Returns the new reversed `LazyWrapper` object.
   */
  function lazyReverse() {
    if (this.__filtered__) {
      var result = new LazyWrapper(this);
      result.__dir__ = -1;
      result.__filtered__ = true;
    } else {
      result = this.clone();
      result.__dir__ *= -1;
    }
    return result;
  }

  /**
   * Extracts the unwrapped value from its lazy wrapper.
   *
   * @private
   * @name value
   * @memberOf LazyWrapper
   * @returns {*} Returns the unwrapped value.
   */
  function lazyValue() {
    var array = this.__wrapped__.value(),
        dir = this.__dir__,
        isArr = isArray(array),
        isRight = dir < 0,
        arrLength = isArr ? array.length : 0,
        view = getView(0, arrLength, this.__views__),
        start = view.start,
        end = view.end,
        length = end - start,
        index = isRight ? end : (start - 1),
        iteratees = this.__iteratees__,
        iterLength = iteratees.length,
        resIndex = 0,
        takeCount = nativeMin(length, this.__takeCount__);

    if (!isArr || arrLength < LARGE_ARRAY_SIZE || (arrLength == length && takeCount == length)) {
      return baseWrapperValue(array, this.__actions__);
    }
    var result = [];

    outer:
    while (length-- && resIndex < takeCount) {
      index += dir;

      var iterIndex = -1,
          value = array[index];

      while (++iterIndex < iterLength) {
        var data = iteratees[iterIndex],
            iteratee = data.iteratee,
            type = data.type,
            computed = iteratee(value);

        if (type == LAZY_MAP_FLAG) {
          value = computed;
        } else if (!computed) {
          if (type == LAZY_FILTER_FLAG) {
            continue outer;
          } else {
            break outer;
          }
        }
      }
      result[resIndex++] = value;
    }
    return result;
  }

  /*------------------------------------------------------------------------*/

  /**
   *
   * Creates a cache object to store unique values.
   *
   * @private
   * @param {Array} [values] The values to cache.
   */
  function SetCache(values) {
    var length = values ? values.length : 0;

    this.data = { 'hash': nativeCreate(null), 'set': new Set };
    while (length--) {
      this.push(values[length]);
    }
  }

  /**
   * Checks if `value` is in `cache` mimicking the return signature of
   * `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache to search.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var data = cache.data,
        result = (typeof value == 'string' || isObject(value)) ? data.set.has(value) : data.hash[value];

    return result ? 0 : -1;
  }

  /**
   * Adds `value` to the cache.
   *
   * @private
   * @name push
   * @memberOf SetCache
   * @param {*} value The value to cache.
   */
  function cachePush(value) {
    var data = this.data;
    if (typeof value == 'string' || isObject(value)) {
      data.set.add(value);
    } else {
      data.hash[value] = true;
    }
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a new array joining `array` with `other`.
   *
   * @private
   * @param {Array} array The array to join.
   * @param {Array} other The other array to join.
   * @returns {Array} Returns the new concatenated array.
   */
  function arrayConcat(array, other) {
    var index = -1,
        length = array.length,
        othIndex = -1,
        othLength = other.length,
        result = Array(length + othLength);

    while (++index < length) {
      result[index] = array[index];
    }
    while (++othIndex < othLength) {
      result[index++] = other[othIndex];
    }
    return result;
  }

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function arrayCopy(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  /**
   * A specialized version of `_.forEach` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns `array`.
   */
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  /**
   * A specialized version of `_.filter` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[++resIndex] = value;
      }
    }
    return result;
  }

  /**
   * A specialized version of `_.map` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function arrayMap(array, iteratee) {
    var index = -1,
        length = array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  /**
   * A specialized version of `_.reduce` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {boolean} [initFromArray] Specify using the first element of `array`
   *  as the initial value.
   * @returns {*} Returns the accumulated value.
   */
  function arrayReduce(array, iteratee, accumulator, initFromArray) {
    var index = -1,
        length = array.length;

    if (initFromArray && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  /**
   * A specialized version of `_.some` for arrays without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function arraySome(array, predicate) {
    var index = -1,
        length = array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Used by `_.defaults` to customize its `_.assign` use.
   *
   * @private
   * @param {*} objectValue The destination object property value.
   * @param {*} sourceValue The source object property value.
   * @returns {*} Returns the value to assign to the destination object.
   */
  function assignDefaults(objectValue, sourceValue) {
    return objectValue === undefined ? sourceValue : objectValue;
  }

  /**
   * A specialized version of `_.assign` for customizing assigned values without
   * support for argument juggling, multiple sources, and `this` binding `customizer`
   * functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {Function} customizer The function to customize assigned values.
   * @returns {Object} Returns `object`.
   */
  function assignWith(object, source, customizer) {
    var index = -1,
        props = keys(source),
        length = props.length;

    while (++index < length) {
      var key = props[index],
          value = object[key],
          result = customizer(value, source[key], key, object, source);

      if ((result === result ? (result !== value) : (value === value)) ||
          (value === undefined && !(key in object))) {
        object[key] = result;
      }
    }
    return object;
  }

  /**
   * The base implementation of `_.assign` without support for argument juggling,
   * multiple sources, and `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return source == null
      ? object
      : baseCopy(source, keys(source), object);
  }

  /**
   * The base implementation of `_.at` without support for string collections
   * and individual key arguments.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {number[]|string[]} props The property names or indexes of elements to pick.
   * @returns {Array} Returns the new array of picked elements.
   */
  function baseAt(collection, props) {
    var index = -1,
        isNil = collection == null,
        isArr = !isNil && isArrayLike(collection),
        length = isArr ? collection.length : 0,
        propsLength = props.length,
        result = Array(propsLength);

    while(++index < propsLength) {
      var key = props[index];
      if (isArr) {
        result[index] = isIndex(key, length) ? collection[key] : undefined;
      } else {
        result[index] = isNil ? undefined : collection[key];
      }
    }
    return result;
  }

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property names to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @returns {Object} Returns `object`.
   */
  function baseCopy(source, props, object) {
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];
      object[key] = source[key];
    }
    return object;
  }

  /**
   * The base implementation of `_.callback` which supports specifying the
   * number of arguments to provide to `func`.
   *
   * @private
   * @param {*} [func=_.identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {number} [argCount] The number of arguments to provide to `func`.
   * @returns {Function} Returns the callback.
   */
  function baseCallback(func, thisArg, argCount) {
    var type = typeof func;
    if (type == 'function') {
      return thisArg === undefined
        ? func
        : bindCallback(func, thisArg, argCount);
    }
    if (func == null) {
      return identity;
    }
    if (type == 'object') {
      return baseMatches(func);
    }
    return thisArg === undefined
      ? property(func)
      : baseMatchesProperty(func, thisArg);
  }

  /**
   * The base implementation of `_.clone` without support for argument juggling
   * and `this` binding `customizer` functions.
   *
   * @private
   * @param {*} value The value to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @param {Function} [customizer] The function to customize cloning values.
   * @param {string} [key] The key of `value`.
   * @param {Object} [object] The object `value` belongs to.
   * @param {Array} [stackA=[]] Tracks traversed source objects.
   * @param {Array} [stackB=[]] Associates clones with source counterparts.
   * @returns {*} Returns the cloned value.
   */
  function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
    var result;
    if (customizer) {
      result = object ? customizer(value, key, object) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return arrayCopy(value, result);
      }
    } else {
      var tag = objToString.call(value),
          isFunc = tag == funcTag;

      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        if (isHostObject(value)) {
          return object ? value : {};
        }
        result = initCloneObject(isFunc ? {} : value);
        if (!isDeep) {
          return baseAssign(result, value);
        }
      } else {
        return cloneableTags[tag]
          ? initCloneByTag(value, tag, isDeep)
          : (object ? value : {});
      }
    }
    // Check for circular references and return its corresponding clone.
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == value) {
        return stackB[length];
      }
    }
    // Add the source value to the stack of traversed objects and associate it with its clone.
    stackA.push(value);
    stackB.push(result);

    // Recursively populate clone (susceptible to call stack limits).
    (isArr ? arrayEach : baseForOwn)(value, function(subValue, key) {
      result[key] = baseClone(subValue, isDeep, customizer, key, value, stackA, stackB);
    });
    return result;
  }

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} prototype The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(prototype) {
      if (isObject(prototype)) {
        object.prototype = prototype;
        var result = new object;
        object.prototype = undefined;
      }
      return result || {};
    };
  }());

  /**
   * The base implementation of `_.delay` and `_.defer` which accepts an index
   * of where to slice the arguments to provide to `func`.
   *
   * @private
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {Object} args The arguments provide to `func`.
   * @returns {number} Returns the timer id.
   */
  function baseDelay(func, wait, args) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    return setTimeout(function() { func.apply(undefined, args); }, wait);
  }

  /**
   * The base implementation of `_.difference` which accepts a single array
   * of values to exclude.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Array} values The values to exclude.
   * @returns {Array} Returns the new array of filtered values.
   */
  function baseDifference(array, values) {
    var length = array ? array.length : 0,
        result = [];

    if (!length) {
      return result;
    }
    var index = -1,
        indexOf = getIndexOf(),
        isCommon = indexOf === baseIndexOf,
        cache = (isCommon && values.length >= LARGE_ARRAY_SIZE) ? createCache(values) : null,
        valuesLength = values.length;

    if (cache) {
      indexOf = cacheIndexOf;
      isCommon = false;
      values = cache;
    }
    outer:
    while (++index < length) {
      var value = array[index];

      if (isCommon && value === value) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === value) {
            continue outer;
          }
        }
        result.push(value);
      }
      else if (indexOf(values, value, 0) < 0) {
        result.push(value);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.forEach` without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array|Object|string} Returns `collection`.
   */
  var baseEach = createBaseEach(baseForOwn);

  /**
   * The base implementation of `_.filter` without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
  function baseFilter(collection, predicate) {
    var result = [];
    baseEach(collection, function(value, index, collection) {
      if (predicate(value, index, collection)) {
        result.push(value);
      }
    });
    return result;
  }

  /**
   * The base implementation of `_.find`, `_.findLast`, `_.findKey`, and `_.findLastKey`,
   * without support for callback shorthands and `this` binding, which iterates
   * over `collection` using the provided `eachFunc`.
   *
   * @private
   * @param {Array|Object|string} collection The collection to search.
   * @param {Function} predicate The function invoked per iteration.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @param {boolean} [retKey] Specify returning the key of the found element
   *  instead of the element itself.
   * @returns {*} Returns the found element or its key, else `undefined`.
   */
  function baseFind(collection, predicate, eachFunc, retKey) {
    var result;
    eachFunc(collection, function(value, key, collection) {
      if (predicate(value, key, collection)) {
        result = retKey ? key : value;
        return false;
      }
    });
    return result;
  }

  /**
   * The base implementation of `_.flatten` with added support for restricting
   * flattening and specifying the start index.
   *
   * @private
   * @param {Array} array The array to flatten.
   * @param {boolean} [isDeep] Specify a deep flatten.
   * @param {boolean} [isStrict] Restrict flattening to arrays-like objects.
   * @param {Array} [result=[]] The initial result value.
   * @returns {Array} Returns the new flattened array.
   */
  function baseFlatten(array, isDeep, isStrict, result) {
    result || (result = []);

    var index = -1,
        length = array.length;

    while (++index < length) {
      var value = array[index];
      if (isObjectLike(value) && isArrayLike(value) &&
          (isStrict || isArray(value) || isArguments(value))) {
        if (isDeep) {
          // Recursively flatten arrays (susceptible to call stack limits).
          baseFlatten(value, isDeep, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  /**
   * The base implementation of `baseForIn` and `baseForOwn` which iterates
   * over `object` properties returned by `keysFunc` invoking `iteratee` for
   * each property. Iteratee functions may exit iteration early by explicitly
   * returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = createBaseFor();

  /**
   * The base implementation of `_.forIn` without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForIn(object, iteratee) {
    return baseFor(object, iteratee, keysIn);
  }

  /**
   * The base implementation of `_.forOwn` without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return baseFor(object, iteratee, keys);
  }

  /**
   * The base implementation of `_.functions` which creates an array of
   * `object` function property names filtered from those provided.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Array} props The property names to filter.
   * @returns {Array} Returns the new array of filtered property names.
   */
  function baseFunctions(object, props) {
    var index = -1,
        length = props.length,
        resIndex = -1,
        result = [];

    while (++index < length) {
      var key = props[index];
      if (isFunction(object[key])) {
        result[++resIndex] = key;
      }
    }
    return result;
  }

  /**
   * The base implementation of `get` without support for string paths
   * and default values.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} path The path of the property to get.
   * @param {string} [pathKey] The key representation of path.
   * @returns {*} Returns the resolved value.
   */
  function baseGet(object, path, pathKey) {
    if (object == null) {
      return;
    }
    object = toObject(object);
    if (pathKey !== undefined && pathKey in object) {
      path = [pathKey];
    }
    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = toObject(object)[path[index++]];
    }
    return (index && index == length) ? object : undefined;
  }

  /**
   * The base implementation of `_.isEqual` without support for `this` binding
   * `customizer` functions.
   *
   * @private
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {Function} [customizer] The function to customize comparing values.
   * @param {boolean} [isLoose] Specify performing partial comparisons.
   * @param {Array} [stackA] Tracks traversed `value` objects.
   * @param {Array} [stackB] Tracks traversed `other` objects.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   */
  function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
  }

  /**
   * A specialized version of `baseIsEqual` for arrays and objects which performs
   * deep comparisons and tracks traversed objects enabling objects with circular
   * references to be compared.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} [customizer] The function to customize comparing objects.
   * @param {boolean} [isLoose] Specify performing partial comparisons.
   * @param {Array} [stackA=[]] Tracks traversed `value` objects.
   * @param {Array} [stackB=[]] Tracks traversed `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = arrayTag,
        othTag = arrayTag;

    if (!objIsArr) {
      objTag = objToString.call(object);
      if (objTag == argsTag) {
        objTag = objectTag;
      } else if (objTag != objectTag) {
        objIsArr = isTypedArray(object);
      }
    }
    if (!othIsArr) {
      othTag = objToString.call(other);
      if (othTag == argsTag) {
        othTag = objectTag;
      } else if (othTag != objectTag) {
        othIsArr = isTypedArray(other);
      }
    }
    var objIsObj = objTag == objectTag && !isHostObject(object),
        othIsObj = othTag == objectTag && !isHostObject(other),
        isSameTag = objTag == othTag;

    if (isSameTag && !(objIsArr || objIsObj)) {
      return equalByTag(object, other, objTag);
    }
    if (!isLoose) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
      }
    }
    if (!isSameTag) {
      return false;
    }
    // Assume cyclic values are equal.
    // For more information on detecting circular references see https://es5.github.io/#JO.
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == object) {
        return stackB[length] == other;
      }
    }
    // Add `object` and `other` to the stack of traversed objects.
    stackA.push(object);
    stackB.push(other);

    var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

    stackA.pop();
    stackB.pop();

    return result;
  }

  /**
   * The base implementation of `_.isMatch` without support for callback
   * shorthands and `this` binding.
   *
   * @private
   * @param {Object} object The object to inspect.
   * @param {Array} matchData The propery names, values, and compare flags to match.
   * @param {Function} [customizer] The function to customize comparing objects.
   * @returns {boolean} Returns `true` if `object` is a match, else `false`.
   */
  function baseIsMatch(object, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }
    object = toObject(object);
    while (index--) {
      var data = matchData[index];
      if ((noCustomizer && data[2])
            ? data[1] !== object[data[0]]
            : !(data[0] in object)
          ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var result = customizer ? customizer(objValue, srcValue, key) : undefined;
        if (!(result === undefined ? baseIsEqual(srcValue, objValue, customizer, true) : result)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * The base implementation of `_.map` without support for callback shorthands
   * and `this` binding.
   *
   * @private
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function baseMap(collection, iteratee) {
    var index = -1,
        result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function(value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  /**
   * The base implementation of `_.matches` which does not clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new function.
   */
  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      var key = matchData[0][0],
          value = matchData[0][1];

      return function(object) {
        if (object == null) {
          return false;
        }
        object = toObject(object);
        return object[key] === value && (value !== undefined || (key in object));
      };
    }
    return function(object) {
      return baseIsMatch(object, matchData);
    };
  }

  /**
   * The base implementation of `_.matchesProperty` which does not clone `srcValue`.
   *
   * @private
   * @param {string} path The path of the property to get.
   * @param {*} srcValue The value to compare.
   * @returns {Function} Returns the new function.
   */
  function baseMatchesProperty(path, srcValue) {
    var isArr = isArray(path),
        isCommon = isKey(path) && isStrictComparable(srcValue),
        pathKey = (path + '');

    path = toPath(path);
    return function(object) {
      if (object == null) {
        return false;
      }
      var key = pathKey;
      object = toObject(object);
      if ((isArr || !isCommon) && !(key in object)) {
        object = path.length == 1 ? object : baseGet(object, baseSlice(path, 0, -1));
        if (object == null) {
          return false;
        }
        key = last(path);
        object = toObject(object);
      }
      return object[key] === srcValue
        ? (srcValue !== undefined || (key in object))
        : baseIsEqual(srcValue, object[key], undefined, true);
    };
  }

  /**
   * The base implementation of `_.merge` without support for argument juggling,
   * multiple sources, and `this` binding `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {Function} [customizer] The function to customize merged values.
   * @param {Array} [stackA=[]] Tracks traversed source objects.
   * @param {Array} [stackB=[]] Associates values with source counterparts.
   * @returns {Object} Returns `object`.
   */
  function baseMerge(object, source, customizer, stackA, stackB) {
    if (!isObject(object)) {
      return object;
    }
    var isSrcArr = isArrayLike(source) && (isArray(source) || isTypedArray(source)),
        props = isSrcArr ? undefined : keys(source);

    arrayEach(props || source, function(srcValue, key) {
      if (props) {
        key = srcValue;
        srcValue = source[key];
      }
      if (isObjectLike(srcValue)) {
        stackA || (stackA = []);
        stackB || (stackB = []);
        baseMergeDeep(object, source, key, baseMerge, customizer, stackA, stackB);
      }
      else {
        var value = object[key],
            result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
            isCommon = result === undefined;

        if (isCommon) {
          result = srcValue;
        }
        if ((result !== undefined || (isSrcArr && !(key in object))) &&
            (isCommon || (result === result ? (result !== value) : (value === value)))) {
          object[key] = result;
        }
      }
    });
    return object;
  }

  /**
   * A specialized version of `baseMerge` for arrays and objects which performs
   * deep merges and tracks traversed objects enabling objects with circular
   * references to be merged.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {string} key The key of the value to merge.
   * @param {Function} mergeFunc The function to merge values.
   * @param {Function} [customizer] The function to customize merged values.
   * @param {Array} [stackA=[]] Tracks traversed source objects.
   * @param {Array} [stackB=[]] Associates values with source counterparts.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function baseMergeDeep(object, source, key, mergeFunc, customizer, stackA, stackB) {
    var length = stackA.length,
        srcValue = source[key];

    while (length--) {
      if (stackA[length] == srcValue) {
        object[key] = stackB[length];
        return;
      }
    }
    var value = object[key],
        result = customizer ? customizer(value, srcValue, key, object, source) : undefined,
        isCommon = result === undefined;

    if (isCommon) {
      result = srcValue;
      if (isArrayLike(srcValue) && (isArray(srcValue) || isTypedArray(srcValue))) {
        result = isArray(value)
          ? value
          : (isArrayLike(value) ? arrayCopy(value) : []);
      }
      else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        result = isArguments(value)
          ? toPlainObject(value)
          : (isPlainObject(value) ? value : {});
      }
      else {
        isCommon = false;
      }
    }
    // Add the source value to the stack of traversed objects and associate
    // it with its merged value.
    stackA.push(srcValue);
    stackB.push(result);

    if (isCommon) {
      // Recursively merge objects and arrays (susceptible to call stack limits).
      object[key] = mergeFunc(result, srcValue, customizer, stackA, stackB);
    } else if (result === result ? (result !== value) : (value === value)) {
      object[key] = result;
    }
  }

  /**
   * The base implementation of `_.property` without support for deep paths.
   *
   * @private
   * @param {string} key The key of the property to get.
   * @returns {Function} Returns the new function.
   */
  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : toObject(object)[key];
    };
  }

  /**
   * A specialized version of `baseProperty` which supports deep paths.
   *
   * @private
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new function.
   */
  function basePropertyDeep(path) {
    var pathKey = (path + '');
    path = toPath(path);
    return function(object) {
      return baseGet(object, path, pathKey);
    };
  }

  /**
   * The base implementation of `_.pullAt` without support for individual
   * index arguments and capturing the removed elements.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {number[]} indexes The indexes of elements to remove.
   * @returns {Array} Returns `array`.
   */
  function basePullAt(array, indexes) {
    var length = array ? indexes.length : 0;
    while (length--) {
      var index = indexes[length];
      if (index != previous && isIndex(index)) {
        var previous = index;
        splice.call(array, index, 1);
      }
    }
    return array;
  }

  /**
   * The base implementation of `_.random` without support for argument juggling
   * and returning floating-point numbers.
   *
   * @private
   * @param {number} min The minimum possible value.
   * @param {number} max The maximum possible value.
   * @returns {number} Returns the random number.
   */
  function baseRandom(min, max) {
    return min + nativeFloor(nativeRandom() * (max - min + 1));
  }

  /**
   * The base implementation of `_.reduce` and `_.reduceRight` without support
   * for callback shorthands and `this` binding, which iterates over `collection`
   * using the provided `eachFunc`.
   *
   * @private
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {*} accumulator The initial value.
   * @param {boolean} initFromCollection Specify using the first or last element
   *  of `collection` as the initial value.
   * @param {Function} eachFunc The function to iterate over `collection`.
   * @returns {*} Returns the accumulated value.
   */
  function baseReduce(collection, iteratee, accumulator, initFromCollection, eachFunc) {
    eachFunc(collection, function(value, index, collection) {
      accumulator = initFromCollection
        ? (initFromCollection = false, value)
        : iteratee(accumulator, value, index, collection);
    });
    return accumulator;
  }

  /**
   * The base implementation of `setData` without support for hot loop detection.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var baseSetData = !metaMap ? identity : function(func, data) {
    metaMap.set(func, data);
    return func;
  };

  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    start = start == null ? 0 : (+start || 0);
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = (end === undefined || end > length) ? length : (+end || 0);
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  /**
   * The base implementation of `_.sortBy` which uses `comparer` to define
   * the sort order of `array` and replaces criteria objects with their
   * corresponding values.
   *
   * @private
   * @param {Array} array The array to sort.
   * @param {Function} comparer The function to define sort order.
   * @returns {Array} Returns `array`.
   */
  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }

  /**
   * The base implementation of `_.uniq` without support for callback shorthands
   * and `this` binding.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The function invoked per iteration.
   * @returns {Array} Returns the new duplicate free array.
   */
  function baseUniq(array, iteratee) {
    var index = -1,
        indexOf = getIndexOf(),
        length = array.length,
        isCommon = indexOf === baseIndexOf,
        isLarge = isCommon && length >= LARGE_ARRAY_SIZE,
        seen = isLarge ? createCache() : null,
        result = [];

    if (seen) {
      indexOf = cacheIndexOf;
      isCommon = false;
    } else {
      isLarge = false;
      seen = iteratee ? [] : result;
    }
    outer:
    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value, index, array) : value;

      if (isCommon && value === value) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      }
      else if (indexOf(seen, computed, 0) < 0) {
        if (iteratee || isLarge) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }

  /**
   * The base implementation of `_.values` and `_.valuesIn` which creates an
   * array of `object` property values corresponding to the property names
   * of `props`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} props The property names to get values for.
   * @returns {Object} Returns the array of property values.
   */
  function baseValues(object, props) {
    var index = -1,
        length = props.length,
        result = Array(length);

    while (++index < length) {
      result[index] = object[props[index]];
    }
    return result;
  }

  /**
   * The base implementation of `wrapperValue` which returns the result of
   * performing a sequence of actions on the unwrapped `value`, where each
   * successive action is supplied the return value of the previous.
   *
   * @private
   * @param {*} value The unwrapped value.
   * @param {Array} actions Actions to peform to resolve the unwrapped value.
   * @returns {*} Returns the resolved value.
   */
  function baseWrapperValue(value, actions) {
    var result = value;
    if (result instanceof LazyWrapper) {
      result = result.value();
    }
    var index = -1,
        length = actions.length;

    while (++index < length) {
      var action = actions[index];
      result = action.func.apply(action.thisArg, arrayPush([result], action.args));
    }
    return result;
  }

  /**
   * Performs a binary search of `array` to determine the index at which `value`
   * should be inserted into `array` in order to maintain its sort order.
   *
   * @private
   * @param {Array} array The sorted array to inspect.
   * @param {*} value The value to evaluate.
   * @param {boolean} [retHighest] Specify returning the highest qualified index.
   * @returns {number} Returns the index at which `value` should be inserted
   *  into `array`.
   */
  function binaryIndex(array, value, retHighest) {
    var low = 0,
        high = array ? array.length : low;

    if (typeof value == 'number' && value === value && high <= HALF_MAX_ARRAY_LENGTH) {
      while (low < high) {
        var mid = (low + high) >>> 1,
            computed = array[mid];

        if ((retHighest ? (computed <= value) : (computed < value)) && computed !== null) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return high;
    }
    return binaryIndexBy(array, value, identity, retHighest);
  }

  /**
   * This function is like `binaryIndex` except that it invokes `iteratee` for
   * `value` and each element of `array` to compute their sort ranking. The
   * iteratee is invoked with one argument; (value).
   *
   * @private
   * @param {Array} array The sorted array to inspect.
   * @param {*} value The value to evaluate.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {boolean} [retHighest] Specify returning the highest qualified index.
   * @returns {number} Returns the index at which `value` should be inserted
   *  into `array`.
   */
  function binaryIndexBy(array, value, iteratee, retHighest) {
    value = iteratee(value);

    var low = 0,
        high = array ? array.length : 0,
        valIsNaN = value !== value,
        valIsNull = value === null,
        valIsUndef = value === undefined;

    while (low < high) {
      var mid = nativeFloor((low + high) / 2),
          computed = iteratee(array[mid]),
          isDef = computed !== undefined,
          isReflexive = computed === computed;

      if (valIsNaN) {
        var setLow = isReflexive || retHighest;
      } else if (valIsNull) {
        setLow = isReflexive && isDef && (retHighest || computed != null);
      } else if (valIsUndef) {
        setLow = isReflexive && (retHighest || isDef);
      } else if (computed == null) {
        setLow = false;
      } else {
        setLow = retHighest ? (computed <= value) : (computed < value);
      }
      if (setLow) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return nativeMin(high, MAX_ARRAY_INDEX);
  }

  /**
   * A specialized version of `baseCallback` which only supports `this` binding
   * and specifying the number of arguments to provide to `func`.
   *
   * @private
   * @param {Function} func The function to bind.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {number} [argCount] The number of arguments to provide to `func`.
   * @returns {Function} Returns the callback.
   */
  function bindCallback(func, thisArg, argCount) {
    if (typeof func != 'function') {
      return identity;
    }
    if (thisArg === undefined) {
      return func;
    }
    switch (argCount) {
      case 1: return function(value) {
        return func.call(thisArg, value);
      };
      case 3: return function(value, index, collection) {
        return func.call(thisArg, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(thisArg, accumulator, value, index, collection);
      };
      case 5: return function(value, other, key, object, source) {
        return func.call(thisArg, value, other, key, object, source);
      };
    }
    return function() {
      return func.apply(thisArg, arguments);
    };
  }

  /**
   * Creates a clone of the given array buffer.
   *
   * @private
   * @param {ArrayBuffer} buffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function bufferClone(buffer) {
    var result = new ArrayBuffer(buffer.byteLength),
        view = new Uint8Array(result);

    view.set(new Uint8Array(buffer));
    return result;
  }

  /**
   * Creates an array that is the composition of partially applied arguments,
   * placeholders, and provided arguments into a single array of arguments.
   *
   * @private
   * @param {Array|Object} args The provided arguments.
   * @param {Array} partials The arguments to prepend to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgs(args, partials, holders) {
    var holdersLength = holders.length,
        argsIndex = -1,
        argsLength = nativeMax(args.length - holdersLength, 0),
        leftIndex = -1,
        leftLength = partials.length,
        result = Array(leftLength + argsLength);

    while (++leftIndex < leftLength) {
      result[leftIndex] = partials[leftIndex];
    }
    while (++argsIndex < holdersLength) {
      result[holders[argsIndex]] = args[argsIndex];
    }
    while (argsLength--) {
      result[leftIndex++] = args[argsIndex++];
    }
    return result;
  }

  /**
   * This function is like `composeArgs` except that the arguments composition
   * is tailored for `_.partialRight`.
   *
   * @private
   * @param {Array|Object} args The provided arguments.
   * @param {Array} partials The arguments to append to those provided.
   * @param {Array} holders The `partials` placeholder indexes.
   * @returns {Array} Returns the new array of composed arguments.
   */
  function composeArgsRight(args, partials, holders) {
    var holdersIndex = -1,
        holdersLength = holders.length,
        argsIndex = -1,
        argsLength = nativeMax(args.length - holdersLength, 0),
        rightIndex = -1,
        rightLength = partials.length,
        result = Array(argsLength + rightLength);

    while (++argsIndex < argsLength) {
      result[argsIndex] = args[argsIndex];
    }
    var offset = argsIndex;
    while (++rightIndex < rightLength) {
      result[offset + rightIndex] = partials[rightIndex];
    }
    while (++holdersIndex < holdersLength) {
      result[offset + holders[holdersIndex]] = args[argsIndex++];
    }
    return result;
  }

  /**
   * Creates a `_.countBy`, `_.groupBy`, `_.indexBy`, or `_.partition` function.
   *
   * @private
   * @param {Function} setter The function to set keys and values of the accumulator object.
   * @param {Function} [initializer] The function to initialize the accumulator object.
   * @returns {Function} Returns the new aggregator function.
   */
  function createAggregator(setter, initializer) {
    return function(collection, iteratee, thisArg) {
      var result = initializer ? initializer() : {};
      iteratee = getCallback(iteratee, thisArg, 3);

      if (isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          setter(result, value, iteratee(value, index, collection), collection);
        }
      } else {
        baseEach(collection, function(value, key, collection) {
          setter(result, value, iteratee(value, key, collection), collection);
        });
      }
      return result;
    };
  }

  /**
   * Creates a `_.assign`, `_.defaults`, or `_.merge` function.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return restParam(function(object, sources) {
      var index = -1,
          length = object == null ? 0 : sources.length,
          customizer = length > 2 ? sources[length - 2] : undefined,
          guard = length > 2 ? sources[2] : undefined,
          thisArg = length > 1 ? sources[length - 1] : undefined;

      if (typeof customizer == 'function') {
        customizer = bindCallback(customizer, thisArg, 5);
        length -= 2;
      } else {
        customizer = typeof thisArg == 'function' ? thisArg : undefined;
        length -= (customizer ? 1 : 0);
      }
      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, customizer);
        }
      }
      return object;
    });
  }

  /**
   * Creates a `baseEach` or `baseEachRight` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      var length = collection ? getLength(collection) : 0;
      if (!isLength(length)) {
        return eachFunc(collection, iteratee);
      }
      var index = fromRight ? length : -1,
          iterable = toObject(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  /**
   * Creates a base function for `_.forIn` or `_.forInRight`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var iterable = toObject(object),
          props = keysFunc(object),
          length = props.length,
          index = fromRight ? length : -1;

      while ((fromRight ? index-- : ++index < length)) {
        var key = props[index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  /**
   * Creates a `Set` cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [values] The values to cache.
   * @returns {null|Object} Returns the new cache object if `Set` is supported, else `null`.
   */
  function createCache(values) {
    return (nativeCreate && Set) ? new SetCache(values) : null;
  }

  /**
   * Creates a function that produces compound words out of the words in a
   * given string.
   *
   * @private
   * @param {Function} callback The function to combine each word.
   * @returns {Function} Returns the new compounder function.
   */
  function createCompounder(callback) {
    return function(string) {
      var index = -1,
          array = words(deburr(string)),
          length = array.length,
          result = '';

      while (++index < length) {
        result = callback(result, array[index], index);
      }
      return result;
    };
  }

  /**
   * Creates a function that produces an instance of `Ctor` regardless of
   * whether it was invoked as part of a `new` expression or by `call` or `apply`.
   *
   * @private
   * @param {Function} Ctor The constructor to wrap.
   * @returns {Function} Returns the new wrapped function.
   */
  function createCtorWrapper(Ctor) {
    return function() {
      // Use a `switch` statement to work with class constructors.
      // See http://ecma-international.org/ecma-262/6.0/#sec-ecmascript-function-objects-call-thisargument-argumentslist
      // for more details.
      var args = arguments;
      switch (args.length) {
        case 0: return new Ctor;
        case 1: return new Ctor(args[0]);
        case 2: return new Ctor(args[0], args[1]);
        case 3: return new Ctor(args[0], args[1], args[2]);
        case 4: return new Ctor(args[0], args[1], args[2], args[3]);
        case 5: return new Ctor(args[0], args[1], args[2], args[3], args[4]);
        case 6: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
        case 7: return new Ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
      }
      var thisBinding = baseCreate(Ctor.prototype),
          result = Ctor.apply(thisBinding, args);

      // Mimic the constructor's `return` behavior.
      // See https://es5.github.io/#x13.2.2 for more details.
      return isObject(result) ? result : thisBinding;
    };
  }

  /**
   * Creates a `_.defaults` or `_.defaultsDeep` function.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @param {Function} customizer The function to customize assigned values.
   * @returns {Function} Returns the new defaults function.
   */
  function createDefaults(assigner, customizer) {
    return restParam(function(args) {
      var object = args[0];
      if (object == null) {
        return object;
      }
      args.push(customizer);
      return assigner.apply(undefined, args);
    });
  }

  /**
   * Creates a `_.find` or `_.findLast` function.
   *
   * @private
   * @param {Function} eachFunc The function to iterate over a collection.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new find function.
   */
  function createFind(eachFunc, fromRight) {
    return function(collection, predicate, thisArg) {
      predicate = getCallback(predicate, thisArg, 3);
      if (isArray(collection)) {
        var index = baseFindIndex(collection, predicate, fromRight);
        return index > -1 ? collection[index] : undefined;
      }
      return baseFind(collection, predicate, eachFunc);
    };
  }

  /**
   * Creates a `_.findKey` or `_.findLastKey` function.
   *
   * @private
   * @param {Function} objectFunc The function to iterate over an object.
   * @returns {Function} Returns the new find function.
   */
  function createFindKey(objectFunc) {
    return function(object, predicate, thisArg) {
      predicate = getCallback(predicate, thisArg, 3);
      return baseFind(object, predicate, objectFunc, true);
    };
  }

  /**
   * Creates a function for `_.forEach` or `_.forEachRight`.
   *
   * @private
   * @param {Function} arrayFunc The function to iterate over an array.
   * @param {Function} eachFunc The function to iterate over a collection.
   * @returns {Function} Returns the new each function.
   */
  function createForEach(arrayFunc, eachFunc) {
    return function(collection, iteratee, thisArg) {
      return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
        ? arrayFunc(collection, iteratee)
        : eachFunc(collection, bindCallback(iteratee, thisArg, 3));
    };
  }

  /**
   * Creates a function for `_.mapKeys` or `_.mapValues`.
   *
   * @private
   * @param {boolean} [isMapKeys] Specify mapping keys instead of values.
   * @returns {Function} Returns the new map function.
   */
  function createObjectMapper(isMapKeys) {
    return function(object, iteratee, thisArg) {
      var result = {};
      iteratee = getCallback(iteratee, thisArg, 3);

      baseForOwn(object, function(value, key, object) {
        var mapped = iteratee(value, key, object);
        key = isMapKeys ? mapped : key;
        value = isMapKeys ? value : mapped;
        result[key] = value;
      });
      return result;
    };
  }

  /**
   * Creates a function for `_.padLeft` or `_.padRight`.
   *
   * @private
   * @param {boolean} [fromRight] Specify padding from the right.
   * @returns {Function} Returns the new pad function.
   */
  function createPadDir(fromRight) {
    return function(string, length, chars) {
      string = baseToString(string);
      return (fromRight ? string : '') + createPadding(string, length, chars) + (fromRight ? '' : string);
    };
  }

  /**
   * Creates a function for `_.reduce` or `_.reduceRight`.
   *
   * @private
   * @param {Function} arrayFunc The function to iterate over an array.
   * @param {Function} eachFunc The function to iterate over a collection.
   * @returns {Function} Returns the new each function.
   */
  function createReduce(arrayFunc, eachFunc) {
    return function(collection, iteratee, accumulator, thisArg) {
      var initFromArray = arguments.length < 3;
      return (typeof iteratee == 'function' && thisArg === undefined && isArray(collection))
        ? arrayFunc(collection, iteratee, accumulator, initFromArray)
        : baseReduce(collection, getCallback(iteratee, thisArg, 4), accumulator, initFromArray, eachFunc);
    };
  }

  /**
   * Creates a function that wraps `func` and invokes it with optional `this`
   * binding of, partial application, and currying.
   *
   * @private
   * @param {Function|string} func The function or method name to reference.
   * @param {number} bitmask The bitmask of flags. See `createWrapper` for more details.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param {Array} [partials] The arguments to prepend to those provided to the new function.
   * @param {Array} [holders] The `partials` placeholder indexes.
   * @param {Array} [partialsRight] The arguments to append to those provided to the new function.
   * @param {Array} [holdersRight] The `partialsRight` placeholder indexes.
   * @param {Array} [argPos] The argument positions of the new function.
   * @param {number} [ary] The arity cap of `func`.
   * @param {number} [arity] The arity of `func`.
   * @returns {Function} Returns the new wrapped function.
   */
  function createHybridWrapper(func, bitmask, thisArg, partials, holders, partialsRight, holdersRight, argPos, ary, arity) {
    var isAry = bitmask & ARY_FLAG,
        isBind = bitmask & BIND_FLAG,
        isBindKey = bitmask & BIND_KEY_FLAG,
        isCurry = bitmask & CURRY_FLAG,
        isCurryBound = bitmask & CURRY_BOUND_FLAG,
        isCurryRight = bitmask & CURRY_RIGHT_FLAG,
        Ctor = isBindKey ? undefined : createCtorWrapper(func);

    function wrapper() {
      // Avoid `arguments` object use disqualifying optimizations by
      // converting it to an array before providing it to other functions.
      var length = arguments.length,
          index = length,
          args = Array(length);

      while (index--) {
        args[index] = arguments[index];
      }
      if (partials) {
        args = composeArgs(args, partials, holders);
      }
      if (partialsRight) {
        args = composeArgsRight(args, partialsRight, holdersRight);
      }
      if (isCurry || isCurryRight) {
        var placeholder = wrapper.placeholder,
            argsHolders = replaceHolders(args, placeholder);

        length -= argsHolders.length;
        if (length < arity) {
          var newArgPos = argPos ? arrayCopy(argPos) : undefined,
              newArity = nativeMax(arity - length, 0),
              newsHolders = isCurry ? argsHolders : undefined,
              newHoldersRight = isCurry ? undefined : argsHolders,
              newPartials = isCurry ? args : undefined,
              newPartialsRight = isCurry ? undefined : args;

          bitmask |= (isCurry ? PARTIAL_FLAG : PARTIAL_RIGHT_FLAG);
          bitmask &= ~(isCurry ? PARTIAL_RIGHT_FLAG : PARTIAL_FLAG);

          if (!isCurryBound) {
            bitmask &= ~(BIND_FLAG | BIND_KEY_FLAG);
          }
          var newData = [func, bitmask, thisArg, newPartials, newsHolders, newPartialsRight, newHoldersRight, newArgPos, ary, newArity],
              result = createHybridWrapper.apply(undefined, newData);

          if (isLaziable(func)) {
            setData(result, newData);
          }
          result.placeholder = placeholder;
          return result;
        }
      }
      var thisBinding = isBind ? thisArg : this,
          fn = isBindKey ? thisBinding[func] : func;

      if (argPos) {
        args = reorder(args, argPos);
      }
      if (isAry && ary < args.length) {
        args.length = ary;
      }
      if (this && this !== root && this instanceof wrapper) {
        fn = Ctor || createCtorWrapper(func);
      }
      return fn.apply(thisBinding, args);
    }
    return wrapper;
  }

  /**
   * Creates the padding required for `string` based on the given `length`.
   * The `chars` string is truncated if the number of characters exceeds `length`.
   *
   * @private
   * @param {string} string The string to create padding for.
   * @param {number} [length=0] The padding length.
   * @param {string} [chars=' '] The string used as padding.
   * @returns {string} Returns the pad for `string`.
   */
  function createPadding(string, length, chars) {
    var strLength = string.length;
    length = +length;

    if (strLength >= length || !nativeIsFinite(length)) {
      return '';
    }
    var padLength = length - strLength;
    chars = chars == null ? ' ' : (chars + '');
    return repeat(chars, nativeCeil(padLength / chars.length)).slice(0, padLength);
  }

  /**
   * A specialized version of `baseIsEqualDeep` for arrays with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Array} array The array to compare.
   * @param {Array} other The other array to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} [customizer] The function to customize comparing arrays.
   * @param {boolean} [isLoose] Specify performing partial comparisons.
   * @param {Array} [stackA] Tracks traversed `value` objects.
   * @param {Array} [stackB] Tracks traversed `other` objects.
   * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
   */
  function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var index = -1,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
      return false;
    }
    // Ignore non-index properties.
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index],
          result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

      if (result !== undefined) {
        if (result) {
          continue;
        }
        return false;
      }
      // Recursively compare arrays (susceptible to call stack limits).
      if (isLoose) {
        if (!arraySome(other, function(othValue) {
              return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
            })) {
          return false;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
        return false;
      }
    }
    return true;
  }

  /**
   * A specialized version of `baseIsEqualDeep` for comparing objects of
   * the same `toStringTag`.
   *
   * **Note:** This function only supports comparing values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {string} tag The `toStringTag` of the objects to compare.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalByTag(object, other, tag) {
    switch (tag) {
      case boolTag:
      case dateTag:
        // Coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
        return +object == +other;

      case errorTag:
        return object.name == other.name && object.message == other.message;

      case numberTag:
        // Treat `NaN` vs. `NaN` as equal.
        return (object != +object)
          ? other != +other
          : object == +other;

      case regexpTag:
      case stringTag:
        // Coerce regexes to strings and treat strings primitives and string
        // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
        return object == (other + '');
    }
    return false;
  }

  /**
   * A specialized version of `baseIsEqualDeep` for objects with support for
   * partial deep comparisons.
   *
   * @private
   * @param {Object} object The object to compare.
   * @param {Object} other The other object to compare.
   * @param {Function} equalFunc The function to determine equivalents of values.
   * @param {Function} [customizer] The function to customize comparing values.
   * @param {boolean} [isLoose] Specify performing partial comparisons.
   * @param {Array} [stackA] Tracks traversed `value` objects.
   * @param {Array} [stackB] Tracks traversed `other` objects.
   * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
   */
  function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
    var objProps = keys(object),
        objLength = objProps.length,
        othProps = keys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isLoose) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var skipCtor = isLoose;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key],
          result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

      // Recursively compare objects (susceptible to call stack limits).
      if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
        return false;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (!skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      // Non `Object` object instances with different constructors are not equal.
      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the appropriate "callback" function. If the `_.callback` method is
   * customized this function returns the custom method, otherwise it returns
   * the `baseCallback` function. If arguments are provided the chosen function
   * is invoked with them and its result is returned.
   *
   * @private
   * @returns {Function} Returns the chosen function or its result.
   */
  function getCallback(func, thisArg, argCount) {
    var result = lodash.callback || callback;
    result = result === callback ? baseCallback : result;
    return argCount ? result(func, thisArg, argCount) : result;
  }

  /**
   * Gets metadata for `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {*} Returns the metadata for `func`.
   */
  var getData = !metaMap ? noop : function(func) {
    return metaMap.get(func);
  };

  /**
   * Gets the name of `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {string} Returns the function name.
   */
  function getFuncName(func) {
    var result = (func.name + ''),
        array = realNames[result],
        length = array ? array.length : 0;

    while (length--) {
      var data = array[length],
          otherFunc = data.func;
      if (otherFunc == null || otherFunc == func) {
        return data.name;
      }
    }
    return result;
  }

  /**
   * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
   * customized this function returns the custom method, otherwise it returns
   * the `baseIndexOf` function. If arguments are provided the chosen function
   * is invoked with them and its result is returned.
   *
   * @private
   * @returns {Function|number} Returns the chosen function or its result.
   */
  function getIndexOf(collection, target, fromIndex) {
    var result = lodash.indexOf || indexOf;
    result = result === indexOf ? baseIndexOf : result;
    return collection ? result(collection, target, fromIndex) : result;
  }

  /**
   * Gets the "length" property value of `object`.
   *
   * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
   * that affects Safari on at least iOS 8.1-8.3 ARM64.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {*} Returns the "length" value.
   */
  var getLength = baseProperty('length');

  /**
   * Gets the propery names, values, and compare flags of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the match data of `object`.
   */
  function getMatchData(object) {
    var result = pairs(object),
        length = result.length;

    while (length--) {
      result[length][2] = isStrictComparable(result[length][1]);
    }
    return result;
  }

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = object == null ? undefined : object[key];
    return isNative(value) ? value : undefined;
  }

  /**
   * Gets the view, applying any `transforms` to the `start` and `end` positions.
   *
   * @private
   * @param {number} start The start of the view.
   * @param {number} end The end of the view.
   * @param {Array} transforms The transformations to apply to the view.
   * @returns {Object} Returns an object containing the `start` and `end`
   *  positions of the view.
   */
  function getView(start, end, transforms) {
    var index = -1,
        length = transforms.length;

    while (++index < length) {
      var data = transforms[index],
          size = data.size;

      switch (data.type) {
        case 'drop':      start += size; break;
        case 'dropRight': end -= size; break;
        case 'take':      end = nativeMin(end, start + size); break;
        case 'takeRight': start = nativeMax(start, end - size); break;
      }
    }
    return { 'start': start, 'end': end };
  }

  /**
   * Initializes an array clone.
   *
   * @private
   * @param {Array} array The array to clone.
   * @returns {Array} Returns the initialized clone.
   */
  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    // Add array properties assigned by `RegExp#exec`.
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    var Ctor = object.constructor;
    if (!(typeof Ctor == 'function' && Ctor instanceof Ctor)) {
      Ctor = Object;
    }
    return new Ctor;
  }

  /**
   * Initializes an object clone based on its `toStringTag`.
   *
   * **Note:** This function only supports cloning values with tags of
   * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
   *
   * @private
   * @param {Object} object The object to clone.
   * @param {string} tag The `toStringTag` of the object to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return bufferClone(object);

      case boolTag:
      case dateTag:
        return new Ctor(+object);

      case float32Tag: case float64Tag:
      case int8Tag: case int16Tag: case int32Tag:
      case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
        // Safari 5 mobile incorrectly has `Object` as the constructor of typed arrays.
        if (Ctor instanceof Ctor) {
          Ctor = ctorByTag[tag];
        }
        var buffer = object.buffer;
        return new Ctor(isDeep ? bufferClone(buffer) : buffer, object.byteOffset, object.length);

      case numberTag:
      case stringTag:
        return new Ctor(object);

      case regexpTag:
        var result = new Ctor(object.source, reFlags.exec(object));
        result.lastIndex = object.lastIndex;
    }
    return result;
  }

  /**
   * Checks if `value` is array-like.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   */
  function isArrayLike(value) {
    return value != null && isLength(getLength(value));
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
    length = length == null ? MAX_SAFE_INTEGER : length;
    return value > -1 && value % 1 == 0 && value < length;
  }

  /**
   * Checks if the provided arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)) {
      var other = object[index];
      return value === value ? (value === other) : (other !== other);
    }
    return false;
  }

  /**
   * Checks if `value` is a property name and not a property path.
   *
   * @private
   * @param {*} value The value to check.
   * @param {Object} [object] The object to query keys on.
   * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
   */
  function isKey(value, object) {
    var type = typeof value;
    if ((type == 'string' && reIsPlainProp.test(value)) || type == 'number') {
      return true;
    }
    if (isArray(value)) {
      return false;
    }
    var result = !reIsDeepProp.test(value);
    return result || (object != null && value in toObject(object));
  }

  /**
   * Checks if `func` has a lazy counterpart.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` has a lazy counterpart, else `false`.
   */
  function isLaziable(func) {
    var funcName = getFuncName(func),
        other = lodash[funcName];

    if (typeof other != 'function' || !(funcName in LazyWrapper.prototype)) {
      return false;
    }
    if (func === other) {
      return true;
    }
    var data = getData(other);
    return !!data && func === data[0];
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` if suitable for strict
   *  equality comparisons, else `false`.
   */
  function isStrictComparable(value) {
    return value === value && !isObject(value);
  }

  /**
   * A specialized version of `_.pick` which picks `object` properties specified
   * by `props`.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} props The property names to pick.
   * @returns {Object} Returns the new object.
   */
  function pickByArray(object, props) {
    object = toObject(object);

    var index = -1,
        length = props.length,
        result = {};

    while (++index < length) {
      var key = props[index];
      if (key in object) {
        result[key] = object[key];
      }
    }
    return result;
  }

  /**
   * A specialized version of `_.pick` which picks `object` properties `predicate`
   * returns truthy for.
   *
   * @private
   * @param {Object} object The source object.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Object} Returns the new object.
   */
  function pickByCallback(object, predicate) {
    var result = {};
    baseForIn(object, function(value, key, object) {
      if (predicate(value, key, object)) {
        result[key] = value;
      }
    });
    return result;
  }

  /**
   * Reorder `array` according to the specified indexes where the element at
   * the first index is assigned as the first element, the element at
   * the second index is assigned as the second element, and so on.
   *
   * @private
   * @param {Array} array The array to reorder.
   * @param {Array} indexes The arranged array indexes.
   * @returns {Array} Returns `array`.
   */
  function reorder(array, indexes) {
    var arrLength = array.length,
        length = nativeMin(indexes.length, arrLength),
        oldArray = arrayCopy(array);

    while (length--) {
      var index = indexes[length];
      array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
    }
    return array;
  }

  /**
   * Sets metadata for `func`.
   *
   * **Note:** If this function becomes hot, i.e. is invoked a lot in a short
   * period of time, it will trip its breaker and transition to an identity function
   * to avoid garbage collection pauses in V8. See [V8 issue 2070](https://code.google.com/p/v8/issues/detail?id=2070)
   * for more details.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var setData = (function() {
    var count = 0,
        lastCalled = 0;

    return function(key, value) {
      var stamp = now(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return key;
        }
      } else {
        count = 0;
      }
      return baseSetData(key, value);
    };
  }());

  /**
   * A fallback implementation of `Object.keys` which creates an array of the
   * own enumerable property names of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function shimKeys(object) {
    var props = keysIn(object),
        propsLength = props.length,
        length = propsLength && object.length;

    var allowIndexes = !!length && isLength(length) &&
      (isArray(object) || isArguments(object) || isString(object));

    var index = -1,
        result = [];

    while (++index < propsLength) {
      var key = props[index];
      if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
        result.push(key);
      }
    }
    return result;
  }

  /**
   * Converts `value` to an array-like object if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Array|Object} Returns the array-like object.
   */
  function toIterable(value) {
    if (value == null) {
      return [];
    }
    if (!isArrayLike(value)) {
      return values(value);
    }
    if (lodash.support.unindexedChars && isString(value)) {
      return value.split('');
    }
    return isObject(value) ? value : Object(value);
  }

  /**
   * Converts `value` to an object if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Object} Returns the object.
   */
  function toObject(value) {
    if (lodash.support.unindexedChars && isString(value)) {
      var index = -1,
          length = value.length,
          result = Object(value);

      while (++index < length) {
        result[index] = value.charAt(index);
      }
      return result;
    }
    return isObject(value) ? value : Object(value);
  }

  /**
   * Converts `value` to property path array if it's not one.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {Array} Returns the property path array.
   */
  function toPath(value) {
    if (isArray(value)) {
      return value;
    }
    var result = [];
    baseToString(value).replace(rePropName, function(match, number, quote, string) {
      result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  }

  /**
   * Creates a clone of `wrapper`.
   *
   * @private
   * @param {Object} wrapper The wrapper to clone.
   * @returns {Object} Returns the cloned wrapper.
   */
  function wrapperClone(wrapper) {
    return wrapper instanceof LazyWrapper
      ? wrapper.clone()
      : new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__, arrayCopy(wrapper.__actions__));
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates an array of elements split into groups the length of `size`.
   * If `collection` can't be split evenly, the final chunk will be the remaining
   * elements.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to process.
   * @param {number} [size=1] The length of each chunk.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {Array} Returns the new array containing chunks.
   * @example
   *
   * _.chunk(['a', 'b', 'c', 'd'], 2);
   * // => [['a', 'b'], ['c', 'd']]
   *
   * _.chunk(['a', 'b', 'c', 'd'], 3);
   * // => [['a', 'b', 'c'], ['d']]
   */
  function chunk(array, size, guard) {
    if (guard ? isIterateeCall(array, size, guard) : size == null) {
      size = 1;
    } else {
      size = nativeMax(nativeFloor(size) || 1, 1);
    }
    var index = 0,
        length = array ? array.length : 0,
        resIndex = -1,
        result = Array(nativeCeil(length / size));

    while (index < length) {
      result[++resIndex] = baseSlice(array, index, (index += size));
    }
    return result;
  }

  /**
   * Creates a slice of `array` with `n` elements dropped from the beginning.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to query.
   * @param {number} [n=1] The number of elements to drop.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {Array} Returns the slice of `array`.
   * @example
   *
   * _.drop([1, 2, 3]);
   * // => [2, 3]
   *
   * _.drop([1, 2, 3], 2);
   * // => [3]
   *
   * _.drop([1, 2, 3], 5);
   * // => []
   *
   * _.drop([1, 2, 3], 0);
   * // => [1, 2, 3]
   */
  function drop(array, n, guard) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (guard ? isIterateeCall(array, n, guard) : n == null) {
      n = 1;
    }
    return baseSlice(array, n < 0 ? 0 : n);
  }

  /**
   * Gets the first element of `array`.
   *
   * @static
   * @memberOf _
   * @alias head
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the first element of `array`.
   * @example
   *
   * _.first([1, 2, 3]);
   * // => 1
   *
   * _.first([]);
   * // => undefined
   */
  function first(array) {
    return array ? array[0] : undefined;
  }

  /**
   * Flattens a nested array. If `isDeep` is `true` the array is recursively
   * flattened, otherwise it's only flattened a single level.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to flatten.
   * @param {boolean} [isDeep] Specify a deep flatten.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {Array} Returns the new flattened array.
   * @example
   *
   * _.flatten([1, [2, 3, [4]]]);
   * // => [1, 2, 3, [4]]
   *
   * // using `isDeep`
   * _.flatten([1, [2, 3, [4]]], true);
   * // => [1, 2, 3, 4]
   */
  function flatten(array, isDeep, guard) {
    var length = array ? array.length : 0;
    if (guard && isIterateeCall(array, isDeep, guard)) {
      isDeep = false;
    }
    return length ? baseFlatten(array, isDeep) : [];
  }

  /**
   * Gets the index at which the first occurrence of `value` is found in `array`
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons. If `fromIndex` is negative, it's used as the offset
   * from the end of `array`. If `array` is sorted providing `true` for `fromIndex`
   * performs a faster binary search.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {boolean|number} [fromIndex=0] The index to search from or `true`
   *  to perform a binary search on a sorted array.
   * @returns {number} Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.indexOf([1, 2, 1, 2], 2);
   * // => 1
   *
   * // using `fromIndex`
   * _.indexOf([1, 2, 1, 2], 2, 2);
   * // => 3
   *
   * // performing a binary search
   * _.indexOf([1, 1, 2, 2], 2, true);
   * // => 2
   */
  function indexOf(array, value, fromIndex) {
    var length = array ? array.length : 0;
    if (!length) {
      return -1;
    }
    if (typeof fromIndex == 'number') {
      fromIndex = fromIndex < 0 ? nativeMax(length + fromIndex, 0) : fromIndex;
    } else if (fromIndex) {
      var index = binaryIndex(array, value);
      if (index < length &&
          (value === value ? (value === array[index]) : (array[index] !== array[index]))) {
        return index;
      }
      return -1;
    }
    return baseIndexOf(array, value, fromIndex || 0);
  }

  /**
   * Gets the last element of `array`.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to query.
   * @returns {*} Returns the last element of `array`.
   * @example
   *
   * _.last([1, 2, 3]);
   * // => 3
   */
  function last(array) {
    var length = array ? array.length : 0;
    return length ? array[length - 1] : undefined;
  }

  /**
   * Removes elements from `array` corresponding to the given indexes and returns
   * an array of the removed elements. Indexes may be specified as an array of
   * indexes or as individual arguments.
   *
   * **Note:** Unlike `_.at`, this method mutates `array`.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to modify.
   * @param {...(number|number[])} [indexes] The indexes of elements to remove,
   *  specified as individual indexes or arrays of indexes.
   * @returns {Array} Returns the new array of removed elements.
   * @example
   *
   * var array = [5, 10, 15, 20];
   * var evens = _.pullAt(array, 1, 3);
   *
   * console.log(array);
   * // => [5, 15]
   *
   * console.log(evens);
   * // => [10, 20]
   */
  var pullAt = restParam(function(array, indexes) {
    indexes = baseFlatten(indexes);

    var result = baseAt(array, indexes);
    basePullAt(array, indexes.sort(baseCompareAscending));
    return result;
  });

  /**
   * Removes all elements from `array` that `predicate` returns truthy for
   * and returns an array of the removed elements. The predicate is bound to
   * `thisArg` and invoked with three arguments: (value, index, array).
   *
   * If a property name is provided for `predicate` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `predicate` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * **Note:** Unlike `_.filter`, this method mutates `array`.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to modify.
   * @param {Function|Object|string} [predicate=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {Array} Returns the new array of removed elements.
   * @example
   *
   * var array = [1, 2, 3, 4];
   * var evens = _.remove(array, function(n) {
   *   return n % 2 == 0;
   * });
   *
   * console.log(array);
   * // => [1, 3]
   *
   * console.log(evens);
   * // => [2, 4]
   */
  function remove(array, predicate, thisArg) {
    var result = [];
    if (!(array && array.length)) {
      return result;
    }
    var index = -1,
        indexes = [],
        length = array.length;

    predicate = getCallback(predicate, thisArg, 3);
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result.push(value);
        indexes.push(index);
      }
    }
    basePullAt(array, indexes);
    return result;
  }

  /**
   * Creates a duplicate-free version of an array, using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons, in which only the first occurence of each element
   * is kept. Providing `true` for `isSorted` performs a faster search algorithm
   * for sorted arrays. If an iteratee function is provided it's invoked for
   * each element in the array to generate the criterion by which uniqueness
   * is computed. The `iteratee` is bound to `thisArg` and invoked with three
   * arguments: (value, index, array).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @alias unique
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {boolean} [isSorted] Specify the array is sorted.
   * @param {Function|Object|string} [iteratee] The function invoked per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Array} Returns the new duplicate-value-free array.
   * @example
   *
   * _.uniq([2, 1, 2]);
   * // => [2, 1]
   *
   * // using `isSorted`
   * _.uniq([1, 1, 2], true);
   * // => [1, 2]
   *
   * // using an iteratee function
   * _.uniq([1, 2.5, 1.5, 2], function(n) {
   *   return this.floor(n);
   * }, Math);
   * // => [1, 2.5]
   *
   * // using the `_.property` callback shorthand
   * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
   * // => [{ 'x': 1 }, { 'x': 2 }]
   */
  function uniq(array, isSorted, iteratee, thisArg) {
    var length = array ? array.length : 0;
    if (!length) {
      return [];
    }
    if (isSorted != null && typeof isSorted != 'boolean') {
      thisArg = iteratee;
      iteratee = isIterateeCall(array, isSorted, thisArg) ? undefined : isSorted;
      isSorted = false;
    }
    var callback = getCallback();
    if (!(iteratee == null && callback === baseCallback)) {
      iteratee = callback(iteratee, thisArg, 3);
    }
    return (isSorted && getIndexOf() === baseIndexOf)
      ? sortedUniq(array, iteratee)
      : baseUniq(array, iteratee);
  }

  /**
   * Creates an array excluding all provided values using
   * [`SameValueZero`](http://ecma-international.org/ecma-262/6.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @static
   * @memberOf _
   * @category Array
   * @param {Array} array The array to filter.
   * @param {...*} [values] The values to exclude.
   * @returns {Array} Returns the new array of filtered values.
   * @example
   *
   * _.without([1, 2, 1, 3], 1, 2);
   * // => [3]
   */
  var without = restParam(function(array, values) {
    return isArrayLike(array)
      ? baseDifference(array, values)
      : [];
  });

  /**
   * The inverse of `_.pairs`; this method returns an object composed from arrays
   * of property names and values. Provide either a single two dimensional array,
   * e.g. `[[key1, value1], [key2, value2]]` or two arrays, one of property names
   * and one of corresponding values.
   *
   * @static
   * @memberOf _
   * @alias object
   * @category Array
   * @param {Array} props The property names.
   * @param {Array} [values=[]] The property values.
   * @returns {Object} Returns the new object.
   * @example
   *
   * _.zipObject([['fred', 30], ['barney', 40]]);
   * // => { 'fred': 30, 'barney': 40 }
   *
   * _.zipObject(['fred', 'barney'], [30, 40]);
   * // => { 'fred': 30, 'barney': 40 }
   */
  function zipObject(props, values) {
    var index = -1,
        length = props ? props.length : 0,
        result = {};

    if (length && !values && !isArray(props[0])) {
      values = [];
    }
    while (++index < length) {
      var key = props[index];
      if (values) {
        result[key] = values[index];
      } else if (key) {
        result[key[0]] = key[1];
      }
    }
    return result;
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a `lodash` object that wraps `value` with explicit method
   * chaining enabled.
   *
   * @static
   * @memberOf _
   * @category Chain
   * @param {*} value The value to wrap.
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'age': 36 },
   *   { 'user': 'fred',    'age': 40 },
   *   { 'user': 'pebbles', 'age': 1 }
   * ];
   *
   * var youngest = _.chain(users)
   *   .sortBy('age')
   *   .map(function(chr) {
   *     return chr.user + ' is ' + chr.age;
   *   })
   *   .first()
   *   .value();
   * // => 'pebbles is 1'
   */
  function chain(value) {
    var result = lodash(value);
    result.__chain__ = true;
    return result;
  }

  /**
   * This method invokes `interceptor` and returns `value`. The interceptor is
   * bound to `thisArg` and invoked with one argument; (value). The purpose of
   * this method is to "tap into" a method chain in order to perform operations
   * on intermediate results within the chain.
   *
   * @static
   * @memberOf _
   * @category Chain
   * @param {*} value The value to provide to `interceptor`.
   * @param {Function} interceptor The function to invoke.
   * @param {*} [thisArg] The `this` binding of `interceptor`.
   * @returns {*} Returns `value`.
   * @example
   *
   * _([1, 2, 3])
   *  .tap(function(array) {
   *    array.pop();
   *  })
   *  .reverse()
   *  .value();
   * // => [2, 1]
   */
  function tap(value, interceptor, thisArg) {
    interceptor.call(thisArg, value);
    return value;
  }

  /**
   * This method is like `_.tap` except that it returns the result of `interceptor`.
   *
   * @static
   * @memberOf _
   * @category Chain
   * @param {*} value The value to provide to `interceptor`.
   * @param {Function} interceptor The function to invoke.
   * @param {*} [thisArg] The `this` binding of `interceptor`.
   * @returns {*} Returns the result of `interceptor`.
   * @example
   *
   * _('  abc  ')
   *  .chain()
   *  .trim()
   *  .thru(function(value) {
   *    return [value];
   *  })
   *  .value();
   * // => ['abc']
   */
  function thru(value, interceptor, thisArg) {
    return interceptor.call(thisArg, value);
  }

  /**
   * Enables explicit method chaining on the wrapper object.
   *
   * @name chain
   * @memberOf _
   * @category Chain
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 }
   * ];
   *
   * // without explicit chaining
   * _(users).first();
   * // => { 'user': 'barney', 'age': 36 }
   *
   * // with explicit chaining
   * _(users).chain()
   *   .first()
   *   .pick('user')
   *   .value();
   * // => { 'user': 'barney' }
   */
  function wrapperChain() {
    return chain(this);
  }

  /**
   * Executes the chained sequence and returns the wrapped result.
   *
   * @name commit
   * @memberOf _
   * @category Chain
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var array = [1, 2];
   * var wrapped = _(array).push(3);
   *
   * console.log(array);
   * // => [1, 2]
   *
   * wrapped = wrapped.commit();
   * console.log(array);
   * // => [1, 2, 3]
   *
   * wrapped.last();
   * // => 3
   *
   * console.log(array);
   * // => [1, 2, 3]
   */
  function wrapperCommit() {
    return new LodashWrapper(this.value(), this.__chain__);
  }

  /**
   * Creates a new array joining a wrapped array with any additional arrays
   * and/or values.
   *
   * @name concat
   * @memberOf _
   * @category Chain
   * @param {...*} [values] The values to concatenate.
   * @returns {Array} Returns the new concatenated array.
   * @example
   *
   * var array = [1];
   * var wrapped = _(array).concat(2, [3], [[4]]);
   *
   * console.log(wrapped.value());
   * // => [1, 2, 3, [4]]
   *
   * console.log(array);
   * // => [1]
   */
  var wrapperConcat = restParam(function(values) {
    values = baseFlatten(values);
    return this.thru(function(array) {
      return arrayConcat(isArray(array) ? array : [toObject(array)], values);
    });
  });

  /**
   * Creates a clone of the chained sequence planting `value` as the wrapped value.
   *
   * @name plant
   * @memberOf _
   * @category Chain
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var array = [1, 2];
   * var wrapped = _(array).map(function(value) {
   *   return Math.pow(value, 2);
   * });
   *
   * var other = [3, 4];
   * var otherWrapped = wrapped.plant(other);
   *
   * otherWrapped.value();
   * // => [9, 16]
   *
   * wrapped.value();
   * // => [1, 4]
   */
  function wrapperPlant(value) {
    var result,
        parent = this;

    while (parent instanceof baseLodash) {
      var clone = wrapperClone(parent);
      if (result) {
        previous.__wrapped__ = clone;
      } else {
        result = clone;
      }
      var previous = clone;
      parent = parent.__wrapped__;
    }
    previous.__wrapped__ = value;
    return result;
  }

  /**
   * Reverses the wrapped array so the first element becomes the last, the
   * second element becomes the second to last, and so on.
   *
   * **Note:** This method mutates the wrapped array.
   *
   * @name reverse
   * @memberOf _
   * @category Chain
   * @returns {Object} Returns the new reversed `lodash` wrapper instance.
   * @example
   *
   * var array = [1, 2, 3];
   *
   * _(array).reverse().value()
   * // => [3, 2, 1]
   *
   * console.log(array);
   * // => [3, 2, 1]
   */
  function wrapperReverse() {
    var value = this.__wrapped__;

    var interceptor = function(value) {
      return value.reverse();
    };
    if (value instanceof LazyWrapper) {
      var wrapped = value;
      if (this.__actions__.length) {
        wrapped = new LazyWrapper(this);
      }
      wrapped = wrapped.reverse();
      wrapped.__actions__.push({ 'func': thru, 'args': [interceptor], 'thisArg': undefined });
      return new LodashWrapper(wrapped, this.__chain__);
    }
    return this.thru(interceptor);
  }

  /**
   * Produces the result of coercing the unwrapped value to a string.
   *
   * @name toString
   * @memberOf _
   * @category Chain
   * @returns {string} Returns the coerced string value.
   * @example
   *
   * _([1, 2, 3]).toString();
   * // => '1,2,3'
   */
  function wrapperToString() {
    return (this.value() + '');
  }

  /**
   * Executes the chained sequence to extract the unwrapped value.
   *
   * @name value
   * @memberOf _
   * @alias run, toJSON, valueOf
   * @category Chain
   * @returns {*} Returns the resolved unwrapped value.
   * @example
   *
   * _([1, 2, 3]).value();
   * // => [1, 2, 3]
   */
  function wrapperValue() {
    return baseWrapperValue(this.__wrapped__, this.__actions__);
  }

  /*------------------------------------------------------------------------*/

  /**
   * Iterates over elements of `collection`, returning an array of all elements
   * `predicate` returns truthy for. The predicate is bound to `thisArg` and
   * invoked with three arguments: (value, index|key, collection).
   *
   * If a property name is provided for `predicate` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `predicate` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @alias select
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [predicate=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {Array} Returns the new filtered array.
   * @example
   *
   * _.filter([4, 5, 6], function(n) {
   *   return n % 2 == 0;
   * });
   * // => [4, 6]
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // using the `_.matches` callback shorthand
   * _.pluck(_.filter(users, { 'age': 36, 'active': true }), 'user');
   * // => ['barney']
   *
   * // using the `_.matchesProperty` callback shorthand
   * _.pluck(_.filter(users, 'active', false), 'user');
   * // => ['fred']
   *
   * // using the `_.property` callback shorthand
   * _.pluck(_.filter(users, 'active'), 'user');
   * // => ['barney']
   */
  function filter(collection, predicate, thisArg) {
    var func = isArray(collection) ? arrayFilter : baseFilter;
    predicate = getCallback(predicate, thisArg, 3);
    return func(collection, predicate);
  }

  /**
   * Iterates over elements of `collection`, returning the first element
   * `predicate` returns truthy for. The predicate is bound to `thisArg` and
   * invoked with three arguments: (value, index|key, collection).
   *
   * If a property name is provided for `predicate` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `predicate` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @alias detect
   * @category Collection
   * @param {Array|Object|string} collection The collection to search.
   * @param {Function|Object|string} [predicate=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {*} Returns the matched element, else `undefined`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'age': 36, 'active': true },
   *   { 'user': 'fred',    'age': 40, 'active': false },
   *   { 'user': 'pebbles', 'age': 1,  'active': true }
   * ];
   *
   * _.result(_.find(users, function(chr) {
   *   return chr.age < 40;
   * }), 'user');
   * // => 'barney'
   *
   * // using the `_.matches` callback shorthand
   * _.result(_.find(users, { 'age': 1, 'active': true }), 'user');
   * // => 'pebbles'
   *
   * // using the `_.matchesProperty` callback shorthand
   * _.result(_.find(users, 'active', false), 'user');
   * // => 'fred'
   *
   * // using the `_.property` callback shorthand
   * _.result(_.find(users, 'active'), 'user');
   * // => 'barney'
   */
  var find = createFind(baseEach);

  /**
   * Iterates over elements of `collection` invoking `iteratee` for each element.
   * The `iteratee` is bound to `thisArg` and invoked with three arguments:
   * (value, index|key, collection). Iteratee functions may exit iteration early
   * by explicitly returning `false`.
   *
   * **Note:** As with other "Collections" methods, objects with a "length" property
   * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
   * may be used for object iteration.
   *
   * @static
   * @memberOf _
   * @alias each
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Array|Object|string} Returns `collection`.
   * @example
   *
   * _([1, 2]).forEach(function(n) {
   *   console.log(n);
   * }).value();
   * // => logs each value from left to right and returns the array
   *
   * _.forEach({ 'a': 1, 'b': 2 }, function(n, key) {
   *   console.log(n, key);
   * });
   * // => logs each value-key pair and returns the object (iteration order is not guaranteed)
   */
  var forEach = createForEach(arrayEach, baseEach);

  /**
   * Creates an object composed of keys generated from the results of running
   * each element of `collection` through `iteratee`. The corresponding value
   * of each key is an array of the elements responsible for generating the key.
   * The `iteratee` is bound to `thisArg` and invoked with three arguments:
   * (value, index|key, collection).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Object} Returns the composed aggregate object.
   * @example
   *
   * _.groupBy([4.2, 6.1, 6.4], function(n) {
   *   return Math.floor(n);
   * });
   * // => { '4': [4.2], '6': [6.1, 6.4] }
   *
   * _.groupBy([4.2, 6.1, 6.4], function(n) {
   *   return this.floor(n);
   * }, Math);
   * // => { '4': [4.2], '6': [6.1, 6.4] }
   *
   * // using the `_.property` callback shorthand
   * _.groupBy(['one', 'two', 'three'], 'length');
   * // => { '3': ['one', 'two'], '5': ['three'] }
   */
  var groupBy = createAggregator(function(result, value, key) {
    if (hasOwnProperty.call(result, key)) {
      result[key].push(value);
    } else {
      result[key] = [value];
    }
  });

  /**
   * Creates an object composed of keys generated from the results of running
   * each element of `collection` through `iteratee`. The corresponding value
   * of each key is the last element responsible for generating the key. The
   * iteratee function is bound to `thisArg` and invoked with three arguments:
   * (value, index|key, collection).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Object} Returns the composed aggregate object.
   * @example
   *
   * var keyData = [
   *   { 'dir': 'left', 'code': 97 },
   *   { 'dir': 'right', 'code': 100 }
   * ];
   *
   * _.indexBy(keyData, 'dir');
   * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
   *
   * _.indexBy(keyData, function(object) {
   *   return String.fromCharCode(object.code);
   * });
   * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
   *
   * _.indexBy(keyData, function(object) {
   *   return this.fromCharCode(object.code);
   * }, String);
   * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
   */
  var indexBy = createAggregator(function(result, value, key) {
    result[key] = value;
  });

  /**
   * Creates an array of values by running each element in `collection` through
   * `iteratee`. The `iteratee` is bound to `thisArg` and invoked with three
   * arguments: (value, index|key, collection).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
   *
   * The guarded methods are:
   * `ary`, `callback`, `chunk`, `clone`, `create`, `curry`, `curryRight`,
   * `drop`, `dropRight`, `every`, `fill`, `flatten`, `invert`, `max`, `min`,
   * `parseInt`, `slice`, `sortBy`, `take`, `takeRight`, `template`, `trim`,
   * `trimLeft`, `trimRight`, `trunc`, `random`, `range`, `sample`, `some`,
   * `sum`, `uniq`, and `words`
   *
   * @static
   * @memberOf _
   * @alias collect
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Array} Returns the new mapped array.
   * @example
   *
   * function timesThree(n) {
   *   return n * 3;
   * }
   *
   * _.map([1, 2], timesThree);
   * // => [3, 6]
   *
   * _.map({ 'a': 1, 'b': 2 }, timesThree);
   * // => [3, 6] (iteration order is not guaranteed)
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * // using the `_.property` callback shorthand
   * _.map(users, 'user');
   * // => ['barney', 'fred']
   */
  function map(collection, iteratee, thisArg) {
    var func = isArray(collection) ? arrayMap : baseMap;
    iteratee = getCallback(iteratee, thisArg, 3);
    return func(collection, iteratee);
  }

  /**
   * Gets the property value of `path` from all elements in `collection`.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Array|string} path The path of the property to pluck.
   * @returns {Array} Returns the property values.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 }
   * ];
   *
   * _.pluck(users, 'user');
   * // => ['barney', 'fred']
   *
   * var userIndex = _.indexBy(users, 'user');
   * _.pluck(userIndex, 'age');
   * // => [36, 40] (iteration order is not guaranteed)
   */
  function pluck(collection, path) {
    return map(collection, property(path));
  }

  /**
   * Reduces `collection` to a value which is the accumulated result of running
   * each element in `collection` through `iteratee`, where each successive
   * invocation is supplied the return value of the previous. If `accumulator`
   * is not provided the first element of `collection` is used as the initial
   * value. The `iteratee` is bound to `thisArg` and invoked with four arguments:
   * (accumulator, value, index|key, collection).
   *
   * Many lodash methods are guarded to work as iteratees for methods like
   * `_.reduce`, `_.reduceRight`, and `_.transform`.
   *
   * The guarded methods are:
   * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `sortByAll`,
   * and `sortByOrder`
   *
   * @static
   * @memberOf _
   * @alias foldl, inject
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The initial value.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {*} Returns the accumulated value.
   * @example
   *
   * _.reduce([1, 2], function(total, n) {
   *   return total + n;
   * });
   * // => 3
   *
   * _.reduce({ 'a': 1, 'b': 2 }, function(result, n, key) {
   *   result[key] = n * 3;
   *   return result;
   * }, {});
   * // => { 'a': 3, 'b': 6 } (iteration order is not guaranteed)
   */
  var reduce = createReduce(arrayReduce, baseEach);

  /**
   * The opposite of `_.filter`; this method returns the elements of `collection`
   * that `predicate` does **not** return truthy for.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [predicate=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {Array} Returns the new filtered array.
   * @example
   *
   * _.reject([1, 2, 3, 4], function(n) {
   *   return n % 2 == 0;
   * });
   * // => [1, 3]
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': false },
   *   { 'user': 'fred',   'age': 40, 'active': true }
   * ];
   *
   * // using the `_.matches` callback shorthand
   * _.pluck(_.reject(users, { 'age': 40, 'active': true }), 'user');
   * // => ['barney']
   *
   * // using the `_.matchesProperty` callback shorthand
   * _.pluck(_.reject(users, 'active', false), 'user');
   * // => ['fred']
   *
   * // using the `_.property` callback shorthand
   * _.pluck(_.reject(users, 'active'), 'user');
   * // => ['barney']
   */
  function reject(collection, predicate, thisArg) {
    var func = isArray(collection) ? arrayFilter : baseFilter;
    predicate = getCallback(predicate, thisArg, 3);
    return func(collection, function(value, index, collection) {
      return !predicate(value, index, collection);
    });
  }

  /**
   * Gets a random element or `n` random elements from a collection.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to sample.
   * @param {number} [n] The number of elements to sample.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {*} Returns the random sample(s).
   * @example
   *
   * _.sample([1, 2, 3, 4]);
   * // => 2
   *
   * _.sample([1, 2, 3, 4], 2);
   * // => [3, 1]
   */
  function sample(collection, n, guard) {
    if (guard ? isIterateeCall(collection, n, guard) : n == null) {
      collection = toIterable(collection);
      var length = collection.length;
      return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
    }
    var index = -1,
        result = toArray(collection),
        length = result.length,
        lastIndex = length - 1;

    n = nativeMin(n < 0 ? 0 : (+n || 0), length);
    while (++index < n) {
      var rand = baseRandom(index, lastIndex),
          value = result[rand];

      result[rand] = result[index];
      result[index] = value;
    }
    result.length = n;
    return result;
  }

  /**
   * Creates an array of shuffled values, using a version of the
   * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to shuffle.
   * @returns {Array} Returns the new shuffled array.
   * @example
   *
   * _.shuffle([1, 2, 3, 4]);
   * // => [4, 1, 3, 2]
   */
  function shuffle(collection) {
    return sample(collection, POSITIVE_INFINITY);
  }

  /**
   * Gets the size of `collection` by returning its length for array-like
   * values or the number of own enumerable properties for objects.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to inspect.
   * @returns {number} Returns the size of `collection`.
   * @example
   *
   * _.size([1, 2, 3]);
   * // => 3
   *
   * _.size({ 'a': 1, 'b': 2 });
   * // => 2
   *
   * _.size('pebbles');
   * // => 7
   */
  function size(collection) {
    var length = collection ? getLength(collection) : 0;
    return isLength(length) ? length : keys(collection).length;
  }

  /**
   * Creates an array of elements, sorted in ascending order by the results of
   * running each element in a collection through `iteratee`. This method performs
   * a stable sort, that is, it preserves the original sort order of equal elements.
   * The `iteratee` is bound to `thisArg` and invoked with three arguments:
   * (value, index|key, collection).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @category Collection
   * @param {Array|Object|string} collection The collection to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Array} Returns the new sorted array.
   * @example
   *
   * _.sortBy([1, 2, 3], function(n) {
   *   return Math.sin(n);
   * });
   * // => [3, 1, 2]
   *
   * _.sortBy([1, 2, 3], function(n) {
   *   return this.sin(n);
   * }, Math);
   * // => [3, 1, 2]
   *
   * var users = [
   *   { 'user': 'fred' },
   *   { 'user': 'pebbles' },
   *   { 'user': 'barney' }
   * ];
   *
   * // using the `_.property` callback shorthand
   * _.pluck(_.sortBy(users, 'user'), 'user');
   * // => ['barney', 'fred', 'pebbles']
   */
  function sortBy(collection, iteratee, thisArg) {
    if (collection == null) {
      return [];
    }
    if (thisArg && isIterateeCall(collection, iteratee, thisArg)) {
      iteratee = undefined;
    }
    var index = -1;
    iteratee = getCallback(iteratee, thisArg, 3);

    var result = baseMap(collection, function(value, key, collection) {
      return { 'criteria': iteratee(value, key, collection), 'index': ++index, 'value': value };
    });
    return baseSortBy(result, compareAscending);
  }

  /*------------------------------------------------------------------------*/

  /**
   * Gets the number of milliseconds that have elapsed since the Unix epoch
   * (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @category Date
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => logs the number of milliseconds it took for the deferred function to be invoked
   */
  var now = nativeNow || function() {
    return new Date().getTime();
  };

  /*------------------------------------------------------------------------*/

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed invocations. Provide an options object to indicate that `func`
   * should be invoked on the leading and/or trailing edge of the `wait` timeout.
   * Subsequent calls to the debounced function return the result of the last
   * `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is invoked
   * on the trailing edge of the timeout only if the the debounced function is
   * invoked more than once during the `wait` timeout.
   *
   * See [David Corbacho's article](http://drupalmotion.com/article/debounce-and-throttle-visual-explanation)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.leading=false] Specify invoking on the leading
   *  edge of the timeout.
   * @param {number} [options.maxWait] The maximum time `func` is allowed to be
   *  delayed before it's invoked.
   * @param {boolean} [options.trailing=true] Specify invoking on the trailing
   *  edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // avoid costly calculations while the window size is in flux
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // invoke `sendMail` when the click event is fired, debouncing subsequent calls
   * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // ensure `batchLog` is invoked once after 1 second of debounced calls
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', _.debounce(batchLog, 250, {
   *   'maxWait': 1000
   * }));
   *
   * // cancel a debounced call
   * var todoChanges = _.debounce(batchLog, 1000);
   * Object.observe(models.todo, todoChanges);
   *
   * Object.observe(models, function(changes) {
   *   if (_.find(changes, { 'user': 'todo', 'type': 'delete'})) {
   *     todoChanges.cancel();
   *   }
   * }, ['delete']);
   *
   * // ...at some point `models.todo` is changed
   * models.todo.completed = true;
   *
   * // ...before 1 second has passed `models.todo` is deleted
   * // which cancels the debounced `todoChanges` call
   * delete models.todo;
   */
  function debounce(func, wait, options) {
    var args,
        maxTimeoutId,
        result,
        stamp,
        thisArg,
        timeoutId,
        trailingCall,
        lastCalled = 0,
        maxWait = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = wait < 0 ? 0 : (+wait || 0);
    if (options === true) {
      var leading = true;
      trailing = false;
    } else if (isObject(options)) {
      leading = !!options.leading;
      maxWait = 'maxWait' in options && nativeMax(+options.maxWait || 0, wait);
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function cancel() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      lastCalled = 0;
      maxTimeoutId = timeoutId = trailingCall = undefined;
    }

    function complete(isCalled, id) {
      if (id) {
        clearTimeout(id);
      }
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = undefined;
        }
      }
    }

    function delayed() {
      var remaining = wait - (now() - stamp);
      if (remaining <= 0 || remaining > wait) {
        complete(trailingCall, maxTimeoutId);
      } else {
        timeoutId = setTimeout(delayed, remaining);
      }
    }

    function maxDelayed() {
      complete(trailing, timeoutId);
    }

    function debounced() {
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
        var remaining = maxWait - (stamp - lastCalled),
            isCalled = remaining <= 0 || remaining > maxWait;

        if (isCalled) {
          if (maxTimeoutId) {
            maxTimeoutId = clearTimeout(maxTimeoutId);
          }
          lastCalled = stamp;
          result = func.apply(thisArg, args);
        }
        else if (!maxTimeoutId) {
          maxTimeoutId = setTimeout(maxDelayed, remaining);
        }
      }
      if (isCalled && timeoutId) {
        timeoutId = clearTimeout(timeoutId);
      }
      else if (!timeoutId && wait !== maxWait) {
        timeoutId = setTimeout(delayed, wait);
      }
      if (leadingCall) {
        isCalled = true;
        result = func.apply(thisArg, args);
      }
      if (isCalled && !timeoutId && !maxTimeoutId) {
        args = thisArg = undefined;
      }
      return result;
    }
    debounced.cancel = cancel;
    return debounced;
  }

  /**
   * Invokes `func` after `wait` milliseconds. Any additional arguments are
   * provided to `func` when it's invoked.
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to delay.
   * @param {number} wait The number of milliseconds to delay invocation.
   * @param {...*} [args] The arguments to invoke the function with.
   * @returns {number} Returns the timer id.
   * @example
   *
   * _.delay(function(text) {
   *   console.log(text);
   * }, 1000, 'later');
   * // => logs 'later' after one second
   */
  var delay = restParam(function(func, wait, args) {
    return baseDelay(func, wait, args);
  });

  /**
   * Creates a function that invokes `func` with the `this` binding of the
   * created function and arguments from `start` and beyond provided as an array.
   *
   * **Note:** This method is based on the [rest parameter](https://developer.mozilla.org/Web/JavaScript/Reference/Functions/rest_parameters).
   *
   * @static
   * @memberOf _
   * @category Function
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var say = _.restParam(function(what, names) {
   *   return what + ' ' + _.initial(names).join(', ') +
   *     (_.size(names) > 1 ? ', & ' : '') + _.last(names);
   * });
   *
   * say('hello', 'fred', 'barney', 'pebbles');
   * // => 'hello fred, barney, & pebbles'
   */
  function restParam(func, start) {
    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    start = nativeMax(start === undefined ? (func.length - 1) : (+start || 0), 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          rest = Array(length);

      while (++index < length) {
        rest[index] = args[start + index];
      }
      switch (start) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, args[0], rest);
        case 2: return func.call(this, args[0], args[1], rest);
      }
      var otherArgs = Array(start + 1);
      index = -1;
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = rest;
      return func.apply(this, otherArgs);
    };
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a clone of `value`. If `isDeep` is `true` nested objects are cloned,
   * otherwise they are assigned by reference. If `customizer` is provided it's
   * invoked to produce the cloned values. If `customizer` returns `undefined`
   * cloning is handled by the method instead. The `customizer` is bound to
   * `thisArg` and invoked with up to three argument; (value [, index|key, object]).
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
   * The enumerable properties of `arguments` objects and objects created by
   * constructors other than `Object` are cloned to plain `Object` objects. An
   * empty object is returned for uncloneable values such as functions, DOM nodes,
   * Maps, Sets, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @param {Function} [customizer] The function to customize cloning values.
   * @param {*} [thisArg] The `this` binding of `customizer`.
   * @returns {*} Returns the cloned value.
   * @example
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * var shallow = _.clone(users);
   * shallow[0] === users[0];
   * // => true
   *
   * var deep = _.clone(users, true);
   * deep[0] === users[0];
   * // => false
   *
   * // using a customizer callback
   * var el = _.clone(document.body, function(value) {
   *   if (_.isElement(value)) {
   *     return value.cloneNode(false);
   *   }
   * });
   *
   * el === document.body
   * // => false
   * el.nodeName
   * // => BODY
   * el.childNodes.length;
   * // => 0
   */
  function clone(value, isDeep, customizer, thisArg) {
    if (isDeep && typeof isDeep != 'boolean' && isIterateeCall(value, isDeep, customizer)) {
      isDeep = false;
    }
    else if (typeof isDeep == 'function') {
      thisArg = customizer;
      customizer = isDeep;
      isDeep = false;
    }
    return typeof customizer == 'function'
      ? baseClone(value, isDeep, bindCallback(customizer, thisArg, 3))
      : baseClone(value, isDeep);
  }

  /**
   * Creates a deep clone of `value`. If `customizer` is provided it's invoked
   * to produce the cloned values. If `customizer` returns `undefined` cloning
   * is handled by the method instead. The `customizer` is bound to `thisArg`
   * and invoked with up to three argument; (value [, index|key, object]).
   *
   * **Note:** This method is loosely based on the
   * [structured clone algorithm](http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm).
   * The enumerable properties of `arguments` objects and objects created by
   * constructors other than `Object` are cloned to plain `Object` objects. An
   * empty object is returned for uncloneable values such as functions, DOM nodes,
   * Maps, Sets, and WeakMaps.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to deep clone.
   * @param {Function} [customizer] The function to customize cloning values.
   * @param {*} [thisArg] The `this` binding of `customizer`.
   * @returns {*} Returns the deep cloned value.
   * @example
   *
   * var users = [
   *   { 'user': 'barney' },
   *   { 'user': 'fred' }
   * ];
   *
   * var deep = _.cloneDeep(users);
   * deep[0] === users[0];
   * // => false
   *
   * // using a customizer callback
   * var el = _.cloneDeep(document.body, function(value) {
   *   if (_.isElement(value)) {
   *     return value.cloneNode(true);
   *   }
   * });
   *
   * el === document.body
   * // => false
   * el.nodeName
   * // => BODY
   * el.childNodes.length;
   * // => 20
   */
  function cloneDeep(value, customizer, thisArg) {
    return typeof customizer == 'function'
      ? baseClone(value, true, bindCallback(customizer, thisArg, 3))
      : baseClone(value, true);
  }

  /**
   * Checks if `value` is classified as an `arguments` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  function isArguments(value) {
    return isObjectLike(value) && isArrayLike(value) &&
      hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(function() { return arguments; }());
   * // => false
   */
  var isArray = nativeIsArray || function(value) {
    return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
  };

  /**
   * Checks if `value` is empty. A value is considered empty unless it's an
   * `arguments` object, array, string, or jQuery-like collection with a length
   * greater than `0` or an object with own enumerable properties.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {Array|Object|string} value The value to inspect.
   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty(null);
   * // => true
   *
   * _.isEmpty(true);
   * // => true
   *
   * _.isEmpty(1);
   * // => true
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({ 'a': 1 });
   * // => false
   */
  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (isArrayLike(value) && (isArray(value) || isString(value) || isArguments(value) ||
        (isObjectLike(value) && isFunction(value.splice)))) {
      return !value.length;
    }
    return !keys(value).length;
  }

  /**
   * Performs a deep comparison between two values to determine if they are
   * equivalent. If `customizer` is provided it's invoked to compare values.
   * If `customizer` returns `undefined` comparisons are handled by the method
   * instead. The `customizer` is bound to `thisArg` and invoked with up to
   * three arguments: (value, other [, index|key]).
   *
   * **Note:** This method supports comparing arrays, booleans, `Date` objects,
   * numbers, `Object` objects, regexes, and strings. Objects are compared by
   * their own, not inherited, enumerable properties. Functions and DOM nodes
   * are **not** supported. Provide a customizer function to extend support
   * for comparing other values.
   *
   * @static
   * @memberOf _
   * @alias eq
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @param {Function} [customizer] The function to customize value comparisons.
   * @param {*} [thisArg] The `this` binding of `customizer`.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'user': 'fred' };
   * var other = { 'user': 'fred' };
   *
   * object == other;
   * // => false
   *
   * _.isEqual(object, other);
   * // => true
   *
   * // using a customizer callback
   * var array = ['hello', 'goodbye'];
   * var other = ['hi', 'goodbye'];
   *
   * _.isEqual(array, other, function(value, other) {
   *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
   *     return true;
   *   }
   * });
   * // => true
   */
  function isEqual(value, other, customizer, thisArg) {
    customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
    var result = customizer ? customizer(value, other) : undefined;
    return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in older versions of Chrome and Safari which return 'function' for regexes
    // and Safari 8 which returns 'object' for typed array constructors.
    return isObject(value) && objToString.call(value) == funcTag;
  }

  /**
   * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
   * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(1);
   * // => false
   */
  function isObject(value) {
    // Avoid a V8 JIT bug in Chrome 19-20.
    // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is `NaN`.
   *
   * **Note:** This method is not the same as [`isNaN`](https://es5.github.io/#x15.1.2.4)
   * which returns `true` for `undefined` and other non-numeric values.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
   * @example
   *
   * _.isNaN(NaN);
   * // => true
   *
   * _.isNaN(new Number(NaN));
   * // => true
   *
   * isNaN(undefined);
   * // => true
   *
   * _.isNaN(undefined);
   * // => false
   */
  function isNaN(value) {
    // An `NaN` primitive is the only value that is not equal to itself.
    // Perform the `toStringTag` check first to avoid errors with some host objects in IE.
    return isNumber(value) && value != +value;
  }

  /**
   * Checks if `value` is a native function.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
   * @example
   *
   * _.isNative(Array.prototype.push);
   * // => true
   *
   * _.isNative(_);
   * // => false
   */
  function isNative(value) {
    if (value == null) {
      return false;
    }
    if (isFunction(value)) {
      return reIsNative.test(fnToString.call(value));
    }
    return isObjectLike(value) && (isHostObject(value) ? reIsNative : reIsHostCtor).test(value);
  }

  /**
   * Checks if `value` is classified as a `Number` primitive or object.
   *
   * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are classified
   * as numbers, use the `_.isFinite` method.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isNumber(8.4);
   * // => true
   *
   * _.isNumber(NaN);
   * // => true
   *
   * _.isNumber('8.4');
   * // => false
   */
  function isNumber(value) {
    return typeof value == 'number' || (isObjectLike(value) && objToString.call(value) == numberTag);
  }

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * **Note:** This method assumes objects created by the `Object` constructor
   * have no inherited enumerable properties.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    var Ctor;

    // Exit early for non `Object` objects.
    if (!(isObjectLike(value) && objToString.call(value) == objectTag && !isHostObject(value) && !isArguments(value)) ||
        (!hasOwnProperty.call(value, 'constructor') && (Ctor = value.constructor, typeof Ctor == 'function' && !(Ctor instanceof Ctor)))) {
      return false;
    }
    // IE < 9 iterates inherited properties before own properties. If the first
    // iterated property is an object's own property then there are no inherited
    // enumerable properties.
    var result;
    if (lodash.support.ownLast) {
      baseForIn(value, function(subValue, key, object) {
        result = hasOwnProperty.call(object, key);
        return false;
      });
      return result !== false;
    }
    // In most environments an object's own properties are iterated before
    // its inherited properties. If the last iterated property is an object's
    // own property then there are no inherited enumerable properties.
    baseForIn(value, function(subValue, key) {
      result = key;
    });
    return result === undefined || hasOwnProperty.call(value, result);
  }

  /**
   * Checks if `value` is classified as a `RegExp` object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isRegExp(/abc/);
   * // => true
   *
   * _.isRegExp('/abc/');
   * // => false
   */
  function isRegExp(value) {
    return isObject(value) && objToString.call(value) == regexpTag;
  }

  /**
   * Checks if `value` is classified as a `String` primitive or object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isString('abc');
   * // => true
   *
   * _.isString(1);
   * // => false
   */
  function isString(value) {
    return typeof value == 'string' || (isObjectLike(value) && objToString.call(value) == stringTag);
  }

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  function isTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[objToString.call(value)];
  }

  /**
   * Converts `value` to an array.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Array} Returns the converted array.
   * @example
   *
   * (function() {
   *   return _.toArray(arguments).slice(1);
   * }(1, 2, 3));
   * // => [2, 3]
   */
  function toArray(value) {
    var length = value ? getLength(value) : 0;
    if (!isLength(length)) {
      return values(value);
    }
    if (!length) {
      return [];
    }
    return (lodash.support.unindexedChars && isString(value))
      ? value.split('')
      : arrayCopy(value);
  }

  /**
   * Converts `value` to a plain object flattening inherited enumerable
   * properties of `value` to own properties of the plain object.
   *
   * @static
   * @memberOf _
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Object} Returns the converted plain object.
   * @example
   *
   * function Foo() {
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.assign({ 'a': 1 }, new Foo);
   * // => { 'a': 1, 'b': 2 }
   *
   * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
   * // => { 'a': 1, 'b': 2, 'c': 3 }
   */
  function toPlainObject(value) {
    return baseCopy(value, keysIn(value));
  }

  /*------------------------------------------------------------------------*/

  /**
   * Recursively merges own enumerable properties of the source object(s), that
   * don't resolve to `undefined` into the destination object. Subsequent sources
   * overwrite property assignments of previous sources. If `customizer` is
   * provided it's invoked to produce the merged values of the destination and
   * source properties. If `customizer` returns `undefined` merging is handled
   * by the method instead. The `customizer` is bound to `thisArg` and invoked
   * with five arguments: (objectValue, sourceValue, key, object, source).
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @param {*} [thisArg] The `this` binding of `customizer`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var users = {
   *   'data': [{ 'user': 'barney' }, { 'user': 'fred' }]
   * };
   *
   * var ages = {
   *   'data': [{ 'age': 36 }, { 'age': 40 }]
   * };
   *
   * _.merge(users, ages);
   * // => { 'data': [{ 'user': 'barney', 'age': 36 }, { 'user': 'fred', 'age': 40 }] }
   *
   * // using a customizer callback
   * var object = {
   *   'fruits': ['apple'],
   *   'vegetables': ['beet']
   * };
   *
   * var other = {
   *   'fruits': ['banana'],
   *   'vegetables': ['carrot']
   * };
   *
   * _.merge(object, other, function(a, b) {
   *   if (_.isArray(a)) {
   *     return a.concat(b);
   *   }
   * });
   * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot'] }
   */
  var merge = createAssigner(baseMerge);

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object. Subsequent sources overwrite property assignments of previous sources.
   * If `customizer` is provided it's invoked to produce the assigned values.
   * The `customizer` is bound to `thisArg` and invoked with five arguments:
   * (objectValue, sourceValue, key, object, source).
   *
   * **Note:** This method mutates `object` and is based on
   * [`Object.assign`](http://ecma-international.org/ecma-262/6.0/#sec-object.assign).
   *
   * @static
   * @memberOf _
   * @alias extend
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @param {Function} [customizer] The function to customize assigned values.
   * @param {*} [thisArg] The `this` binding of `customizer`.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.assign({ 'user': 'barney' }, { 'age': 40 }, { 'user': 'fred' });
   * // => { 'user': 'fred', 'age': 40 }
   *
   * // using a customizer callback
   * var defaults = _.partialRight(_.assign, function(value, other) {
   *   return _.isUndefined(value) ? other : value;
   * });
   *
   * defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
   * // => { 'user': 'barney', 'age': 36 }
   */
  var assign = createAssigner(function(object, source, customizer) {
    return customizer
      ? assignWith(object, source, customizer)
      : baseAssign(object, source);
  });

  /**
   * Assigns own enumerable properties of source object(s) to the destination
   * object for all destination properties that resolve to `undefined`. Once a
   * property is set, additional values of the same property are ignored.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @example
   *
   * _.defaults({ 'user': 'barney' }, { 'age': 36 }, { 'user': 'fred' });
   * // => { 'user': 'barney', 'age': 36 }
   */
  var defaults = createDefaults(assign, assignDefaults);

  /**
   * This method is like `_.find` except that it returns the key of the first
   * element `predicate` returns truthy for instead of the element itself.
   *
   * If a property name is provided for `predicate` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `predicate` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to search.
   * @param {Function|Object|string} [predicate=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {string|undefined} Returns the key of the matched element, else `undefined`.
   * @example
   *
   * var users = {
   *   'barney':  { 'age': 36, 'active': true },
   *   'fred':    { 'age': 40, 'active': false },
   *   'pebbles': { 'age': 1,  'active': true }
   * };
   *
   * _.findKey(users, function(chr) {
   *   return chr.age < 40;
   * });
   * // => 'barney' (iteration order is not guaranteed)
   *
   * // using the `_.matches` callback shorthand
   * _.findKey(users, { 'age': 1, 'active': true });
   * // => 'pebbles'
   *
   * // using the `_.matchesProperty` callback shorthand
   * _.findKey(users, 'active', false);
   * // => 'fred'
   *
   * // using the `_.property` callback shorthand
   * _.findKey(users, 'active');
   * // => 'barney'
   */
  var findKey = createFindKey(baseForOwn);

  /**
   * Gets the property value at `path` of `object`. If the resolved value is
   * `undefined` the `defaultValue` is used in its place.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @param {Array|string} path The path of the property to get.
   * @param {*} [defaultValue] The value returned if the resolved value is `undefined`.
   * @returns {*} Returns the resolved value.
   * @example
   *
   * var object = { 'a': [{ 'b': { 'c': 3 } }] };
   *
   * _.get(object, 'a[0].b.c');
   * // => 3
   *
   * _.get(object, ['a', '0', 'b', 'c']);
   * // => 3
   *
   * _.get(object, 'a.b.c', 'default');
   * // => 'default'
   */
  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, toPath(path), (path + ''));
    return result === undefined ? defaultValue : result;
  }

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  var keys = !nativeKeys ? shimKeys : function(object) {
    var Ctor = object == null ? undefined : object.constructor;
    if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
        (typeof object == 'function' ? lodash.support.enumPrototypes : isArrayLike(object))) {
      return shimKeys(object);
    }
    return isObject(object) ? nativeKeys(object) : [];
  };

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    if (object == null) {
      return [];
    }
    if (!isObject(object)) {
      object = Object(object);
    }
    var length = object.length,
        support = lodash.support;

    length = (length && isLength(length) &&
      (isArray(object) || isArguments(object) || isString(object)) && length) || 0;

    var Ctor = object.constructor,
        index = -1,
        proto = (isFunction(Ctor) && Ctor.prototype) || objectProto,
        isProto = proto === object,
        result = Array(length),
        skipIndexes = length > 0,
        skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error),
        skipProto = support.enumPrototypes && isFunction(object);

    while (++index < length) {
      result[index] = (index + '');
    }
    // lodash skips the `constructor` property when it infers it's iterating
    // over a `prototype` object because IE < 9 can't set the `[[Enumerable]]`
    // attribute of an existing property and the `constructor` property of a
    // prototype defaults to non-enumerable.
    for (var key in object) {
      if (!(skipProto && key == 'prototype') &&
          !(skipErrorProps && (key == 'message' || key == 'name')) &&
          !(skipIndexes && isIndex(key, length)) &&
          !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    if (support.nonEnumShadows && object !== objectProto) {
      var tag = object === stringProto ? stringTag : (object === errorProto ? errorTag : objToString.call(object)),
          nonEnums = nonEnumProps[tag] || nonEnumProps[objectTag];

      if (tag == objectTag) {
        proto = objectProto;
      }
      length = shadowProps.length;
      while (length--) {
        key = shadowProps[length];
        var nonEnum = nonEnums[key];
        if (!(isProto && nonEnum) &&
            (nonEnum ? hasOwnProperty.call(object, key) : object[key] !== proto[key])) {
          result.push(key);
        }
      }
    }
    return result;
  }

  /**
   * Creates an object with the same keys as `object` and values generated by
   * running each own enumerable property of `object` through `iteratee`. The
   * iteratee function is bound to `thisArg` and invoked with three arguments:
   * (value, key, object).
   *
   * If a property name is provided for `iteratee` the created `_.property`
   * style callback returns the property value of the given element.
   *
   * If a value is also provided for `thisArg` the created `_.matchesProperty`
   * style callback returns `true` for elements that have a matching property
   * value, else `false`.
   *
   * If an object is provided for `iteratee` the created `_.matches` style
   * callback returns `true` for elements that have the properties of the given
   * object, else `false`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to iterate over.
   * @param {Function|Object|string} [iteratee=_.identity] The function invoked
   *  per iteration.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {Object} Returns the new mapped object.
   * @example
   *
   * _.mapValues({ 'a': 1, 'b': 2 }, function(n) {
   *   return n * 3;
   * });
   * // => { 'a': 3, 'b': 6 }
   *
   * var users = {
   *   'fred':    { 'user': 'fred',    'age': 40 },
   *   'pebbles': { 'user': 'pebbles', 'age': 1 }
   * };
   *
   * // using the `_.property` callback shorthand
   * _.mapValues(users, 'age');
   * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
   */
  var mapValues = createObjectMapper();

  /**
   * The opposite of `_.pick`; this method creates an object composed of the
   * own and inherited enumerable properties of `object` that are not omitted.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {Function|...(string|string[])} [predicate] The function invoked per
   *  iteration or property names to omit, specified as individual property
   *  names or arrays of property names.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'user': 'fred', 'age': 40 };
   *
   * _.omit(object, 'age');
   * // => { 'user': 'fred' }
   *
   * _.omit(object, _.isNumber);
   * // => { 'user': 'fred' }
   */
  var omit = restParam(function(object, props) {
    if (object == null) {
      return {};
    }
    if (typeof props[0] != 'function') {
      var props = arrayMap(baseFlatten(props), String);
      return pickByArray(object, baseDifference(keysIn(object), props));
    }
    var predicate = bindCallback(props[0], props[1], 3);
    return pickByCallback(object, function(value, key, object) {
      return !predicate(value, key, object);
    });
  });

  /**
   * Creates a two dimensional array of the key-value pairs for `object`,
   * e.g. `[[key1, value1], [key2, value2]]`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the new array of key-value pairs.
   * @example
   *
   * _.pairs({ 'barney': 36, 'fred': 40 });
   * // => [['barney', 36], ['fred', 40]] (iteration order is not guaranteed)
   */
  function pairs(object) {
    object = toObject(object);

    var index = -1,
        props = keys(object),
        length = props.length,
        result = Array(length);

    while (++index < length) {
      var key = props[index];
      result[index] = [key, object[key]];
    }
    return result;
  }

  /**
   * Creates an object composed of the picked `object` properties. Property
   * names may be specified as individual arguments or as arrays of property
   * names. If `predicate` is provided it's invoked for each property of `object`
   * picking the properties `predicate` returns truthy for. The predicate is
   * bound to `thisArg` and invoked with three arguments: (value, key, object).
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {Function|...(string|string[])} [predicate] The function invoked per
   *  iteration or property names to pick, specified as individual property
   *  names or arrays of property names.
   * @param {*} [thisArg] The `this` binding of `predicate`.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'user': 'fred', 'age': 40 };
   *
   * _.pick(object, 'user');
   * // => { 'user': 'fred' }
   *
   * _.pick(object, _.isString);
   * // => { 'user': 'fred' }
   */
  var pick = restParam(function(object, props) {
    if (object == null) {
      return {};
    }
    return typeof props[0] == 'function'
      ? pickByCallback(object, bindCallback(props[0], props[1], 3))
      : pickByArray(object, baseFlatten(props));
  });

  /**
   * An alternative to `_.reduce`; this method transforms `object` to a new
   * `accumulator` object which is the result of running each of its own enumerable
   * properties through `iteratee`, with each invocation potentially mutating
   * the `accumulator` object. The `iteratee` is bound to `thisArg` and invoked
   * with four arguments: (accumulator, value, key, object). Iteratee functions
   * may exit iteration early by explicitly returning `false`.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} [iteratee=_.identity] The function invoked per iteration.
   * @param {*} [accumulator] The custom accumulator value.
   * @param {*} [thisArg] The `this` binding of `iteratee`.
   * @returns {*} Returns the accumulated value.
   * @example
   *
   * _.transform([2, 3, 4], function(result, n) {
   *   result.push(n *= n);
   *   return n % 2 == 0;
   * });
   * // => [4, 9]
   *
   * _.transform({ 'a': 1, 'b': 2 }, function(result, n, key) {
   *   result[key] = n * 3;
   * });
   * // => { 'a': 3, 'b': 6 }
   */
  function transform(object, iteratee, accumulator, thisArg) {
    var isArr = isArray(object) || isTypedArray(object);
    iteratee = getCallback(iteratee, thisArg, 4);

    if (accumulator == null) {
      if (isArr || isObject(object)) {
        var Ctor = object.constructor;
        if (isArr) {
          accumulator = isArray(object) ? new Ctor : [];
        } else {
          accumulator = baseCreate(isFunction(Ctor) ? Ctor.prototype : undefined);
        }
      } else {
        accumulator = {};
      }
    }
    (isArr ? arrayEach : baseForOwn)(object, function(value, index, object) {
      return iteratee(accumulator, value, index, object);
    });
    return accumulator;
  }

  /**
   * Creates an array of the own enumerable property values of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property values.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.values(new Foo);
   * // => [1, 2] (iteration order is not guaranteed)
   *
   * _.values('hi');
   * // => ['h', 'i']
   */
  function values(object) {
    return baseValues(object, keys(object));
  }

  /*------------------------------------------------------------------------*/

  /**
   * Produces a random number between `min` and `max` (inclusive). If only one
   * argument is provided a number between `0` and the given number is returned.
   * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
   * number is returned instead of an integer.
   *
   * @static
   * @memberOf _
   * @category Number
   * @param {number} [min=0] The minimum possible value.
   * @param {number} [max=1] The maximum possible value.
   * @param {boolean} [floating] Specify returning a floating-point number.
   * @returns {number} Returns the random number.
   * @example
   *
   * _.random(0, 5);
   * // => an integer between 0 and 5
   *
   * _.random(5);
   * // => also an integer between 0 and 5
   *
   * _.random(5, true);
   * // => a floating-point number between 0 and 5
   *
   * _.random(1.2, 5.2);
   * // => a floating-point number between 1.2 and 5.2
   */
  function random(min, max, floating) {
    if (floating && isIterateeCall(min, max, floating)) {
      max = floating = undefined;
    }
    var noMin = min == null,
        noMax = max == null;

    if (floating == null) {
      if (noMax && typeof min == 'boolean') {
        floating = min;
        min = 1;
      }
      else if (typeof max == 'boolean') {
        floating = max;
        noMax = true;
      }
    }
    if (noMin && noMax) {
      max = 1;
      noMax = false;
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
      return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
    }
    return baseRandom(min, max);
  }

  /*------------------------------------------------------------------------*/

  /**
   * Capitalizes the first character of `string`.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to capitalize.
   * @returns {string} Returns the capitalized string.
   * @example
   *
   * _.capitalize('fred');
   * // => 'Fred'
   */
  function capitalize(string) {
    string = baseToString(string);
    return string && (string.charAt(0).toUpperCase() + string.slice(1));
  }

  /**
   * Deburrs `string` by converting [latin-1 supplementary letters](https://en.wikipedia.org/wiki/Latin-1_Supplement_(Unicode_block)#Character_table)
   * to basic latin letters and removing [combining diacritical marks](https://en.wikipedia.org/wiki/Combining_Diacritical_Marks).
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to deburr.
   * @returns {string} Returns the deburred string.
   * @example
   *
   * _.deburr('déjà vu');
   * // => 'deja vu'
   */
  function deburr(string) {
    string = baseToString(string);
    return string && string.replace(reLatin1, deburrLetter).replace(reComboMark, '');
  }

  /**
   * Converts the characters "&", "<", ">", '"', "'", and "\`", in `string` to
   * their corresponding HTML entities.
   *
   * **Note:** No other characters are escaped. To escape additional characters
   * use a third-party library like [_he_](https://mths.be/he).
   *
   * Though the ">" character is escaped for symmetry, characters like
   * ">" and "/" don't need escaping in HTML and have no special meaning
   * unless they're part of a tag or unquoted attribute value.
   * See [Mathias Bynens's article](https://mathiasbynens.be/notes/ambiguous-ampersands)
   * (under "semi-related fun fact") for more details.
   *
   * Backticks are escaped because in Internet Explorer < 9, they can break out
   * of attribute values or HTML comments. See [#59](https://html5sec.org/#59),
   * [#102](https://html5sec.org/#102), [#108](https://html5sec.org/#108), and
   * [#133](https://html5sec.org/#133) of the [HTML5 Security Cheatsheet](https://html5sec.org/)
   * for more details.
   *
   * When working with HTML you should always [quote attribute values](http://wonko.com/post/html-escaping)
   * to reduce XSS vectors.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to escape.
   * @returns {string} Returns the escaped string.
   * @example
   *
   * _.escape('fred, barney, & pebbles');
   * // => 'fred, barney, &amp; pebbles'
   */
  function escape(string) {
    // Reset `lastIndex` because in IE < 9 `String#replace` does not.
    string = baseToString(string);
    return (string && reHasUnescapedHtml.test(string))
      ? string.replace(reUnescapedHtml, escapeHtmlChar)
      : string;
  }

  /**
   * Converts `string` to [kebab case](https://en.wikipedia.org/wiki/Letter_case#Special_case_styles).
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to convert.
   * @returns {string} Returns the kebab cased string.
   * @example
   *
   * _.kebabCase('Foo Bar');
   * // => 'foo-bar'
   *
   * _.kebabCase('fooBar');
   * // => 'foo-bar'
   *
   * _.kebabCase('__foo_bar__');
   * // => 'foo-bar'
   */
  var kebabCase = createCompounder(function(result, word, index) {
    return result + (index ? '-' : '') + word.toLowerCase();
  });

  /**
   * Pads `string` on the left side if it's shorter than `length`. Padding
   * characters are truncated if they exceed `length`.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to pad.
   * @param {number} [length=0] The padding length.
   * @param {string} [chars=' '] The string used as padding.
   * @returns {string} Returns the padded string.
   * @example
   *
   * _.padLeft('abc', 6);
   * // => '   abc'
   *
   * _.padLeft('abc', 6, '_-');
   * // => '_-_abc'
   *
   * _.padLeft('abc', 3);
   * // => 'abc'
   */
  var padLeft = createPadDir();

  /**
   * Repeats the given string `n` times.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to repeat.
   * @param {number} [n=0] The number of times to repeat the string.
   * @returns {string} Returns the repeated string.
   * @example
   *
   * _.repeat('*', 3);
   * // => '***'
   *
   * _.repeat('abc', 2);
   * // => 'abcabc'
   *
   * _.repeat('abc', 0);
   * // => ''
   */
  function repeat(string, n) {
    var result = '';
    string = baseToString(string);
    n = +n;
    if (n < 1 || !string || !nativeIsFinite(n)) {
      return result;
    }
    // Leverage the exponentiation by squaring algorithm for a faster repeat.
    // See https://en.wikipedia.org/wiki/Exponentiation_by_squaring for more details.
    do {
      if (n % 2) {
        result += string;
      }
      n = nativeFloor(n / 2);
      string += string;
    } while (n);

    return result;
  }

  /**
   * Converts `string` to [start case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage).
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to convert.
   * @returns {string} Returns the start cased string.
   * @example
   *
   * _.startCase('--foo-bar');
   * // => 'Foo Bar'
   *
   * _.startCase('fooBar');
   * // => 'Foo Bar'
   *
   * _.startCase('__foo_bar__');
   * // => 'Foo Bar'
   */
  var startCase = createCompounder(function(result, word, index) {
    return result + (index ? ' ' : '') + (word.charAt(0).toUpperCase() + word.slice(1));
  });

  /**
   * Removes leading and trailing whitespace or specified characters from `string`.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to trim.
   * @param {string} [chars=whitespace] The characters to trim.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {string} Returns the trimmed string.
   * @example
   *
   * _.trim('  abc  ');
   * // => 'abc'
   *
   * _.trim('-_-abc-_-', '_-');
   * // => 'abc'
   *
   * _.map(['  foo  ', '  bar  '], _.trim);
   * // => ['foo', 'bar']
   */
  function trim(string, chars, guard) {
    var value = string;
    string = baseToString(string);
    if (!string) {
      return string;
    }
    if (guard ? isIterateeCall(value, chars, guard) : chars == null) {
      return string.slice(trimmedLeftIndex(string), trimmedRightIndex(string) + 1);
    }
    chars = (chars + '');
    return string.slice(charsLeftIndex(string, chars), charsRightIndex(string, chars) + 1);
  }

  /**
   * Truncates `string` if it's longer than the given maximum string length.
   * The last characters of the truncated string are replaced with the omission
   * string which defaults to "...".
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to truncate.
   * @param {Object|number} [options] The options object or maximum string length.
   * @param {number} [options.length=30] The maximum string length.
   * @param {string} [options.omission='...'] The string to indicate text is omitted.
   * @param {RegExp|string} [options.separator] The separator pattern to truncate to.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {string} Returns the truncated string.
   * @example
   *
   * _.trunc('hi-diddly-ho there, neighborino');
   * // => 'hi-diddly-ho there, neighbo...'
   *
   * _.trunc('hi-diddly-ho there, neighborino', 24);
   * // => 'hi-diddly-ho there, n...'
   *
   * _.trunc('hi-diddly-ho there, neighborino', {
   *   'length': 24,
   *   'separator': ' '
   * });
   * // => 'hi-diddly-ho there,...'
   *
   * _.trunc('hi-diddly-ho there, neighborino', {
   *   'length': 24,
   *   'separator': /,? +/
   * });
   * // => 'hi-diddly-ho there...'
   *
   * _.trunc('hi-diddly-ho there, neighborino', {
   *   'omission': ' [...]'
   * });
   * // => 'hi-diddly-ho there, neig [...]'
   */
  function trunc(string, options, guard) {
    if (guard && isIterateeCall(string, options, guard)) {
      options = undefined;
    }
    var length = DEFAULT_TRUNC_LENGTH,
        omission = DEFAULT_TRUNC_OMISSION;

    if (options != null) {
      if (isObject(options)) {
        var separator = 'separator' in options ? options.separator : separator;
        length = 'length' in options ? (+options.length || 0) : length;
        omission = 'omission' in options ? baseToString(options.omission) : omission;
      } else {
        length = +options || 0;
      }
    }
    string = baseToString(string);
    if (length >= string.length) {
      return string;
    }
    var end = length - omission.length;
    if (end < 1) {
      return omission;
    }
    var result = string.slice(0, end);
    if (separator == null) {
      return result + omission;
    }
    if (isRegExp(separator)) {
      if (string.slice(end).search(separator)) {
        var match,
            newEnd,
            substring = string.slice(0, end);

        if (!separator.global) {
          separator = RegExp(separator.source, (reFlags.exec(separator) || '') + 'g');
        }
        separator.lastIndex = 0;
        while ((match = separator.exec(substring))) {
          newEnd = match.index;
        }
        result = result.slice(0, newEnd == null ? end : newEnd);
      }
    } else if (string.indexOf(separator, end) != end) {
      var index = result.lastIndexOf(separator);
      if (index > -1) {
        result = result.slice(0, index);
      }
    }
    return result + omission;
  }

  /**
   * The inverse of `_.escape`; this method converts the HTML entities
   * `&amp;`, `&lt;`, `&gt;`, `&quot;`, `&#39;`, and `&#96;` in `string` to their
   * corresponding characters.
   *
   * **Note:** No other HTML entities are unescaped. To unescape additional HTML
   * entities use a third-party library like [_he_](https://mths.be/he).
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to unescape.
   * @returns {string} Returns the unescaped string.
   * @example
   *
   * _.unescape('fred, barney, &amp; pebbles');
   * // => 'fred, barney, & pebbles'
   */
  function unescape(string) {
    string = baseToString(string);
    return (string && reHasEscapedHtml.test(string))
      ? string.replace(reEscapedHtml, unescapeHtmlChar)
      : string;
  }

  /**
   * Splits `string` into an array of its words.
   *
   * @static
   * @memberOf _
   * @category String
   * @param {string} [string=''] The string to inspect.
   * @param {RegExp|string} [pattern] The pattern to match words.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {Array} Returns the words of `string`.
   * @example
   *
   * _.words('fred, barney, & pebbles');
   * // => ['fred', 'barney', 'pebbles']
   *
   * _.words('fred, barney, & pebbles', /[^, ]+/g);
   * // => ['fred', 'barney', '&', 'pebbles']
   */
  function words(string, pattern, guard) {
    if (guard && isIterateeCall(string, pattern, guard)) {
      pattern = undefined;
    }
    string = baseToString(string);
    return string.match(pattern || reWords) || [];
  }

  /*------------------------------------------------------------------------*/

  /**
   * Creates a function that invokes `func` with the `this` binding of `thisArg`
   * and arguments of the created function. If `func` is a property name the
   * created callback returns the property value for a given element. If `func`
   * is an object the created callback returns `true` for elements that contain
   * the equivalent object properties, otherwise it returns `false`.
   *
   * @static
   * @memberOf _
   * @alias iteratee
   * @category Utility
   * @param {*} [func=_.identity] The value to convert to a callback.
   * @param {*} [thisArg] The `this` binding of `func`.
   * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
   * @returns {Function} Returns the callback.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36 },
   *   { 'user': 'fred',   'age': 40 }
   * ];
   *
   * // wrap to create custom callback shorthands
   * _.callback = _.wrap(_.callback, function(callback, func, thisArg) {
   *   var match = /^(.+?)__([gl]t)(.+)$/.exec(func);
   *   if (!match) {
   *     return callback(func, thisArg);
   *   }
   *   return function(object) {
   *     return match[2] == 'gt'
   *       ? object[match[1]] > match[3]
   *       : object[match[1]] < match[3];
   *   };
   * });
   *
   * _.filter(users, 'age__gt36');
   * // => [{ 'user': 'fred', 'age': 40 }]
   */
  function callback(func, thisArg, guard) {
    if (guard && isIterateeCall(func, thisArg, guard)) {
      thisArg = undefined;
    }
    return isObjectLike(func)
      ? matches(func)
      : baseCallback(func, thisArg);
  }

  /**
   * This method returns the first argument provided to it.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.identity(object) === object;
   * // => true
   */
  function identity(value) {
    return value;
  }

  /**
   * Creates a function that performs a deep comparison between a given object
   * and `source`, returning `true` if the given object has equivalent property
   * values, else `false`.
   *
   * **Note:** This method supports comparing arrays, booleans, `Date` objects,
   * numbers, `Object` objects, regexes, and strings. Objects are compared by
   * their own, not inherited, enumerable properties. For comparing a single
   * own or inherited property value see `_.matchesProperty`.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': true },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * _.filter(users, _.matches({ 'age': 40, 'active': false }));
   * // => [{ 'user': 'fred', 'age': 40, 'active': false }]
   */
  function matches(source) {
    return baseMatches(baseClone(source, true));
  }

  /**
   * Adds all own enumerable function properties of a source object to the
   * destination object. If `object` is a function then methods are added to
   * its prototype as well.
   *
   * **Note:** Use `_.runInContext` to create a pristine `lodash` function to
   * avoid conflicts caused by modifying the original.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {Function|Object} [object=lodash] The destination object.
   * @param {Object} source The object of functions to add.
   * @param {Object} [options] The options object.
   * @param {boolean} [options.chain=true] Specify whether the functions added
   *  are chainable.
   * @returns {Function|Object} Returns `object`.
   * @example
   *
   * function vowels(string) {
   *   return _.filter(string, function(v) {
   *     return /[aeiou]/i.test(v);
   *   });
   * }
   *
   * _.mixin({ 'vowels': vowels });
   * _.vowels('fred');
   * // => ['e']
   *
   * _('fred').vowels().value();
   * // => ['e']
   *
   * _.mixin({ 'vowels': vowels }, { 'chain': false });
   * _('fred').vowels();
   * // => ['e']
   */
  function mixin(object, source, options) {
    if (options == null) {
      var isObj = isObject(source),
          props = isObj ? keys(source) : undefined,
          methodNames = (props && props.length) ? baseFunctions(source, props) : undefined;

      if (!(methodNames ? methodNames.length : isObj)) {
        methodNames = false;
        options = source;
        source = object;
        object = this;
      }
    }
    if (!methodNames) {
      methodNames = baseFunctions(source, keys(source));
    }
    var chain = true,
        index = -1,
        isFunc = isFunction(object),
        length = methodNames.length;

    if (options === false) {
      chain = false;
    } else if (isObject(options) && 'chain' in options) {
      chain = options.chain;
    }
    while (++index < length) {
      var methodName = methodNames[index],
          func = source[methodName];

      object[methodName] = func;
      if (isFunc) {
        object.prototype[methodName] = (function(func) {
          return function() {
            var chainAll = this.__chain__;
            if (chain || chainAll) {
              var result = object(this.__wrapped__),
                  actions = result.__actions__ = arrayCopy(this.__actions__);

              actions.push({ 'func': func, 'args': arguments, 'thisArg': object });
              result.__chain__ = chainAll;
              return result;
            }
            return func.apply(object, arrayPush([this.value()], arguments));
          };
        }(func));
      }
    }
    return object;
  }

  /**
   * A no-operation function that returns `undefined` regardless of the
   * arguments it receives.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @example
   *
   * var object = { 'user': 'fred' };
   *
   * _.noop(object) === undefined;
   * // => true
   */
  function noop() {
    // No operation performed.
  }

  /**
   * Creates a function that returns the property value at `path` on a
   * given object.
   *
   * @static
   * @memberOf _
   * @category Utility
   * @param {Array|string} path The path of the property to get.
   * @returns {Function} Returns the new function.
   * @example
   *
   * var objects = [
   *   { 'a': { 'b': { 'c': 2 } } },
   *   { 'a': { 'b': { 'c': 1 } } }
   * ];
   *
   * _.map(objects, _.property('a.b.c'));
   * // => [2, 1]
   *
   * _.pluck(_.sortBy(objects, _.property(['a', 'b', 'c'])), 'a.b.c');
   * // => [1, 2]
   */
  function property(path) {
    return isKey(path) ? baseProperty(path) : basePropertyDeep(path);
  }

  /*------------------------------------------------------------------------*/

  // Ensure wrappers are instances of `baseLodash`.
  lodash.prototype = baseLodash.prototype;

  LodashWrapper.prototype = baseCreate(baseLodash.prototype);
  LodashWrapper.prototype.constructor = LodashWrapper;

  LazyWrapper.prototype = baseCreate(baseLodash.prototype);
  LazyWrapper.prototype.constructor = LazyWrapper;

  // Add functions to the `Set` cache.
  SetCache.prototype.push = cachePush;

  // Add functions that return wrapped values when chaining.
  lodash.assign = assign;
  lodash.callback = callback;
  lodash.chain = chain;
  lodash.chunk = chunk;
  lodash.debounce = debounce;
  lodash.defaults = defaults;
  lodash.delay = delay;
  lodash.drop = drop;
  lodash.filter = filter;
  lodash.flatten = flatten;
  lodash.forEach = forEach;
  lodash.groupBy = groupBy;
  lodash.indexBy = indexBy;
  lodash.keys = keys;
  lodash.keysIn = keysIn;
  lodash.map = map;
  lodash.mapValues = mapValues;
  lodash.matches = matches;
  lodash.merge = merge;
  lodash.mixin = mixin;
  lodash.omit = omit;
  lodash.pairs = pairs;
  lodash.pick = pick;
  lodash.pluck = pluck;
  lodash.property = property;
  lodash.pullAt = pullAt;
  lodash.reject = reject;
  lodash.remove = remove;
  lodash.restParam = restParam;
  lodash.shuffle = shuffle;
  lodash.sortBy = sortBy;
  lodash.tap = tap;
  lodash.thru = thru;
  lodash.toArray = toArray;
  lodash.toPlainObject = toPlainObject;
  lodash.transform = transform;
  lodash.uniq = uniq;
  lodash.values = values;
  lodash.without = without;
  lodash.zipObject = zipObject;

  // Add aliases.
  lodash.collect = map;
  lodash.each = forEach;
  lodash.extend = assign;
  lodash.iteratee = callback;
  lodash.object = zipObject;
  lodash.select = filter;
  lodash.unique = uniq;

  // Add functions to `lodash.prototype`.
  mixin(lodash, lodash);

  /*------------------------------------------------------------------------*/

  // Add functions that return unwrapped values when chaining.
  lodash.capitalize = capitalize;
  lodash.clone = clone;
  lodash.cloneDeep = cloneDeep;
  lodash.deburr = deburr;
  lodash.escape = escape;
  lodash.find = find;
  lodash.findKey = findKey;
  lodash.first = first;
  lodash.get = get;
  lodash.identity = identity;
  lodash.indexOf = indexOf;
  lodash.isArguments = isArguments;
  lodash.isArray = isArray;
  lodash.isEmpty = isEmpty;
  lodash.isEqual = isEqual;
  lodash.isFunction = isFunction;
  lodash.isNaN = isNaN;
  lodash.isNative = isNative;
  lodash.isNumber = isNumber;
  lodash.isObject = isObject;
  lodash.isPlainObject = isPlainObject;
  lodash.isRegExp = isRegExp;
  lodash.isString = isString;
  lodash.isTypedArray = isTypedArray;
  lodash.kebabCase = kebabCase;
  lodash.last = last;
  lodash.noop = noop;
  lodash.now = now;
  lodash.padLeft = padLeft;
  lodash.random = random;
  lodash.reduce = reduce;
  lodash.repeat = repeat;
  lodash.size = size;
  lodash.startCase = startCase;
  lodash.trim = trim;
  lodash.trunc = trunc;
  lodash.unescape = unescape;
  lodash.words = words;

  // Add aliases.
  lodash.eq = isEqual;
  lodash.detect = find;
  lodash.foldl = reduce;
  lodash.head = first;
  lodash.inject = reduce;

  mixin(lodash, (function() {
    var source = {};
    baseForOwn(lodash, function(func, methodName) {
      if (!lodash.prototype[methodName]) {
        source[methodName] = func;
      }
    });
    return source;
  }()), false);

  /*------------------------------------------------------------------------*/

  // Add functions capable of returning wrapped and unwrapped values when chaining.
  lodash.sample = sample;

  lodash.prototype.sample = function(n) {
    if (!this.__chain__ && n == null) {
      return sample(this.value());
    }
    return this.thru(function(value) {
      return sample(value, n);
    });
  };

  /*------------------------------------------------------------------------*/

  /**
   * The semantic version number.
   *
   * @static
   * @memberOf _
   * @type string
   */
  lodash.VERSION = VERSION;

  // Add `LazyWrapper` methods for `_.drop` and `_.take` variants.
  arrayEach(['drop', 'take'], function(methodName, index) {
    LazyWrapper.prototype[methodName] = function(n) {
      var filtered = this.__filtered__;
      if (filtered && !index) {
        return new LazyWrapper(this);
      }
      n = n == null ? 1 : nativeMax(nativeFloor(n) || 0, 0);

      var result = this.clone();
      if (filtered) {
        result.__takeCount__ = nativeMin(result.__takeCount__, n);
      } else {
        result.__views__.push({ 'size': n, 'type': methodName + (result.__dir__ < 0 ? 'Right' : '') });
      }
      return result;
    };

    LazyWrapper.prototype[methodName + 'Right'] = function(n) {
      return this.reverse()[methodName](n).reverse();
    };
  });

  // Add `LazyWrapper` methods that accept an `iteratee` value.
  arrayEach(['filter', 'map', 'takeWhile'], function(methodName, index) {
    var type = index + 1,
        isFilter = type != LAZY_MAP_FLAG;

    LazyWrapper.prototype[methodName] = function(iteratee, thisArg) {
      var result = this.clone();
      result.__iteratees__.push({ 'iteratee': getCallback(iteratee, thisArg, 1), 'type': type });
      result.__filtered__ = result.__filtered__ || isFilter;
      return result;
    };
  });

  // Add `LazyWrapper` methods for `_.first` and `_.last`.
  arrayEach(['first', 'last'], function(methodName, index) {
    var takeName = 'take' + (index ? 'Right' : '');

    LazyWrapper.prototype[methodName] = function() {
      return this[takeName](1).value()[0];
    };
  });

  // Add `LazyWrapper` methods for `_.initial` and `_.rest`.
  arrayEach(['initial', 'rest'], function(methodName, index) {
    var dropName = 'drop' + (index ? '' : 'Right');

    LazyWrapper.prototype[methodName] = function() {
      return this.__filtered__ ? new LazyWrapper(this) : this[dropName](1);
    };
  });

  // Add `LazyWrapper` methods for `_.pluck` and `_.where`.
  arrayEach(['pluck', 'where'], function(methodName, index) {
    var operationName = index ? 'filter' : 'map',
        createCallback = index ? baseMatches : property;

    LazyWrapper.prototype[methodName] = function(value) {
      return this[operationName](createCallback(value));
    };
  });

  LazyWrapper.prototype.compact = function() {
    return this.filter(identity);
  };

  LazyWrapper.prototype.reject = function(predicate, thisArg) {
    predicate = getCallback(predicate, thisArg, 1);
    return this.filter(function(value) {
      return !predicate(value);
    });
  };

  LazyWrapper.prototype.slice = function(start, end) {
    start = start == null ? 0 : (+start || 0);

    var result = this;
    if (result.__filtered__ && (start > 0 || end < 0)) {
      return new LazyWrapper(result);
    }
    if (start < 0) {
      result = result.takeRight(-start);
    } else if (start) {
      result = result.drop(start);
    }
    if (end !== undefined) {
      end = (+end || 0);
      result = end < 0 ? result.dropRight(-end) : result.take(end - start);
    }
    return result;
  };

  LazyWrapper.prototype.takeRightWhile = function(predicate, thisArg) {
    return this.reverse().takeWhile(predicate, thisArg).reverse();
  };

  LazyWrapper.prototype.toArray = function() {
    return this.take(POSITIVE_INFINITY);
  };

  // Add `LazyWrapper` methods to `lodash.prototype`.
  baseForOwn(LazyWrapper.prototype, function(func, methodName) {
    var checkIteratee = /^(?:filter|map|reject)|While$/.test(methodName),
        retUnwrapped = /^(?:first|last)$/.test(methodName),
        lodashFunc = lodash[retUnwrapped ? ('take' + (methodName == 'last' ? 'Right' : '')) : methodName];

    if (!lodashFunc) {
      return;
    }
    lodash.prototype[methodName] = function() {
      var args = retUnwrapped ? [1] : arguments,
          chainAll = this.__chain__,
          value = this.__wrapped__,
          isHybrid = !!this.__actions__.length,
          isLazy = value instanceof LazyWrapper,
          iteratee = args[0],
          useLazy = isLazy || isArray(value);

      if (useLazy && checkIteratee && typeof iteratee == 'function' && iteratee.length != 1) {
        // Avoid lazy use if the iteratee has a "length" value other than `1`.
        isLazy = useLazy = false;
      }
      var interceptor = function(value) {
        return (retUnwrapped && chainAll)
          ? lodashFunc(value, 1)[0]
          : lodashFunc.apply(undefined, arrayPush([value], args));
      };

      var action = { 'func': thru, 'args': [interceptor], 'thisArg': undefined },
          onlyLazy = isLazy && !isHybrid;

      if (retUnwrapped && !chainAll) {
        if (onlyLazy) {
          value = value.clone();
          value.__actions__.push(action);
          return func.call(value);
        }
        return lodashFunc.call(undefined, this.value())[0];
      }
      if (!retUnwrapped && useLazy) {
        value = onlyLazy ? value : new LazyWrapper(this);
        var result = func.apply(value, args);
        result.__actions__.push(action);
        return new LodashWrapper(result, chainAll);
      }
      return this.thru(interceptor);
    };
  });

  // Add `Array` and `String` methods to `lodash.prototype`.
  arrayEach(['join', 'pop', 'push', 'replace', 'shift', 'sort', 'splice', 'split', 'unshift'], function(methodName) {
    var protoFunc = (/^(?:replace|split)$/.test(methodName) ? stringProto : arrayProto)[methodName],
        chainName = /^(?:push|sort|unshift)$/.test(methodName) ? 'tap' : 'thru',
        fixObjects = !support.spliceObjects && /^(?:pop|shift|splice)$/.test(methodName),
        retUnwrapped = /^(?:join|pop|replace|shift)$/.test(methodName);

    // Avoid array-like object bugs with `Array#shift` and `Array#splice` in
    // IE < 9, Firefox < 10, and RingoJS.
    var func = !fixObjects ? protoFunc : function() {
      var result = protoFunc.apply(this, arguments);
      if (this.length === 0) {
        delete this[0];
      }
      return result;
    };

    lodash.prototype[methodName] = function() {
      var args = arguments;
      if (retUnwrapped && !this.__chain__) {
        return func.apply(this.value(), args);
      }
      return this[chainName](function(value) {
        return func.apply(value, args);
      });
    };
  });

  // Map minified function names to their real names.
  baseForOwn(LazyWrapper.prototype, function(func, methodName) {
    var lodashFunc = lodash[methodName];
    if (lodashFunc) {
      var key = (lodashFunc.name + ''),
          names = realNames[key] || (realNames[key] = []);

      names.push({ 'name': methodName, 'func': lodashFunc });
    }
  });

  realNames[createHybridWrapper(undefined, BIND_KEY_FLAG).name] = [{ 'name': 'wrapper', 'func': undefined }];

  // Add functions to the lazy wrapper.
  LazyWrapper.prototype.clone = lazyClone;
  LazyWrapper.prototype.reverse = lazyReverse;
  LazyWrapper.prototype.value = lazyValue;

  // Add chaining functions to the `lodash` wrapper.
  lodash.prototype.chain = wrapperChain;
  lodash.prototype.commit = wrapperCommit;
  lodash.prototype.concat = wrapperConcat;
  lodash.prototype.plant = wrapperPlant;
  lodash.prototype.reverse = wrapperReverse;
  lodash.prototype.toString = wrapperToString;
  lodash.prototype.run = lodash.prototype.toJSON = lodash.prototype.valueOf = lodash.prototype.value = wrapperValue;

  // Add function aliases to the `lodash` wrapper.
  lodash.prototype.collect = lodash.prototype.map;
  lodash.prototype.head = lodash.prototype.first;
  lodash.prototype.select = lodash.prototype.filter;
  lodash.prototype.tail = lodash.prototype.rest;

  /*--------------------------------------------------------------------------*/

  // Some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose lodash to the global object when an AMD loader is present to avoid
    // errors in cases where lodash is loaded by a script tag and not intended
    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
    // more details.
    root._ = lodash;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return lodash;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js or RingoJS.
    if (moduleExports) {
      (freeModule.exports = lodash)._ = lodash;
    }
    // Export for Rhino with CommonJS support.
    else {
      freeExports._ = lodash;
    }
  }
  else {
    // Export for a browser or Rhino.
    root._ = lodash;
  }
}.call(this));
