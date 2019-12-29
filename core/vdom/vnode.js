class   VNode {
  /*2019-12-27 21:49:5*/
  tag
  data // VNodeDate
  children //Array<VNode>
  text
  elm // Node
  ns
  context // Component
  key
  componentOptions // VNodeComponentOptions
  componentInstance // Component
  parent // VNode
  raw // contains raw HTML
  isStatic // static node
  isRootInsert
  isComment // empty comment placeholder ?
  isCloned // is a cloned node
  asyncFactory // async component function
  asyncMeta
  isAsyncPlaceholder
  ssrContent
  functionalContext // Component:real context vm for functional nodes
  functionalOptions // ComponentOptions
  functionalScoped

  constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = void 0
    this.context = context
    this.functionalContext = void 0
    this.functionalOptions = void 0
    this.functionalScopeId = void 0
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = void 0
    this.parent = void 0
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = void 0
    this.isAsyncPlaceholder = false
  }
}
VNode.prototype.child = {
  get () {
    return this.componentInstance
  }
}

function createEmptyVNode(text) {
  const vnode = new VNode()
  vnode.text = text
  vnode.isComment = true
  return vnode
}

function createTextVNode(text) {
  return new VNode(void 0, void 0, void 0, text)
}

function cloneVNode(vnode, deep) {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  if (deep && vnode.children) {
    vnode.children = cloneVNodes(vnode.children, deep)
  }
}

function cloneVNodes(vnodes, deep) {
  const l = vnodes.length
  const res = new Array(l)
  for (let i = 0; i < l; i++) {
    res[i] = cloneVNode(vnodes[i], deep)
  }
  return res
}

export default VNode
export {
  createEmptyVNode,
  createTextVNode,
  cloneVNode,
  cloneVNodes
}
