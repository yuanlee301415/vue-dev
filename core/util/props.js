/*2019-12-21 22:11:9*/
import { observe, observeState } from "../observer/index.js"

import {
  hasOwn,
  toRawType,
  hyphenate,
  capitalize,
  isPlainObject,
  isObject
} from '../util/index.js'

function validateProp(key, propOptions, propsData, vm) {
  /*2019-12-27 21:16:35*/
  const prop = propOptions[key]
  const absent = !hasOwn(propsData, key)
  let value = propsData[key]

  if (isType(Boolean, prop.type)) {
    if (absent && !hasOwn(prop, 'default')) {
      value = false
    } else if (isType(String, prop.type) && (value === '' || value === hyphenate(key))) {
      value = true
    }
  }

  if (value === void 0) {
    value = getPropDefaultValue(vm, prop, key)
    const prevShouldConvert = observeState.shouldConvert
    observeState.shouldConvert = true
    observe(value)
    observeState.shouldConvert = prevShouldConvert
  }
  return value
}

function getPropDefaultValue(vm, prop, key) {
  /*2019-12-27 21:15:40*/
  if (!hasOwn(prop, 'default')) return void 0
  const def = prop.default
  isObject(def) && console. warn(
    'Invalid default value for prop "' + key + '": ' +
    'Props with type Object/Array must use a factory function ' +
    'to return the default value.',
    vm
  )
  if (vm && vm.$options.propsData && vm.$options.propsData[key] === void 0 && vm._props[key] !== void 0) return vm._props[key]
  else return vm._props[key]
  return typeof def === 'function' && getType(prop.type) !== 'Function' ? def.call(vm) : def
}

function assertProp(prop, name, value, vm, absent) {
  if (prop.required && absent) return
  if (value == null && !prop.required) return

  let type = prop.type
  let valid = !type || type === true
  const expectedTypes = []

  if (type) {
    if (!Array.isArray(type)) {
      type = [type]
    }
    for (let i = 0; i < type.length; i++) {
      const assertedType = assertType(value, type[i])
      expectedTypes.push(assertedType.expectedType || '')
      valid = assertedType.valid
    }
  }

  if (!valid) return console.warn(
    `Invalid prop: type check failed for prop "${name}".` +
    ` Expected ${expectedTypes.map(capitalize).join(', ')}` +
    `, got ${toRawType(value)}.`,
    vm
  )

  const validator = prop.validator
  validator && !validator(value) && console.warn(
    'Invalid prop: custom validator check failed for prop "' + name + '".',
    vm
  )
}

const simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/

function assertType(value, type) {
  let valid
  const expectedType = getType(type)
  if (simpleCheckRE.test(expectedType)) {
    const t = typeof value
    valid = t === expectedType.toLowerCase()
    if (!valid && t === 'object') {
      valid = value instanceof type
    }
  } else if (expectedType === 'Object') {
    valid = isPlainObject(value)
  } else if (expectedType === 'Array') {
    valid = Array.isArray(value)
  } else {
    valid = valid instanceof type
  }
  return {
    valid,
    expectedType
  }
}

function getType(fn) {
  /*2019-12-27 21:12:6*/
  const match = fn && fn.toString().match(/^\s*function (\w+)/)
  return match ? match[1] : ''
}

function isType(type, fn) {
  /*2019-12-27 21:12:28*/
  if (!Array.isArray(fn)) return getType(fn) === getType(type)
  for (let i = 0, l = fn.length; i < l; i++) {
    if (getType(fn[i]) === getType(type)) return true
  }
  return false
}

export {
  validateProp
}
