/*2020-1-1 15:31:51*/
import { camelize, extend, isPrimitive } from "../../../../shared/util.js"
import {
  mergeVNodeHook,
  isAsyncPlaceholder,
  getFirstComponentChild
} from "../../../../core/vdom/helpers/index.js"

const transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
}

function getRealChild(vnode) {
  const compOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function extractTransitionData(comp) {
  const data = {}
  const options = comp.options
  for (const key in options.propsData) {
    data[key] = comp[key]
  }
  const listeners = options._parentListeners
  for (const key in listeners) {
    data[camelize(key)] = listeners[key]
  }
  return data
}

function placeholder(h, rawChild) {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}

function hasParentTransition(vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transaction) return true
  }
}

function isSameChild(child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

export {
  transitionProps,
  extractTransitionData
}

export default {
  name: 'transition',
  props: transitionProps,
  abstract: true,
  render (h) {
    let children = this.$options._renderChildren
    if (!children) return

    // filter out text nodes (possible whitespaces)
    children = children.filter(c => c.tag || isAsyncPlaceholder(c))
    /* istanbul ignore if */
    if (!children.length) return

    // warn multiple elements
    if (children.length > 1) {
      console.warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      )
    }

    const mode = this.mode
    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in') {
      console.warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      )
    }

    const rawChild = children[0]
    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) return rawChild

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child = getRealChild(rawChild)
    /* istanbul ignore if */
    if (!child) return rawChild

    if (this._leaving) return placeholder(h, rawChild)

    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    const id = "__transition-" + (this._uid) + "-"
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key

    const data = (child.data || (child.data = {})).transition = extractTransitionData(this)
    const oldRawChild = this._vnode
    const oldChild = getRealChild(oldRawChild)

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show' })) {
      child.data.show = true
    }

    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild)
    ) {
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      const oldData = oldChild.data.transition = extend({}, data)
      // handle transition mode
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        this._leaving = true
        mergeVNodeHook(oldData, 'afterLeave', function () {
          this._leaving = false
          this.$forceUpdate()
        })
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        let delayedLeave
        const performLeave = function () { delayedLeave() }
        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)
        mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave })
      }
    }
    return rawChild
  }
}
