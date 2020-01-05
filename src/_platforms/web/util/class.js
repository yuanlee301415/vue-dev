/*2019-12-29 16:17:39*/
import { isDef, isObject } from "../../../shared/util.js"

function genClassForVnode(vnode) {
  let data = vnode.data
  let parentNode = vnode
  let childNode = vnode
  while (isDef(childNode.componentInstance)) {
    childNode = childNode.componentInstance._vnode
    if (childNode && childNode.data) {
      data = mergeClassData(childNode.data, data)
    }
  }
  while (isDef(parentNode = parentNode.parent)) {
    if (parentNode && parentNode.data) {
      data = mergeClassData(data, parentNode.data)
    }
  }
  return renderClass(data.staticClass, data.class)
}

function mergeClassData(child, parent) {
  return {
    staticClass: concat(child.staticClass, parent.staticClass),
    class: isDef(child.class) ? [child.class, parent.class] : parent.class
  }
}

function renderClass(staticClass, dynamicClass) {
  if (isDef(staticClass) || isDef(dynamicClass)) return concat(staticClass, stringifyClass(dynamicClass))
  return ''
}

function concat(a, b) {
  return a ? b ? (a + ' ' + b) : a : (b || '')
}

function stringifyClass(value) {
  if (Array.isArray(value)) return stringifyArray(value)
  if (isObject(value)) return stringifyObject(value)
  if (typeof value === 'string') return value
  return ''
}

function stringifyArray(value) {
  let res = []
  let stringifyed
  for (let i = 0, l = value.length; i < l; i++) {
    if (isDef(stringifyed = stringifyClass(value[i])) && stringifyed !== '') {
      res.push(stringifyed)
    }
  }
  return res.join(' ')
}

function stringifyObject(value) {
  let res = []
  for (const key in value) {
    if (value[key]) {
      res.push(key)
    }
  }
  return res.join(' ')
}

export {
  genClassForVnode,
  renderClass,
  concat,
  stringifyClass
}
