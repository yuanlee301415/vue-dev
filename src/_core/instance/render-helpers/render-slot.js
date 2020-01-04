import { extend } from '../../util/index.js'

function renderSlot(name, fallback, props, bindObject) {
  const scopedSlotFn = this.$scopedSlots[name]
  if (scopedSlotFn) {
    props = props || {}
    if (bindObject) {
      props = extend(extend({}, bindObject), props)
    }
    return scopedSlotFn(props) || fallback
  } else {
    return this.$slots[name] || fallback
  }
}

export {
  renderSlot
}
