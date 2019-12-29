import Dep from "./dep.js"
import VNode from '../vdom/vnode.js'
import { arrayMethods } from "./array.js"
import { def, isObject, hasOwn, hasProto, isPlainObject, isValidArrayIndex, isServerRendering } from "../util/index.js"

const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
const observeState = {
  shouldConvert: true
}

class Observer {
  /*2019-12-27 21:37:20*/
  value
  dep
  vmCount
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
  observeArray(items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

function protoAugment (target, src) {
  // console.log('protoAugment>target:', target)
  target.__proto__ = src
  // console.log('__proto__', target.__proto__)
}

function copyAugment (target, source, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, source[key])
  }
}
function observe(value, asRootData) {
  /*2019-12-27 21:27:58*/
  if (!isObject(value) || value instanceof VNode) return
  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    observeState.shouldConvert &&
    !isServerRendering() &&
    Array.isArray(value) || isPlainObject(value) &&
    Object.isExtensible(value) &&
    !value._isVue) {
    ob = new Observer(value)
  }
  if (asRootData && ob) {
    ob.vmCount++
  }
  return ob
}

function defineReactive(obj, key, val, customSetter, shallow) {
  /*2019-12-22 20:39:34*/
  const property = Object.getOwnPropertyDescriptor(obj, key)
  if (property && property.configurable === false) return

  const dep = new Dep()
  const getter = property && property.get
  const setter = property && property.set
  let childOb = !shallow && observe(val)

  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const value = getter ? getter.call(obj) : val
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
    return value
    },
    set: function reacttiveSetter (newVal) {
      const value = getter ? getter.call(obj): val
      if (newVal === value || (newVal !== newVal && value !== value)) return
      customSetter && customSetter()
      if (setter) {
        setter.call(obj, newVal)
      } else {
        val = newVal
      }
      childOb = !shallow && observe(newVal)
      dep.notify()
    }
  })
}

function set (target, key, val) {
  console.log('$set:', { target, key, val })
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, val)
    return val
  }
  if (hasOwn(target, key)) {
    target[key] = val
    return val
  }
  const ob = target.__ob__
  if (target._isVue || (ob && ob.vmCount)) return val
  if (!ob) {
    target[key] = val
    return val
  }
  defineReactive(ob.value, key, val)
  ob.dep.notify()
  return val
}

function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }
  const ob = target.__ob__
  if (target._isVue || (ob && ob.vmCount)) return
  if (!hasOwn(target, key)) return
  delete target[key]
  ob && ob.dep.notify()
}

function dependArray(value) {
  for (let val, i = 0, l = value.length; i < l; i++) {
    val = value[i]
    val && val.__ob__ && val.__ob__.depend()
    Array.isArray(val) && dependArray(val)
  }
}

export {
  Observer,
  observe,
  defineReactive,
  set,
  del,
  observeState
}
