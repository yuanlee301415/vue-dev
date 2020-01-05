/*2020-1-1 15:2:14*/
import { enter, leave } from '../modules/transition.js'

function locateNode(vnode) {
  return vnode.componentInstance && (!vnode.data || !vnode.data.transaction)
  ? locateNode(vnode.componentInstance._vnode) : vnode
}

export default {
  bind (el, { value }, vnode) {
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transaction
    const originalDisplay = el.__vOriginalDisplay = el.style.display === 'none' ? '' : el.style.display
    if (value && transition) {
      vnode.data.show = true
      enter(vnode, () => {
        el.style.display = originalDisplay
      })
    } else {
      el.style.display = value ? originalDisplay : 'none'
    }
  },
  update (el, { value, oldValue }, vnode) {
    if (value === oldValue) return
    vnode = locateNode(vnode)
    const transition = vnode.data && vnode.data.transaction
    if (transition) {
      vnode.data.show = true
      if (value) {
        enter(vnode, () => {
          el.style.display = el.__vOriginalDisplay
        })
      } else {
        leave(vnode, () => {
          el.style.display = 'none'
        })
      }
    } else {
      el.style.display = value ? el.__vOriginalDisplay : 'none'
    }
  },
  unbind (el, binding, vnode, oldVnode, isDestroy) {
    if (!isDestroy) {
      el.style.display = el.__vOriginalDisplay
    }
  }
}
