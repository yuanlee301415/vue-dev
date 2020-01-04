/*2019-12-22 20:59:28*/
import { ASSET_TYPES } from "../../shared/constants.js"
import { extend, mergeOptions } from "../util/index.js"
import { defineComputed, proxy } from '../instance/state.js'

function initExtend(Vue) {
  console.log('>>initExtend')

  Vue.cid = 0
  let cid = 1

  Vue.extend = function (extendOptions = {}) {
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})

    if (cachedCtors[SuperId]) return cachedCtors[SuperId]

    const name = extendOptions.name || Super.options.name
    if (!/^[a-zA-Z][\w-]*$/.test(name)) {
      console.warn(
        'Invalid component name: "' + name + '". Component names ' +
        'can only contain alphanumeric characters and the hyphen, ' +
        'and must start with a letter.'
      )
    }
    const Sub = function VueComponent(options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub['super'] =Super
    Sub.options.props && initProps(Sub)
    Sub.options.computed && initComputed(Sub)
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    ASSET_TYPES.forEach(type => Sub[type] = Super[type])

    if (name) {
      Sub.options.components[name] = Sub
    }

    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    cachedCtors[SuperId] = Sub
    return Sub
  }
  console.log(`Vue.extend`)
}

function initProps(Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, '__props__', key)
  }
}

function initComputed(Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed([key]))
  }
}

export {
  initExtend
}
