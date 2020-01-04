import config from "../config.js"
import Dep from '../observer/dep.js'
import Watcher from '../observer/Watcher.js'
import { isUpdatingChildComponent } from './lifecycle.js'

import {
  set,
  del,
  observe,
  observeState,
  defineReactive
} from '../observer/index.js'

import {
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute
} from '../util/index.js'


const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
function proxy (target, source, key) {
  /*2019-12-27 21:26:36*/
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[source][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[source][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initState (vm) {
  console.info('>>initState')
  vm._watchers = []
  const opts = vm.$options

  opts.props && initProps(vm, opts.props)
  console.log(`initProps`)

  opts.methods && initMethods(vm, opts.methods)
  console.log(`initMethods`)

  opts.data ? initData(vm) : observe(vm._data = {}, true)
  console.log(`initData`)

  opts.computed && initComputed(vm, opts.computed)
  console.log(`initComputed`)

  opts.watch && opts.watch !== nativeWatch && initWatch(vm, opts.watch)
  console.log(`initWatch`)
}

function initMethods(vm, methods) {
  /*2019-12-27 20:49:15*/
  const props = vm.$options.props
  for (const key in methods) {
    methods[key] == null && console. warn(
      `Method "${key}" has an undefined value in the component definition. ` +
      `Did you reference the function correctly?`,
      vm
    )

    props && hasOwn(props, key) && console.warn(
      `Method "${key}" has already been defined as a prop.`,
      vm
    )

    (key in vm) && isReserved(key) && console. warn(
      `Method "${key}" conflicts with an existing Vue instance method. ` +
      `Avoid defining component methods that start with _ or $.`
    )

    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
  }
}

const computedWatcherOptions = { lazy: true}

function initComputed(vm, computed) {
  /*2019-12-27 21:53:17*/
  const watchers = vm._computedWatchers = Object.create(null)
  const isSSR = isServerRendering()
  for (const key in computed) {
    const userDef = computed[key]
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    getter == null && console. warn(
      `Getter is missing for computed property "${key}".`,
      vm
    )

    if (!isSSR) {
      watchers[key] = new Watcher(vm, getter || noop, noop, computedWatcherOptions)
    }

    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else {
      if (key in vm.$data) {
        console.warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        console.warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}

function initProps(vm, propsOptions) {
  /*2019-12-27 21:19:55*/
  const propsData = vm.$options.propsData || {}
  const props = vm._props || {}
  const keys = vm.$options._propKeys
  const isRoot = !vm.$parent
  observeState.shouldConvert = isRoot
  for (const key in propsOptions) {
    keys.push(key)
    const value = validateProp(key, propsOptions, propsData, vm)
    const hyphenatedKey = hyphenate(key)
    if (isReservedAttribute(hyphenatedKey) || config.isReservedAttr(hyphenatedKey)) {
      console.warn(
        `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
        vm
      )
    }
    defineReactive(props, key, value)
    if (!(key in vm)) {
      /*!isUpdatingChildComponent && console.warn(
        `Avoid mutating a prop directly since the value will be ` +
        `overwritten whenever the parent component re-renders. ` +
        `Instead, use a data or computed property based on the prop's ` +
        `value. Prop being mutated: "${key}"`,
        vm
      )*/
      defineReactive()
      !(key in vm) && proxy(vm, '_props_', key)
    }
  }
  observeState.shouldConvert = true
}

function initData(vm) {
  /*2019-12-27 21:38:33*/
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? getData(data, vm) : data || {}
  if (!isPlainObject(data)) {
    data = {}
    console. warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let l = keys.length
  while(l--) {
    const key = keys[l]
    methods && hasOwn(methods, key) && console.warn(
      `Method "${key}" has already been defined as a data property.`,
      vm
    )
    if (props && hasOwn(props, key)) {
      console.warn(
        `Method "${key}" has already been defined as a data property.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, '_data', key)
    }
  }
  observe(data, true)
}

function getData(data, vm) {
  /*2019-12-27 21:25:12*/
  try {
    return data.call(vm, vm)
  } catch (e) {
    console.error(e, vm, 'data()')
    return {}
  }
}

function initWatch(vm, watch) {
  /*2019-12-27 21:58:57*/
  for (const key in watch) {
    const handler = watch[key]
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher (vm, expOrFn, handler, options) {
  /*2019-12-27 21:57:0*/
  if (isPlainObject(handler)) {
    options = handler
    handler = options.handler
  }
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

function stateMixin (Vue) {
  console.info('>>sateMixin')
  const dataDef = {}
  const propsDef = {}
  dataDef.get = function () {
    return this._data
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  console.log('Vue.prototype.$data:', dataDef)

  Object.defineProperty(Vue.prototype, '$props', propsDef)
  console.log('Vue.prototype.$props:', propsDef)

  Vue.prototype.$set = set
  console.log('Vue.prototype.$set')

  Vue.prototype.$del = del
  console.log('Vue.prototype.$del')

  Vue.prototype.$watch = function (expOrFn, cb, options = {}) {
    if (isPlainObject(cb)) return createWatcher(this, expOrFn, cb, options)
    options.user = true
    const watcher = new Watcher(this, expOrFn, cb, options)
    options.immediate && cb.call(this, watcher.value)
    return function unwatchFn () {
      return watcher.teardown()
    }
  }
  console.log('Vue.prototype.$watch')
}

function createComputedGetter(key) {
  /*2019-12-27 20:59:20*/
  return function computedGetter() {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      Dep.target && watcher.depend()
      return watcher
    }
  }
}

function defineComputed(target, key, userDef) {
  /*2019-12-27 20:57:49*/
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache ? createComputedGetter(key) : userDef
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get ? shouldCache && userDef.cache !== false ? createComputedGetter(key) : userDef.get : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (sharedPropertyDefinition.get === noop) {
    sharedPropertyDefinition.set = function () {
      console.warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export {
  getData,
  initState,
  proxy,
  stateMixin,
  defineComputed
}
