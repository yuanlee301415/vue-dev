/*2019-12-22 20:51:8*/
import { mergeOptions } from '../util/index.js'

function initMixin(Vue) {
  Vue.mixin = function (mixin) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
  console.log('Vue.mixin')
}

export {
  initMixin
}
