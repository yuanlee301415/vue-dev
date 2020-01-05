/*2019-12-31 23:11:24*/
import { isDef, isUnDef } from "../../../../core/util/index.js"
import { updateListeners } from "../../../../core/vdom/helpers/index.js"
import { withMacroTask, isIE, supportsPassive } from "../../../../core/util/index.js"
import { RANGE_TOKEN, CHECKBOX_RADIO_TOKEN } from "../../compiler/directives/model.js"

function normalizeEvents(on) {
  if (isDef(on[RANGE_TOKEN])) {
    const event  = isIE ? 'change' : 'input'
    on[event] = [].concat(on[RANGE_TOKEN], on[event] || [])
    delete on[RANGE_TOKEN]
  }

  if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
    on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || [])
    delete on[CHECKBOX_RADIO_TOKEN]
  }
}

let target

function createOnceHandler(handler, event, capture) {
  const _target = target
  return function onceHandler() {
    const res = handler.apply(null, arguments)
    if (res !== null) {
      remove(event, onceHandler, capture, _target)
    }
  }
}

function add(event, handler, once, capture, passive) {
  handler = withMacroTask(handler)
  if (once) handler = createOnceHandler(handler, event, capture)
  target.addEventListener(event, handler, supportsPassive ? { capture, passive } : capture)
}

function remove(event, handler, capture, _target) {
  (_target || target).removeEventListener(event, handler._withTask || handler, capture)
}

function updateDOMListeners(oldVnode, vnode) {
  if (isUnDef(oldVnode.data.on) && isUnDef(vnode.data.on)) return

  const on = vnode.data.on || {}
  const oldOn = oldVnode.data.on || {}
  target = vnode.on
  normalizeEvents(on)
  updateListeners(on, oldOn, add, remove, vnode.context)
}

export default {
  create: updateListeners,
  update: updateListeners
}
