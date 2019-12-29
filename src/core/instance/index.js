/*2019-12-21 21:8:27*/
import { initMixin } from './init.js'
import { stateMixin } from './state.js'
import { eventsMixin } from "./events.js"
import { lifecycleMixin } from './lifecycle.js'
import { renderMixin } from './render.js'

function Vue(options) {
  if (!(this instanceof Vue)) console.warn('Vue is a constructor and should be called with the `new` keyword')
  this._init(options)
}

console.group('initMixin')
initMixin(Vue)
console.groupEnd('initMixin')

console.group('stateMixin')
stateMixin(Vue)
console.groupEnd('stateMixin')

console.group('eventsMixin')
eventsMixin(Vue)
console.groupEnd('eventsMixin')

console.group('lifecycleMixin')
lifecycleMixin(Vue)
console.groupEnd('lifecycleMixin')

console.group('renderMixin')
renderMixin(Vue)
console.groupEnd('renderMixin')

export default Vue
