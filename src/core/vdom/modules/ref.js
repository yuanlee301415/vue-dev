/*2019-12-30 21:39:38*/
import { remove } from "../../../shared/util.js"

export default {
  create (_, vnode) {
    registerRef(vnode)
  },
  update (oldVnode, vnode) {
    if (oldVnode.data.ref !== vnode.data.ref) {
      registerRef(oldVnode, true)
      registerRef(vnode)
    }
  },
  destroy (vnode) {
    registerRef(vnode, true)
  }
}

function registerRef(vnode, isRemoval) {
  /*2019-12-29 21:37:39*/
  const key = vnode.data.ref
  if  (!key) return

  const vm = vnode.content
  const ref = vnode.componentInstance || vnode.elm
  const refs = vm.$refs
  if (isRemoval) {
    if (Array.isArray(refs[key])) {
      remove(refs[key], ref)
    } else if (refs[key] === ref) {
      refs[key] = void 0
    }
  } else {
    if (vnode.data.refInFor) {
      if (!Array.isArray(refs[key])) {
        refs[key] = [ref]
      } else if (refs[key].indexOf(ref) < 0) {
        refs[key].push(ref)
      }
    } else {
      refs[key] = ref
    }
  }
}

export {
  registerRef
}
