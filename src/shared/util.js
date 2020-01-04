/*2020-1-3 23:08:56*/
const _toString = Object.prototype.toString

function isUnDef(v) {
  return v === void 0 || v === null
}

function isDef(v) {
  return v !== void 0 && v !== null
}

function isTrue(v) {
  return v === true
}

function isFalse(v) {
  return v === false
}

function isPrimitive(v) {
  const type = typeof v
  return type === 'string' || type === 'number' || type === 'boolean'
}

function isObject(val) {
  return val !== null && 'object' === typeof val
}

function toRawType(value) {
  return _toString.call(value).slice(8, -1)
}

function isPlainObject (obj) {
  /*2019-12-27 21:25:35*/
  return _toString.call(obj) === '[object Object]'
}

function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}

function isValidArrayIndex (idx) {
  const n = parseFloat(String(idx))
  return n >= 0 && Math.floor(n) === n && isFinite(idx)
}

function toString(val) {
  return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
}

function toNumber(val) {
  const n = parseFloat(val)
  return isNaN(n) ? val: n
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

function remove (list, item) {
  return list.splice(list.findIndex(item), 1)
}

function  hasOwn(obj, key) {
  /*2019-12-27 20:48:46*/
  return Object.prototype.hasOwnProperty.call(obj, key)
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

function bind(fn, ctx) {
  /*2019-12-27 20:47:32*/
  function bindFn(a) {
    const l = arguments.length
    return l ? l > 1 ? fn.apply(ctx, arguments) : fn.call(ctx, a) : fn.call(ctx)
  }
  bindFn._length = fn.length
  return bindFn
}

function toArray(list, start = 0) {
  let i = list.length - start
  const ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

function extend(target, source) {
  for (const key in source) {
    target[key] = source[key]
  }
  return target
}

function toObject(arr) {
  const res = {}
  for (let i = 0; i < arr.length; i++) {
    arr[i] && extend(res, arr[i])
  }
}

function noop (a, b, c) {
  /*2019-12-27 20:47:49*/
}

const no = (a, b, c) => false

const identity = _ => _

function genStaticKeys(modules) {
  return modules.reduce((keys, m) => {
    return keys.concat(m.staticKeys || [])
  }, []).join(',')
}

function looseEqual(a, b) {
  if (a === b) return true
  const isObjectA = isObject(a)
  const isObjectB = isObject(b)
  if (isObjectA && isObjectB) {
    try {
      const isArrayA = Array.isArray(a)
      const isArrayB = Array.isArray(b)
      if (isArrayA && isArrayB) {
        return a.length === b.length && a.every((e, i) => {
          return looseEqual(e, b[i])
        })
      } else if (!isArrayA && !isArrayB) {
        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        return keysA.length === keysB.length && keysA.every(key => {
          return looseEqual(a[key], b[key])
        })
      } else {
        /* istanbul ignore next */
        return false
      }
    } catch (e) {
      /* istanbul ignore next */
      return false
    }
  } else if (!isObjectA && !isObjectB) {
    return String(a) === String(b)
  } else {
    return false
  }
}

function looseIndexOf(arr, val) {
  for (let i = 0; i < arr.length; i++) {
    if (looseEqual(arr[i], val)) return i
  }
  return -1
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

export {
  isUnDef,
  isDef,
  isTrue,
  isFalse,
  isPrimitive,
  isObject,
  toRawType,
  isPlainObject,
  isRegExp,
  isValidArrayIndex,
  toString,
  toNumber,
  makeMap,
  isBuiltInTag,
  isReservedAttribute,
  remove,
  hasOwn,
  cached,
  camelize,
  capitalize,
  hyphenate,
  bind,
  toArray,
  extend,
  toObject,
  noop,
  no,
  identity,
  genStaticKeys,
  looseEqual,
  looseIndexOf,
  once
}
