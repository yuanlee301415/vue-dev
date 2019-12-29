/*2019-12-24 22:39:36*/
import { createTextVNode } from "../vnode.js"
import { isDef, isPrimitive, isTrue, isFalse, isUnDef } from "../../util/index.js"

function simpleNormalizeChildren(children) {
  /*2019-12-26 22:10:11*/
  for (let i = 0, l = children.length; i < l; i++) {
    if (Array.isArray(children[i])) {
      return Array.prototype.concat.call([], children)
    }
  }
  return children
}

function normalizeChildren(children) {
  /*2019-12-26 22:9:52*/
  return isPrimitive(children) ? [createTextVNode(children)] : Array.isArray(children) ? normalizeArrayChildren(children) : void 0
}

function normalizeArrayChildren(children, nestedIndex) {
  const res = []
  let i, child, lastIndex, last
  for (i = 0; i < children.length; i++) {
    child = children[i]
    if (isUnDef(child) || typeof child === 'boolean') continue
    lastIndex = res.length - 1
    last = res[lastIndex]
    if (Array.isArray(child)) {
      if (child.length > 0) {
        child = normalizeArrayChildren(child, `${nestedIndex || ''}_${i}`)
        if (isTextNode(child[0]) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + child.text)
          child.shift()
        }
      res.push.apply(res, child)
      }
    } else if (isPrimitive(child)) {
      if (isTextNode(last)) {
        res[lastIndex] = createTextVNode(last.text + child)
      } else if (child !== '') {
        res.push(createTextVNode(child))
      }
    } else {
      if (isTextNode(child) && isTextNode(last)) {
        res[lastIndex] = createTextVNode(last.text + child.text)
      } else {
        if (isTrue(children._isVlist) && isDef(child.tag) && isUnDef(child.key) && isDef(nestedIndex)) {
          child.key = `__vlist${nestedIndex}_${i}__`
        }
        res.push(child)
      }
    }
  }
  return res
}

function isTextNode(node) {
  return isDef(node) && isDef(node.text) && isFalse(node.isComment)
}

export {
  simpleNormalizeChildren,
  normalizeChildren
}
