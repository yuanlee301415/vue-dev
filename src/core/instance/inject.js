import { hasSymbol, defineReactive } from "../util/index.js"
import { observerState } from "../observer/index.js"

function initProvide(vm) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function' ? provide.call(vm) : provide
  }
}

function initInjections(vm) {
  const ret = resolveInject(vm.$options.inject, vm)
  if (ret) {
    observerState.shouldConvert = false
    Object.keys(ret).forEach(key => {
      defineReactive(vm, key, ret[key])
    })
    observerState.shouldConvert = true
  }
}

function resolveInject(inject, vm) {
  /*2019-12-26 20:15:36*/
  if (!inject) return
  const res = Object.create(null)
  const keys = hasSymbol ? Reflect.ownKeys(inject).filter(key => Object.getOwnPropertyDescriptor(inject, key).enumerable) :  Object.keys(inject)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const provideKey = inject[key].from
    let source = vm
    while (source) {
      if (source._provided && provideKey in source._provided) {
        res[key] = source._provided[provideKey]
        break
      }
      source = source.$parent
    }

    if (!source) {
      if ('default' in inject[key]) {
        const provideDefault = inject[key].default
        res[key] = typeof provideDefault === 'function' ? provideDefault.call(vm) : provideDefault
      } else {
        console.warn(`Injection "${key}" not found`, vm)
      }
    }
  }
  return res
}

export {
  initProvide,
  initInjections,
  resolveInject
}
