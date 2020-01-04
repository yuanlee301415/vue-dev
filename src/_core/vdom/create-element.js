import config from "../config.js"
import VNode, { createEmptyVNode } from "./vnode.js"
import { createComponent } from "./create-component.js"
import {
  isPrimitive,
  isTrue,
  isDef,
  resolveAsset
} from '../util/index.js'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from "./helpers/index.js"

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

function createElement(context, tag, data, children, normalizationType, alwaysNormalize) {
  /*2019-12-26 22:3:51*/
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = void 0
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

function _createElement(context, tag, data, children, normalizationType) {
  /*2019-12-26 22:8:32*/
  if (isDef(data) && isDef(data.__ob__)) {
    console.warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag)  return createEmptyVNode()

  if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
    console.warn(
      'Avoid using non-primitive value as key, ' +
      'use string/number value instead.',
      context
    )
  }

  if (Array.isArray(children) && typeof children[0] === 'function') {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }

  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }

  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      vnode = new VNode(config.parsePlatformTagName(tag), data, children, void 0, void 0, context)
    } else if(isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      vnode = new VNode(tag, data, children, void 0, void 0, context)
    }
  } else {
    vnode = createComponent(tag, data, context, children)
  }
  if (isDef(vnode)) {
    ns && applyNS(vnode, ns)
    return vnode
  } else {
    return createEmptyVNode()
  }
}

function applyNS(vnode, ns, force) {
  /*2019-12-26 22:12:16*/
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    ns = void 0
    force = false
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (isDef(child.ns) || isTrue(force))) {
        applyNS(child, ns, force)
      }
    }
  }
}

export {
  createElement,
  _createElement
}
