/*2019-12-31 20:29:37*/
import {
  isIE9,
  isEdge,
  extend,
  isDef,
  isUnDef
} from "../../../../core/util/index.js"

import {
  isXlink,
  xlinksNS,
  getXlinkProp,
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from "../../util/index.js"

function updateAttrs(oldVnode, vnode) {
  const opts = vnode.componentOptions
  if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) return
  if (isUnDef(oldVnode.data.attrs) && isUnDef(vnode.data.attrs)) return

  let key, cur, old
  const elm = vnode.elm
  const oldAttrs = oldVnode.data.attrs || {}
  let attrs = vnode.data.attrs || {}

  if (isDef(attrs.__ob__)) {
    attrs = vnode.data.attrs = extend({}, attrs)
  }

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    if (old !== cur) {
      setAttr(elm, key, cur)
    }
  }

  if ((isIE9 || isEdge) && attrs.value !== oldAttrs.value) {
    setAttr(elm, 'value', attrs.value)
  }

  for (key in oldAttrs) {
    if (isUnDef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinksNS, getXlinkProp(key))
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key)
      }
    }
  }
}

function setAttr(el, key, value) {
  if (isBooleanAttr(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      value = key === 'allowfullscreen' && el.tagName === 'EMBED' ? 'true' : key
      el.setAttribute(key, value)
    }
  } else if (isEnumeratedAttr(key)) {
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
  } else if (isXlink(key)) {
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinksNS, getXlinkProp(key))
    } else {
      el.setAttribute(xlinksNS, key, value)
    }
  } else {
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, value)
    }
  }

}

export default {
  create: updateAttrs,
  update: updateAttrs
}
