/*2019-12-21 21:7:48*/
import Vue from './instance/index.js'
import { initGlobalAPI } from './global-api/index.js'
import { isServerRendering } from './util/env.js'

console.group('initGlobalAPI')
initGlobalAPI(Vue)
console.groupEnd('initGlobalAPI')


console.group('$isServer')
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})
console.groupEnd('$isServer')

console.group('$ssrContent')
Object.defineProperty(Vue.prototype, '$ssrContent', {
  get() {
    return this.$vnode && this.$vnode.ssrContent
  }
})
console.groupEnd('$ssrContent')

Vue.version = '__VERSION__'

export default Vue
