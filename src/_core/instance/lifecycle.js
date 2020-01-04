/*2019-12-29 18:16:21*/
import config from "../config.js"
import Watcher from "../observer/Watcher.js"
import { mark, measure } from '../util/perf.js'
import { createEmptyVNode } from "../vdom/vnode.js"
import { observeState } from "../observer/index.js"
import { updateComponentListeners } from "./events.js"
import { resolveSlots } from "./render-helpers/resolve-slots.js"
import { noop, remove, emptyObject, validateProp } from "../util/index.js"

let activeInstance = null
let isUpdatingChildComponent = false

function lifecycleMixin(Vue) {
  /*2019-12-24 21:11:45*/
  console.info('>>lifecycleMixin')

  Vue.prototype._update = function (vnode, hydrating) {
    this._isMounted && callHook(this, 'beforeUpdate')

    const prevEl = this.$el
    const prevVNode = this._vnode
    const prevActiveInstance = activeInstance
    activeInstance = this
    this._vnode = vnode
    if (!prevVNode) { // 初始渲染
      this.$el = this.__patch__(
        this.$el,
        vnode,
        hydrating,
        false,/*remove only*/
        this.$options._parentElm,
        this.$options._refElm
      )
      this.$options._parentElm = this.$options._refElm = null
    } else {
      // updates
      this.$el = this.__patch__(prevVNode, vnode)
    }
    activeInstance = prevActiveInstance
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (this.$el) {
      this.$el.__vue__ = this
    }
    if (this.$vnode && this.$parent && this.$vnode === this.$parent._vnode) {
      this.$parent.$el = this.$el
    }
  }
  console.log('Vue.prototype._update')

  Vue.prototype.$forceUpdate = function () {
    this._watcher && this._watcher.update()
  }
  console.log('Vue.prototype.$forceUpdate')

  Vue.prototype.$destroy = function () {
    if (this._isBeingDestroyed) return
    callHook(this, 'beforeDestroy')
    this._isBeingDestroyed = true

    // remove self from parent
    const parent = this.$parent
    if (parent && !parent._isBeingDestroyed && !this.$options.abstract) {
      remove(parent.$children, this)
    }

    // teardown watchers
    this._watcher && this._watcher.teardown()

    let l = this._watchers.length
    while (l--) {
      this._watchers[l].teardown()
    }

    // remove reference from data ob
    // frozen object may not have observer
    if (this._data.__ob__) {
      this._data.__ob__.vmCount--
    }

    // call the last hook
    this._isDestroyed = true
    this.__patch__(this._vnode, null)
    callHook(this, 'destroyed')
    this.$off()

    if (this.$el) {
      this.$el.__vue__ = null
    }

    if (this.$vnode) {
      this.$vnode.parent = null
    }
  }
  console.log('Vue.prototype.destroy')
}

function initLifecycle(vm) {
  /*2019-12-22 22:3:9*/
  console.info('>>initLifecycle')
  const options = vm.$options
  let parent = options.parent
  if (parent && !options.abstract) {
    while(parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    parent.$children.push(vm)
  }

  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm
  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
  console.log('init>this.$parent/$root/$children/$refs/_watcher/_inactive/_directInactive/_isMounted/_isDestroyed/_isBeingDestroyed')
}

function mountComponent(vm, el, hydrating) {
  /*2019-12-29 18:12:23*/
  vm.$el = el
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') || vm.$options.el || el) {
      console.warn(
        'You are using the runtime-only build of Vue where the template ' +
        'compiler is not available. Either pre-compile the templates into ' +
        'render functions, or use the compiler-included build.',
        vm
      )
    } else {
      console.warn(
        'Failed to mount component: template or render function not defined.',
        vm
      )
    }
  }

  callHook(vm, 'beforeMount')

  let updateComponent
  if (config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  vm._watcher = new Watcher(vm, updateComponent, noop, null, true)
  hydrating = false

  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}

function updateChildComponent(vm, propsData, listeners, parentVnode, renderChildren) {
  /*2019-12-26 21:29:6*/
  const hasChildren = !!(
    renderChildren || // has new static slots
    vm.$options._renderChildren || // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode
  if (vm._vnode) {
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  vm.$attrs = (parentVnode.data && parentVnode.data.attrs) || emptyObject
  vm.$listeners = listeners || emptyObject

  if (propsData && vm.$options.props) {
    observeState.shouldConvert = false
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      props[key] = validateProp(key, vm.$options.props, propsData, vm)
    }
    observeState.shouldConvert = true
    vm.$options.propsData = propsData
  }

  if (listeners) {
    const oldListeners = vm.$options._parentListeners
    vm.$options._parentListeners = listeners
    updateComponentListeners(vm, listeners, oldListeners)
  }

  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }
}

function isInInactiveTree(vm) {
  /*2019-12-27 20:19:47*/
  while(vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

function activateChildComponent(vm, direct) {
  /*2019-12-27 20:19:40*/
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) return
  } else if (vm._directInactive) return

  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}

function deactivateChildComponent(vm, direct) {
  /*2019-12-27 20:19:17*/
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) return
  }

  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
  }
}

function callHook(vm, hook) {
  /*2019-12-23 20:22:51*/
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, l = handlers.length; i < l; i++) {
      try {
        handlers[i].call(vm)
      } catch (e) {
        console.error(e, vm, `${hook} hook`)
      }
    }
  }
  vm._hasHookEvent && vm.$emit(`hook:${hook}`)
}

export {
  activeInstance,
  isUpdatingChildComponent,
  initLifecycle,
  lifecycleMixin,
  mountComponent,
  updateChildComponent,
  isInInactiveTree,
  activateChildComponent,
  deactivateChildComponent,
  callHook
}
