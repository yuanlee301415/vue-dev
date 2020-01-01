/*2020-1-1 13:32:4*/
import { inBrowser, isIE9 } from "../../../core/util/index.js"
import { addClass, removeClass } from "./class-util.js"
import { remove, extend, cached } from "../../../shared/util.js"

function resolveTransition(def) {
  if (!def) return

  if (typeof def === 'object') {
    const res = {}
    if (def.css !== false) {
      extend(res, autoCssTransition(def.name) || 'v')
    }
    extend(res, def)
    return res
  } else if (typeof def === 'string') {
    return autoCssTransition(def)
  }
}

const autoCssTransition = cached(name => {
  return {
    enterClass: `${name}-enter`,
    enterToClass: `${name}-enter-to`,
    enterActiveClass: `${name}-enter-active`,
    leaveClass: `${name}-leave`,
    leaveToClass: `${name}-leave-to`,
    leaveActiveClass: `${name}-leave-active`
  }
})

const hasTransition = inBrowser && !isIE9
const TRANSITION = 'transition'
const ANIMATION = 'animation'

let transitionProp = 'transition'
let transitionEndEvent = 'transitionend'
let animationProp = 'animation'
let animationEndEvent = 'animationend'

if (hasTransition) {
  if (window.ontransitionend === void 0 && window.onwebkittransitionend !== void 0) {
    transitionProp = 'webkitTransition'
    transitionEndEvent = 'webkitTransitionEnd'
  }

  if (window.onanimationend === void 0 && window.onwebkitanimationend !== void 0) {
    animationProp = 'webkitAnimation'
    animationEndEvent = 'webkitAnimationEnd'
  }
}

const raf = inBrowser ? window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout : fn => fn()

function nextFrame(fn) {
  raf(() => {
    raf(fn)
  })
}

function addTransitionClass(el, cls) {
  const transitionClasses = el._transitionClasses || (el._transitionClasses = [])
  if (transitionClasses.indexOf(cls) < 0) {
    transitionClasses.push(cls)
    addClass(el, cls)
  }
}

function removeTransitionClass(el, cls) {
  if (el._transitionClasses) {
    remove(el._transitionClasses, cls)
  }
  removeClass(el, cls)
}

function whenTransitionEnds(el, expectedType, cb) {
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType)
  if (!type) return cb()

  const event = type === TRANSITION ? transitionEndEvent : animationEndEvent
  let ended = 0
  const end = () => {
    el.removeEventListener(event, onEnd)
    cb()
  }
  const onEnd = e => {
    if (e.target === el) {
      if (++ended >= propCount) end()
    }
  }

  setTimeout(() => {
    if (ended < propCount) end()
  }, timeout + 1)

  el.addEventListener(event, onEnd)
}

const transitionRE = /\b(transform|all)(,|$)/

function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el)
  const transitionDelays = styles[transitionProp + 'Delay'].split(', ')
  const transitionDurations = styles[transitionProp + 'Duration'].split(', ')
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations)
  const animationDelays = styles[animationProp + 'Delay'].split(', ')
  const animationDurations = styles[animationDelays + 'Duration'].split(', ')
  const animationTimeout = getTimeout(animationDelays, animationDurations)

  let type
  let timeout = 0
  let propCount = 0

  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION
      timeout = transitionTimeout
      propCount = transitionDurations.length
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION
      timeout = animationTimeout
      propCount = animationDurations.length
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout)
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0
  }

  const hasTransform = type === TRANSITION && transitionRE.test(styles[transitionProp + 'Property'])
  return {
    type,
    timeout,
    propCount,
    hasTransform
  }
}

function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays)
  }

  return Math.max.apply(null, durations.map((d, i) => {
    return toMs(d) + toMs(delays[i])
  }))
}

function toMs(s) {
  return Number(s.slice(0, -1)) * 1000
}

export {
  resolveTransition,
  hasTransition,
  transitionProp,
  transitionEndEvent,
  animationProp,
  animationEndEvent,
  nextFrame,
  addTransitionClass,
  removeTransitionClass,
  whenTransitionEnds,
  getTransitionInfo
}
