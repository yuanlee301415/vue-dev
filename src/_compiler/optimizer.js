/*2020-1-3 23:33:52*/
import { makeMap, isBuiltInTag, cached, no } from "../shared/util.js"

let isStaticKey
let isPlatformReservedTag

const genStaticKeysCache = cached(genStaticKeys)

function optimize(root, options) {
  if (!root) return
  isStaticKey = genStaticKeysCache(options.staticKeys || '')
  isPlatformReservedTag = options.isReservedTag || no

  markStatic(root)
  markStaticRoots(root, false)
}

function genStaticKeys(keys) {
  return makeMap('type,tag,attrsList,attrsMap,plain,parent,children,attrs') + (keys ? `,${keys}` : '')
}

function markStatic(node) {
  node.static = isStatic(node)
  if (node.type !== 1) return

  if (
    !isPlatformReservedTag(node.tag) &&
    node.tag !== 'slot' &&
    node.attrsMap['inline-template'] == null
  ) return

  for (let i = 0, l = node.children.length; i < l; i++) {
    const child = node.children[i]
    markStatic(child)
    if (!child.static) {
      node.static = false
    }
  }

  if (node.ifConditions) {
    for (let i = 1, l = node.ifConditions.length; i < l; i++) {
      const block = node.ifConditions[i].block
      markStatic(block)
      if (!block.static) {
        node.static = false
      }
    }
  }
}

function markStaticRoots(node, isInFor) {
  if (node.type !== 1) return

  if (node.static || node.once) {
    node.staticInFor = isInFor
  }

  if (node.static && node.children.length && !(node.children.length === 1 && node.children[0].type === 3)) {
    node.staticRoot = true
    return
  } else {
    node.staticRoot = false
  }

  if (node.children) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      markStaticRoots(node.children[i], isInFor || !!node.for)
    }
  }

  if (node.ifConditions) {
    for (let i = 0, l = node.ifConditions.length; i < l; i++) {
      markStaticRoots(node.ifConditions[i].block, isInFor)
    }
  }
}

function isStatic(node) {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(node.pre || (
    !node.hasBindings && // no dynamic bindings
      !node.if && !node.for && // not v-if of v-else
      !isBuiltInTag(node.tag) && // not built-in
      isPlatformReservedTag(node.tag) && // not a component
      !isDirectChildOfTemplateFor(node) &&
      Object.keys(node).every(isStatic)
  ))
}

function isDirectChildOfTemplateFor(node) {
  while (node.parent) {
    node = node.parent
    if (node.tag !== 'template') return false
    if (node.for) return true
  }
  return false
}

export {
  optimize
}
