import { initState } from './state.js'
import { initRender } from "./render.js"
import { initEvents } from "./events.js"
import { initLifecycle, callHook } from "./lifecycle.js"
import { initProvide, initInjections } from './inject.js'
import { extend, mergeOptions } from "../util/index.js"

let uid = 0

function initMixin(Vue) {
  console.info('>>initMixin')
  console.log('Vue.prototype._init')

  Vue.prototype._init = function (options) {
    console.log(`Vue.prototype._init`)
    this._uid = ++uid
    this._isVue = true
    if (options && options._isComponent) {
      initInternalComponent(this, options)
    } else {
      this.$options = mergeOptions(
        resolveConstructorOptions(this.constructor),
        options || {},
        this
      )
    }
    console.log(`this.$options:`, this.$options)

    this._renderProxy = this
    console.log(`this._renderProxy`, this._renderProxy)

    this._self = this
    console.log(`this._self`, this._self)

    console.group('initLifecycle')
    initLifecycle(this)
    console.groupEnd('initLifecycle')

    console.group('initEvents')
    initEvents(this)
    console.groupEnd('51-initEvents')

    console.group('initRender')
    initRender(this)
    console.groupEnd('initRender')

    callHook(this, 'beforeCreate')
    console.info('callHook:beforeCreate')

    console.group('initInjections')
    initInjections(this)
    console.groupEnd('initInjections')

    console.group('initState')
    initState(this)
    console.groupEnd('initState')

    initProvide(this)

    callHook(this, 'created')

    if (this.$options.el) {
      // this.$mount(this.$options.el)
    }
  }
}

function initInternalComponent(vm, options) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  ~['parent', 'propsDada', '_parentVnode', '_parentListeners', '_renderChildren', '_componentTag', '_parentElm', '_refElm'].forEach(p => opts[p] = options[p])
  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

function resolveConstructorOptions(Ctor) {
  /*2019-12-26 22:16:3*/
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      Ctor.superOptions = superOptions
      const modifiedOptions = resolveModifiedOptions(Ctor)
      modifiedOptions && extend(Ctor.extendOptions, modifiedOptions)
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions(Ctor) {
  let modified
  const latest = Ctor.options
  const extended = Ctor.extendOptions
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  return modified
}

function dedupe(latest, extended, sealed) {
  if (Array.isArray(latest)) {
    const res = []
    sealed = Array.isArray(sealed) ? sealed : [sealed]
    extended = Array.isArray(extended) ? extended: [extended]
    for (let i = 0; i < latest.length; i++) {
      if (extended.includes(latest[i]) || !sealed.includes(extended[i])) {
        res.push(latest[i])
      }
    }
    return res
  } else {
    return latest
  }
}

export {
  initMixin,
  resolveConstructorOptions
}
