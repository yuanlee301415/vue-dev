/*2019-12-26 20:26:2*/

import VNode from "./vnode.js"
import { createElement } from "./create-element.js"
import { resolveInject } from "../instance/inject.js"
import { resolveSlots } from "../instance/render-helpers/resolve-slots.js"
import { installRenderHelpers } from '../instance/render-helpers/index.js'

import {
  isDef,
  isTrue,
  camelize,
  emptyObject,
  validateProp
} from "../util/index.js"

function FunctionalRenderContext(data, props, children, parent, Ctor) {
  /*2019-12-26 20:19:57*/
  const options = Ctor.options
  this.data = data
  this.props = props
  this.children = children
  this.parent = parent
  this.listeners = data.on || emptyObject
  this.injections = resolveInject(options.inject, parent)
  this.slots = () => resolveSlots(children, parent)

  const contextVm = Object.create(parent)
  const isCompiled = isTrue(options._compiled)
  const needNormalization = !isCompiled

  if (isCompiled) {
    this.$options = options
    this.$slots = this.slots()
    this.$scopedSlots = data.scopedSlots || emptyObject
  }

  if (options._scopeId) {
    this._c = (a, b, c, d) => {
      const vnode = createElement(contextVm, a, b, c, d, needNormalization)
      if (vnode) {
        vnode.functionalScopeId = options._scopeId
        vnode.functionalContext = parent
      }
      return vnode
    }
  } else {
    this._c = (a, b, c, d) => createElement(contextVm, a, b, c, d, needNormalization)
  }
}

installRenderHelpers(FunctionalRenderContext.prototype)

function createFunctionalComponent(Ctor, propsData, data, contextVm, children) {
  /*2019-12-26 20:21:21*/
  const options = Ctor.options
  const props = {}
  const propOptions = options.props
  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || emptyObject)
    }
  } else {
    isDef(data.attrs) && mergeProps(props, data.attrs)
    isDef(data.props) && mergeProps(props, data.props)
  }

  const renderContext = new FunctionalRenderContext(data, props, children, contextVm, Ctor)
  const vnode = options.render.call(null, renderContext._c, renderContext)
  if (vnode instanceof VNode) {
    vnode.functionalContext = contextVm
    vnode.functionalOptions = options
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot
    }
  }
  return vnode
}

function mergeProps(to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key]
  }
}

export {
  createFunctionalComponent
}
