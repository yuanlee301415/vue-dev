/*2019-12-27 19:57:27*/
import {
  nextTick,
  emptyObject,
  defineReactive
} from '../util/index.js'

import { createElement } from '../vdom/create-element.js'
import { installRenderHelpers } from "./render-helpers/index.js"
import { resolveSlots } from './render-helpers/resolve-slots.js'
import VNode, { cloneVNode, createEmptyVNode } from "../vdom/vnode.js"

function renderMixin(Vue) {
  console.info('>>renderMixin')

  installRenderHelpers(Vue)

  Vue.prototype.$nextTick = function (fn) {
    return nextTick(fn, this)
  }
  console.log('Vue.prototype.$nextTick')

  Vue.prototype._render = function () {
    const vm = this
    const { render, _parentVNode } = this.$options
    if (this._isMounted) {
      for (const key in this.$slots) {
        const slot = vm.$slots[key]
        vm.$slots[key] = cloneVNode(slot, true/*deep*/)
      }
    }

    this.$scopedSlots = (_parentVNode && _parentVNode.data.$scopedSlots) || emptyObject
    this.$vnode = _parentVNode
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      console.error(e, vm, 'render')
      if (vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          console.error(e, vm, 'renderError')
        }
      } else {
        vnode = vm._vnode
      }
    }

    if (!(vnode instanceof VNode)) {
      vnode = createEmptyVNode()
      if (Array.isArray(vnode)) {
        console.warn('Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
    }
    vnode.parent = _parentVNode
    return this
  }
  console.log('Vue.prototype._render')
}

function initRender(vm) {
  /*2019-12-26 22:1:59*/
  console.info('>>initRender')
  vm._vnode = null
  const options = vm.$options
  const parentVnode = vm.$vnode = options._parentVnode
  const renderContext = parentVnode && parentVnode.context
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  console.log('vm.$slots:', vm.$slots)
  vm.$scopedSlots = emptyObject
  console.log('vm.$scopedSlots:', vm.$scopedSlots)

  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  console.log('Fn:vm._c')

  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
  console.log('Fn:vm.$createElement')

  const parentData = parentVnode && parentVnode.data

  defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
  console.log('defineReactive(vm,"$attrs")')

  defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  console.log('defineReactive(vm,"$listeners")')
}

export {
  renderMixin,
  initRender
}
