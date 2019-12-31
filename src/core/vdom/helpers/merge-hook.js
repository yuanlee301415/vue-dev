/*2019-12-30 21:50:36*/
import { createFnInvoker } from "./update-listeners.js"
import { remove, isDef, isUnDef, isTrue } from "../../../shared/util.js"

function mergeVNodeHook (def, hookKey, hook) {
  let invoker
  const oldHook = def[hookKey]

  if (isUnDef(oldHook)) {
    invoker = createFnInvoker([wrappedHook])
  } else {
    if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
      invoker = oldHook
      invoker.fns.push(wrappedHook)
    } else {
      invoker = createFnInvoker([oldHook, wrappedHook])
    }
  }

  invoker.merged = true
  def[hookKey] = invoker

  function wrappedHook() {
    hook.apply(this, arguments)
    remove(invoker.fns, wrappedHook)
  }
}

export {
  mergeVNodeHook
}
