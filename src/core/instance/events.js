/*2019-12-23 22:33:33*/
import { updateListeners } from "../vdom/helpers/index.js"
import { formatComponentName, hyphenate } from "../util/index.js"

function eventsMixin(Vue) {
  console.info('>>eventsMixin')

  const hookRE = /^hook:/

  // $on
  Vue.prototype.$on = function (event, fn) {
    if (Array.isArray(event)) {
      event.forEach(evt => this.$on(evt, fn))
    } else {
      if (!this._events[event]) this._events[event] = []
      this._events.push(event, fn)
      if (hookRE.test(event)) {
        this._hasHookEvent = true
      }
    }
    return this
  }
  console.log('Vue.prototype.$on')

  // $once
  Vue.prototype.$once = function (event, fn) {
    const vm = this
    function on() {
      this.$off(event, on)
      fn.apply(vm, arguments)
    }
    on.fn = fn
    this.$on(event, on)
    return this
  }
  console.log('Vue.prototype.$once')

  // $off
  Vue.prototype.$off = function (event, fn) {
    if (!arguments.length) {
      this._events = Object.create(null)
      return this
    }

    if (Array.isArray(event)) {
      event.forEach(evt => this.$off(evt, fn))
      return this
    }

    if (arguments.length === 1) {
      this._events[event] = null
      return this
    }

    const cbs = this._events[event]
    if (!cbs) return this

    if (fn) {
      let cb
      let l = cbs.length
      while (l--) {
        cb = cbs[l]
        if (cb === fn || cb === fn.fn) {
          cbs.splice(l, 1)
          break
        }
      }
    }
    return this
  }
  console.log('Vue.prototype.$off')

  // $emit
  Vue.prototype.$emit = function (event) {
    const vm = this
    const lowerCaseEvent = event.toLowerCase()
    if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
      console.warn(
        `Event "${lowerCaseEvent}" is emitted in component ` +
        `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
        `Note that HTML attributes are case-insensitive and you cannot use ` +
        `v-on to listen to camelCase events when using in-DOM templates. ` +
        `You should probably use "${hyphenate(event)}" instead of "${event}".`
      )
    }
    let cbs = this._events[event]
    if (cbs) {
      const args = Array.from(arguments).slice(1)
      cbs = cbs.length > 1 ? Array.from(cbs) : cbs
      for (let i = 0, l = cbs.length; i < l; i++) {
        try {
          cbs[i].apply(vm, args)
        } catch (e) {
          console.error(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return this
  }
  console.log('Vue.prototype.$emit')
}

function initEvents(vm) {
  console.log('>>initEvents')
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  const listeners = vm.$options._parentListeners
  listeners && updateComponentListeners(vm, listeners)
}

let target
function updateComponentListeners(vm, listeners, oldListeners) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
}

function add(event, fn, once) {
  once ? target.$once(event, fn) : target.$on(event, fn)
}

function remove(event, fn) {
  target.$off(event, fn)
}

export {
  eventsMixin,
  initEvents,
  updateComponentListeners
}
