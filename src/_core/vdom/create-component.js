/*2019-12-27 20:20:50*/
import VNode from "./vnode.js"
import { resolveConstructorOptions } from "../instance/init.js"
import { queueActivatedComponent } from '../observer/scheduler.js'
import { createFunctionalComponent } from "./create-functional-component.js"
import { isDef, isObject, isTrue, isUnDef } from "../util/index.js"

import { resolveAsyncComponent, createAsyncPlaceholder, extractPropsFromVNodeData } from "./helpers/index.js"
import {
  callHook,
  activeInstance,
  updateChildComponent,
  activateChildComponent,
  deactivateChildComponent
} from "../instance/lifecycle.js"

const componentVNodeHooks  = {
  /*2019-12-26 21:0:49*/
  init (vnode, hydrating, parentElm, refElm) {
    if (!vnode.componentInstance || vnode.componentInstance._isDestroyed) {
      const child = vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        activeInstance,
        parentElm,
        refElm
      )
      child.$mount(hydrating ? vnode.elm : void 0, hydrating)
    } else if (vnode.data.keepAlive) {
      componentVNodeHooks.prepatch(vnode, vnode)
    }
  },

  prepatch (oldVnode, vnode) {
    const options = vnode.componentOptions
    const child = vnode.componentInstance = oldVnode.componentInstance
    updateChildComponent(child, options.propsData, options.listeners, vnode, options.children)
  },

  insert (vnode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      callHook(componentInstance, 'mounted')
    }

    if (vnode.data.keepAlive) {
      context._isMounted ? queueActivatedComponent(componentInstance) : activateChildComponent(componentInstance, true /* direct */)
    }
  },

  destroy (vnode) {
    const { componentInstance } = vnode
    if (!componentInstance) {
      vnode.data.keepAlive ? deactivateChildComponent(componentInstance, true /* direct */) : componentInstance.$destroy()
    }
  }
}

const hooksToMerge = Object.keys(componentVNodeHooks)

function createComponent(Ctor, data, context, children, tag) {
  /*2019-12-25 20:42:11*/
  if (isUnDef(Ctor)) return

  const baseCtor = context.$options._base
  if (isObject(Ctor)) {
    Ctor = baseCtor.extend(Ctor)
  }

  if (typeof Ctor !== 'function') {
    return console.warn(`Invalid Component definition: ${String(Ctor)}`, context)
  }

  let asyncFactory
  if (isUnDef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context)
    if (Ctor === void 0) {
      return createAsyncPlaceholder(asyncFactory, data, context, children, tag)
    }
  }

  data = data || {}
  resolveConstructorOptions(Ctor)

  isDef(data.model) && transformModel(Ctor.options, data)

  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  if (isTrue(Ctor.options.functional)) return createFunctionalComponent(Ctor, propsData, data, context, children)

  const listeners = data.on
  data.on = data.nativeOn
  if (isTrue(Ctor.options.abstract)) {
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }

  mergeHooks(data)

  const name = Ctor.options.name || tag
  return new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data,
    void 0,
    void 0,
    void 0,
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
}

function createComponentInstanceForVnode(vnode, parent, parentElm, refElm) {
  /*2019-12-26 21:9:17*/
  const vnodeComponentOptions = vnode.componentOptions
  const options = {
    _isComponent: true,
    parent,
    propsData: vnodeComponentOptions.propsData,
    _componentTag: vnodeComponentOptions.tag,
    _parentVnode: vnode,
    _parentListeners: vnodeComponentOptions.listeners,
    _renderChildren: vnodeComponentOptions.children,
    _parentElm: parentElm || null,
    _refElm: refElm || null
  }
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  return new vnodeComponentOptions.Ctor(options)
}

function mergeHooks(data) {
  /*2019-12-27 20:9:51*/
  if (!data.hook) {
    data.hook = {}
  }

  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const fromParent = data.hook[key]
    const ours = componentVNodeHooks[key]
    data.hook[key] = fromParent ? mergeHook(ours, fromParent) : ours
  }
}

function mergeHook(one, two) {
  return function (a, b, c, d) {
    one(a, b, c, d)
    two(a, b, c, d)
  }
}

function transformModel(options, data) {
  /*2019-12-27 20:6:53*/
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  data.props = data.props || {}
  data.props[prop] = data.model.value
  const on = data.on || (data.on = {})
  if (isDef(on[event])) {
    on[event] = [data.model.callback].concat(on[event])
  } else {
    on[event] = data.model.callback
  }
}

export {
  createComponent,
  createComponentInstanceForVnode
}
