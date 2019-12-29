/*2019-12-23 22:33:16*/
import { cached, isUnDef } from '../../util/index.js'

const normalizeEvent = cached(name => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~'
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})

function createFnInvoker(fns) {
  function invoker() {
    const fns = invoker.fns
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        cloned[i].apply(null, arguments)
      }
    } else {
      return fns.apply(null, arguments)
    }
  }
  invoker.fns = fns
  return invoker
}

function updateListeners(on, oldOn, add, remove, vm) {
  let name, cur, old, event
  for (name in on) {
    cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    if (isUnDef(cur)) {
      console.warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    } else if (isUnDef(old)) {
      if (isUnDef(cur.fns)) {
        cur = on[name] = createFnInvoker(cur)
      }
      add(event.name, cur, event.once, event.capture, event.passive)
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  for (name in old) {
    if (isUnDef(on[name])) {
      event = normalizeEvent(name)
      remove(event.name, oldOn[name], event.capture)
    }
  }
}


export {
  updateListeners,
  createFnInvoker
}
