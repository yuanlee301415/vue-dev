/*override*/
/* @flow */

import config from '../config.js'
import { initUse } from './use.js'
import { initMixin } from './mixin.js'
import { initExtend } from './extend.js'
import { initAssetRegisters } from './assets.js'
import { set, del } from '../observer/index.js'
import { ASSET_TYPES } from '../../shared/constants.js'
import builtInComponents from '../components/index.js'

import {
  warn,
  extend,
  nextTick,
  mergeOptions,
  defineReactive
} from '../util/index.js'

export function initGlobalAPI (Vue) {
  // config
  const configDef = {}
  configDef.get = () => config
  if ('process.env.NODE_ENV' !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }

  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

  Vue.options = Object.create(null)
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  extend(Vue.options.components, builtInComponents)

  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}
