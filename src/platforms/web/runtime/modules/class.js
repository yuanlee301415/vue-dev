/*2019-12-31 20:39:10*/
import {
  isDef,
  isUnDef
} from "../../../../core/util/index.js"

import {
  concat,
  stringifyClass,
  genClassForVnode
} from "../../util/index.js"

function updateClass(oldVnode, vnode) {
  const el = vnode.elm
  const data = vnode.data
  const oldData = oldVnode.data
  if (
    isUnDef(data.staticClass) &&
    isUnDef(data.class) && (
      isUnDef(oldData) || (
        isUnDef(oldData.staticClass) &&
          isUnDef(oldData.data)
        )
    )
  ) return

  let cls = genClassForVnode(vnode)

  const transitionClass = el._trnasitionClasses
  if (isDef(transitionClass)) {
    cls = concat(cls, stringifyClass(transitionClass))
  }

  if (cls !== el._prevClass) {
    el.setAttribute('class', cls)
    el._prevClass = cls
  }
}

export default {
  create: updateClass,
  update: updateClass
}
