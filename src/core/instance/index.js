/*override*/
import { initMixin } from './init.js'
import { stateMixin } from './state.js'
import { renderMixin } from './render.js'
import { eventsMixin } from './events.js'
import { lifecycleMixin } from './lifecycle.js'
import { warn } from '../util/index.js'

function Vue (options) {
  if ('process.env.NODE_ENV' !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue
