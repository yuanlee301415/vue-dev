/*2020-1-1 16:0:22*/
import Vue from '../../../core/index.js'
import config from "../../../core/config.js"
import { extend, noop } from "../../../shared/util.js"
import { mountComponent } from '../../../core/instance/lifecycle.js'
import { devtools, inBrowser, isChrome } from "../../../core/util/index.js"

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from "../util/index.js"

import { patch } from './patch.js'
import platformDirectives from './directives/index.js'
import platformComponents from './components/index.js'

Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknowElement = isUnknownElement

extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)

Vue.prototype.__patch__ = inBrowser ? patch : noop
Vue.prototype.$mount = function (el, hydrating) {
  el = el && inBrowser ? query(el) : void 0
  return mountComponent(this, el, hydrating)
}

Vue.nextTick(() => {
  if (config.devtools) {
    if (devtools) {
      devtools.emit('init', Vue)
    } else if (isChrome) {
      console.info(
        'Download the Vue Devtools extension for a better development experience:\n' +
        'https://github.com/vuejs/vue-devtools'
      )
    }
  }

  if (config.productionTip !== false && inBrowser && typeof console !== 'undefined') {
    console.info(
      `You are running Vue in development mode.\n` +
      `Make sure to turn on production mode when deploying for production.\n` +
      `See more tips at https://vuejs.org/guide/deployment.html`
    )
  }
}, 0)


export default Vue
