const _toString = Object.prototype.toString

function isDef(val) {
  return val !== void 0 && val !== null
}

function isObject(val) {
  return val !== null && 'object' === typeof val
}

function  hasOwn(obj, key) {
  /*2019-12-27 20:48:46*/
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function remove (list, item) {
  return list.splice(list.findIndex(item), 1)
}

function noop () {
  /*2019-12-27 20:47:49*/
}

function isPlainObject (obj) {
  /*2019-12-27 21:25:35*/
  return _toString.call(obj) === '[object Object]'
}

function isValidArrayIndex (idx) {
  const n = parseFloat(String(idx))
  return n >= 0 && Math.floor(n) === n && isFinite(idx)
}

function toString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val) : String(val)
}

function toNumber(val) {
  const n = parseFloat(val)
  return isNaN(n) ? val: n
}

function looseEqual(a, b) {
  if (a === b) return true
  const isObjA = isObject(a)
  const isObjB = isObject(b)
  if (isObjA && isObjB) {
    const isAryA = Array.isArray(a)
    const isAryB = Array.isArray(b)
    if (isAryA && isAryB) {
      return a.length === b.length && a.every((_, i) => looseEqual(_, b[i]))
    } else if (!isAryA && !isAryB) {
      const keysA = Object.keys(a)
      const keysB = Object.keys(b)
      return keysA.length === keysB.length && keysA.every(key => looseEqual(a[key], b[key]))
    } else {
      return false
    }
  } else if (!isObjA && !isObjB) {
    return String(a) === String(b)
  } {
    return false
  }
}

function looseIndexOf(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
}

function extend(target, source) {
  for (const key in source) {
    target[key] = source[key]
  }
  return target
}

function identity(_) {
  return _
}

function cached(fn) {
  const cache = Object.create(null)
  return function cachedFn(str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

const camelizeRE = /-(\w)/g
const camelize = cached(str => str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : ''))

const capitalize = cached(str => str.charAt(0).toUpperCase() + str.slice(1))

const hyphenateRE = /\B([A-Z])/g
const hyphenate = cached(str => str.replace(hyphenateRE, '-$1').toLowerCase())

function toObject(arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    arr[i] && extend(res, arr[i])
  }
}

function makeMap(str, expectsLowerCase) {
  const map = Object.create(null)
  const list = str.split(',')
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true
  }
  return expectsLowerCase ? val => map[val.toLowerCase()] : val => map[val]
}

const isBuiltInTag = makeMap('slot,component', true)

const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

const no = (a, b, c) => false

function toArray(list, start = 0) {
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}

function bind(fn, ctx) {
  /*2019-12-27 20:47:32*/
  function bindFn(a) {
    const l = arguments.length
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx)
  }
  bindFn._length = fn.length
  return bindFn
}

function toRawType(value) {
  return _toString.call(value).slice(8, -1)
}

function isUnDef(v) {
  return v === void 0 || v === null
}

function isPrimitive(v) {
  const type = typeof v
  return v === 'string' || v === 'number' || v === 'boolean'
}

function isTrue(v) {
  return v === true
}

function isFalse(v) {
  return v === false
}

function once(fn) {
  let called = false
  return function () {
    if (!called) {
      called = true
      fn.apply(this, arguments)
    }
  }
}

function genStaticKeys(modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, [].join(','))
}

export {
  isDef,
  isObject,
  hasOwn,
  remove,
  noop,
  isPlainObject,
  isValidArrayIndex,
  toString,
  toNumber,
  looseEqual,
  looseIndexOf,
  extend,
  identity,
  cached,
  camelize,
  capitalize,
  hyphenate,
  toObject,
  makeMap,
  isReservedAttribute,
  no,
  toArray,
  isRegExp,
  bind,
  toRawType,
  isUnDef,
  isPrimitive,
  isTrue,
  isFalse,
  once,
  genStaticKeys,
  isBuiltInTag
}
