/*2019-12-31 21:42:17*/
import { parseFilters } from "./parse/filter-parser.js"

function baseWarn(msg) {
  console.error(`[vue compiler]: ${msg}`)
}

function pluckModuleFunction(modules, key) {
  return modules ? modules.map(m => m[key]).filter(_ => _) : []
}

function addProp(el, name, value) {
  (el.props || (el.props = [])).push({ name, value })
}

function addAttr(el, name, value) {
  (el.attrs || (el.attrs = [])).push({ name, value })
}

function addDirective(el, name, rawName, value, arg, modifiers) {
  (el.directives || (el.directives = [])).push({ name, rawName, value, arg, modifiers })
}

function addHandler(el, name, value, modifiers, important, warn) {
  if (warn && modifiers && modifiers.prevent && modifiers.passive) {
    warn(
      'passive and prevent can\'t be used together. ' +
      'Passive handler can\'t prevent default event.'
    )
  }

  if (modifiers && modifiers.capture) {
    delete modifiers.capture
    name = `!{name}`
  }

  if (modifiers && modifiers.once) {
    delete modifiers.once
    name = `~${name}`
  }

  if (modifiers && modifiers.passive) {
    delete modifiers.passive
    name = `&${name}`
  }

  let events
  if (modifiers && modifiers.native) {
    delete modifiers.native
    events = el.nativeEvents || (el.nativeEvents = {})
  } else {
    events = el.events || (el.events = {})
  }

  const newHandler = { value, modifiers }
  const handlers = events[name]
  if (Array.isArray(handlers)) {
    important ? handlers.unshift(newHandler) : handlers.push(newHandler)
  } else if (handlers) {
    events[name] = important ? [newHandler, handlers] : [handlers, newHandler]
  } else {
    events[name] = newHandler
  }
}

function getBindingAttr(el, name, getStatic) {
  const dynamicValue = getAndRemoveAttr(el, `:${name}`) || getAndRemoveAttr(el, `v-bind:${name}`)
  if (dynamicValue != null) {
    return parseFilters(dynamicValue)
  } else if (getStatic !== false) {
    const staticValue = getAndRemoveAttr(el, name)
    if (staticValue != null) {
      return JSON.stringify(staticValue)
    }
  }
}

function getAndRemoveAttr(el, name, removeFromMap) {
  const val = el.attrsMap[name]
  if (val != null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  if (removeFromMap) {
    delete el.attrsMap[name]
  }
  return val
}

export {
  baseWarn,
  pluckModuleFunction,
  addProp,
  addAttr,
  addDirective,
  addHandler,
  getBindingAttr,
  getAndRemoveAttr
}
