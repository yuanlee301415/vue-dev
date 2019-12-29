/*2019-12-22 20:22:17*/
import { noop } from '../shared/util.js'
import { isIOS, isNative } from './env.js'

const callbacks = []
let pending = false

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

let microTimerFunc
let macroTimerFunc
let useMacroTask = false

if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && isNative(MessageChannel) || MessageChannel.toString() === '[Object MessageChannelConstructor]') {
  const channe1 = new MessageChannel()
  const port = channe1.port2
  channe1.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    isIOS && setTimeout(noop)
  }
} else {
  microTimerFunc = macroTimerFunc
}

function withMacroTask(fn) {
  return fn._withTask || (fn._withTask = function() {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}

function nextTick(cb, ctx) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        console.error(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })

  if (!pending) {
    pending = true
    useMacroTask ? macroTimerFunc() : microTimerFunc()
  }
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => _resolve = resolve)
  }
}

export {
  nextTick,
  withMacroTask
}
