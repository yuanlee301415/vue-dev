import config from '../config.js'
import { initUse } from './use.js'
import { initMixin } from './mixin.js'
import { initExtend } from './extend.js'
import { initAssetRegisters } from './assets.js'
import { set, del } from '../observer/index.js'
import { ASSET_TYPES} from "../../shared/constants.js"
import builtInComponents from '../components/index.js'
import { extend, nextTick, mergeOptions, defineReactive } from "../util/index.js"

function initGlobalAPI(Vue) {
  console.info('>>initGlobalAPI')
  const configDef = {}
  configDef.get = () => config
  Object.defineProperty(Vue, 'config', configDef)
  console.log('Vue.config:', configDef)

  Vue.util = {
    extend,
    mergeOptions,
    defineReactive
  }
  console.log('Vue.util:', Vue.util)

  Vue.set = set
  console.log('Vue.set')

  Vue.delete = del
  console.log('Vue.delete')

  Vue.nextTick = nextTick
  console.log('Vue.nextTick')

  Vue.options = Object.create(null)
  console.log('Vue.options:', Vue.options)

  ASSET_TYPES.forEach((type,i) => {
    Vue.options[type + 's'] = Object.create(null)
    console.log(`Vue.options.${type}`)
  })

  Vue.options._base = Vue
  console.log('Vue.options._base')

  extend(Vue.options.components, builtInComponents)
  console.log('Vue.options.components:', Vue.options.components)

  console.group('initUse')
  initUse(Vue)
  console.groupEnd('initUse')

  console.group('initUse')
  initMixin(Vue)
  console.groupEnd('initUse')

  console.group('initExtend')
  initExtend(Vue)
  console.groupEnd('initExtend')

  console.group('initAssetRegisters')
  initAssetRegisters(Vue)
  console.groupEnd('initAssetRegisters')
}

export {
  initGlobalAPI
}
