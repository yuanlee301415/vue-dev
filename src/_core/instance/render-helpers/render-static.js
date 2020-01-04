import { cloneVNodes, cloneVNode } from "../../vdom/vnode.js"

function markStaticNode(node, key, isOnce) {
  node.isStatic = true
  node.key = key
  node.isOnce = isOnce
}

function markStatic(tree, key, isOnce) {
  if (Array.isArray(tree)) {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i] && typeof tree[i] !== 'string') {
        markStaticNode(tree[i], `${key}_${i}`, isOnce)
      }
    }
  } else {
    markStaticNode(tree, key, isOnce)
  }
}

function renderStatic(index, isInFor) {
  const renderFns = this.$options.staticRenderFns
  const cached = renderFns.cached || (renderFns.cached = [])
  let tree = cached[index]
  if (tree && !isInFor) return Array.isArray(tree) ? cloneVNodes(tree) : cloneVNode(tree)
  tree = cached[index] = renderFns[index].call(this._renderProxy, null, this)
  markStatic(tree, `__static__${index}`, false)
  return false
}

function markOnce(tree, index, key) {
  markStatic(tree, `__once__${index}${key ? `_${key}` : ''}`, true)
}

export {
  renderStatic,
  markOnce
}
