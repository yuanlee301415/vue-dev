/*2020-1-1 14:46:32*/
import { isTextInputType } from "../../util/index.js"
import { looseEqual, looseIndexOf } from "../../../../shared/util.js"
import { isAndroid, isIE9, isIE, isEdge } from "../../../../core/util/index.js"

if (isIE9) {
  document.addEventListener('selectionchange', () => {
    const el = document.activeElement
    if (el && el.vmodel) {
      trigger(el, 'input')
    }
  })
}

function setSelected(el, binding, vm) {
  actuallySetSelected(el, binding, vm)
  if (isIE || isEdge) {
    setTimeout(() => {
      actuallySetSelected(el, binding, vm)
    }, 0)
  }
}

function actuallySetSelected(el, binding, vm) {
  const value = binding.value
  const isMultiple = el.multiple
  if (isMultiple && !Array.isArray(value)) {
    console.warn(
      `<select multiple v-model="${binding.expression}"> ` +
      `expects an Array value for its binding, but got ${
        Object.prototype.toString.call(value).slice(8, -1)
      }`,
      vm
    )
    return
  }

  let selected, option
  for (let i = 0, l = el.options.length; i < l; i++) {
    option = el.options[i]
    if (isMultiple) {
      selected = looseIndexOf(value, getValue(option)) > -1
      if (option.selected !== selected) {
        option.selected = selected
      }
    } else {
      if (looseEqual(getValue(option), value)) {
        if (el.selectedIndex !== i) {
          el.selectedIndex = i
        }
        return
      }
    }
  }
  if ((!isMultiple)) {
    el.selectedIndex = -1
  }
}

function hasNoMatchingOption(value, option) {
  return option.every(o => !looseEqual(o, value))
}

function getValue(option) {
  return '_value' in option ? option._value : option.value
}

function onCompositionStart(e) {
  e.target.composing = true
}

function onCompositionEnd(e) {
  if (!e.target.composing) return
  e.target.composing = false
  trigger(e.target, 'input')
}

function trigger(el, type) {
  const e = document.createEvent('HTMLEvents')
  e.initEvent(type, true, true)
  el.dispatchEvent(e)
}

export default {
  inserted (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.context)
      el._vOptions = [].map.call(el.options, getValue)
    } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
      el._vModifiers = binding.modifiers
      if (!binding.modifiers.lazy) {
        el.addEventListener('change', onCompositionEnd)
        if (!isAndroid) {
          el.addEventListener('compositionstart', onCompositionStart)
          el.addEventListener('compositionend', onCompositionEnd)
        }
        if (isIE9) {
          el.vmodel = true
        }
      }
    }
  },
  componentUpdate (el, binding, vnode) {
    if (vnode.tag === 'select') {
      setSelected(el, binding, vnode.content)

      const prevOptions = el._vOptions
      const curOptions = el._vOptions = [].map.call(el.options, getValue)
      if (curOptions.some((o, i) => !looseEqual(o, prevOptions[i]))) {
        const needReset = el.multiple ?
          binding.value.some(v => hasNoMatchingOption(v, curOptions))
          : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions)
        if (needReset) {
          trigger(el, 'change')
        }
      }
    }
  }
}
