/*2019-12-31 20:56:27*/
import {
  isDef,
  isUnDef,
  extend,
  toNumber
} from "../../../../core/util/index.js"
import {no} from "../../../../core/util/index"

function updateDomProps(oldVnode, vnode) {
  if (isUnDef(oldVnode.data.domProps) && isUnDef(vnode.data.domProps)) return

  let key, cur
  const elm = vnode.elm
  const oldProps = oldVnode.data.domProps || {}
  let props = vnode.data.domProps
  if (isDef(props.__ob__)) {
    props = vnode.data.domProps = extend({}, props)
  }

  for (key in oldProps) {
    if (isUnDef(props[key])) {
      elm[key] =''
    }
  }

  for (key in props) {
    cur = props[key]
    if (key === 'textContent' || key === 'innerHTML') {
      if (vnode.children) vnode.children.length = 0
      if (cur === oldProps[key]) continue

      if (elm.children.length === 1) {
        elm.removeChild(elm.childNodes[0])
      }
    }

    if (key === 'value') {
      elm._value = cur
      const strCur = isUnDef(cur) ? '' : String(cur)
      if (shouldUpdateValue(elm, strCur)) {
        elm.value = strCur
      } else {
        elm[key] = cur
      }
    }
  }

  function shouldUpdateValue(elm, checkVal) {
    return (!elm.composing &&
        elm.tagName === 'OPTION' ||
        isDirty(elm, checkVal) ||
        isInputChanged(elm, checkVal)
    )
  }

  function isDirty(elm, checkVal) {
    let notInFocus = true
    try {
      notInFocus = document.activeElement !== elm
    } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  function isInputChanged(elm, newVal) {
    const value = elm.value
    const modifiers = elm._vModifiers
    if (isDef(modifiers) && modifiers.number) {
      return toNumber(value) !== toNumber(newVal)
    }
    if (isDef(modifiers) && modifiers.trim) {
      return value.trim() !== newVal.trim()
    }
    return value !== newVal
  }

}

export default {
  create: updateDomProps,
  update: updateDomProps
}
