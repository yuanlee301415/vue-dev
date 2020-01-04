/*2020-1-3 21:53:4*/
import he from './he.js'
import { parseHTML } from "./html-parser.js"
import { parseText } from "./text-parser.js"
import { parseFilters } from "./filter-parser.js"
import { cached, no, camelize } from "../../shared/util.js"
import { genAssignmentCode } from "../directvies/model.js"
import { isIE, isEdge, isServerRendering } from "../../core/util/index.js"

import {
  addProp,
  addAttr,
  baseWarn,
  addHandler,
  addDirective,
  getBindingAttr,
  getAndRemoveAttr,
  pluckModuleFunction
} from "../helpers.js"

const onRE = /^@|^v-on:/
const dirRE = /^v-|^@|^:/
const forAliasRE = /(.*)?\s+(:in|of)\s+(.*)/
const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/
const argRE = /:(.*)$/
const bindRE = /^:|^v-bind:/
const modifierRE = /\.[^.]+/g
const decodeHTMLCached = cached(he.decode)
let warn
let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace


function createASTElement(tag, attrs, parent) {
  return {
    type: 1,
    tag,
    attrsList: attrs,
    attrsMap: makeAttrsMap(attrs),
    parent,
    children: []
  }
}

function parse(template, options) {
  // console.log('parse>options.modules:', JSON.stringify(options.modules))
  warn = options.warn || baseWarn

  platformIsPreTag = options.isPreTag || no
  platformMustUseProp = options.mustUseProp || no
  platformGetTagNamespace = options.getTagNamespace || no

  transforms = pluckModuleFunction(options.modules, 'transformNode')
  preTransforms = pluckModuleFunction(options.modules, 'preTransformsNode')
  postTransforms = pluckModuleFunction(options.modules, 'postTransformsNode')

  delimiters = options.delimiters

  const stack  = []
  const preserveWhiteSpace = options.preserveWhiteSpace !== false
  let root
  let currentParent
  let inVPre = false
  let inPre = false
  let warned = false

  function warnOnce(msg) {
    if (!warned) {
      warned = true
      warn(msg)
    }
  }

  function endPre(element) {
    if (element.pre) {
      inVPre = false
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
  }

  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    cnaBeLeftOpenTag: options.cnaBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,

    start(tag, attrs, unary) {
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }

      let element = createASTElement(tag, attrs, currentParent)
      if (ns) {
        element.ns = ns
      }

      if (isForbiddenTag(element) && !isServerRendering()) {
        element.forbidden = true
        warn(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.'
        )
      }

      for (let i = 0; i < preTransforms.length; i++) {
        element = preTransforms[i](element, options) || element
      }

      if (!inVPre) {
        processPre(element)
        if (element.pre) {
          inVPre = true
        }
      }

      if (platformIsPreTag(element.tag)) {
        inPre = true
      }

      if (inPre) {
        processRawAttrs(element)
      } else if (!element.processed) {
        processFor(element)
        processIf(element)
        processOnce(element)
        processElement(element, options)
      }

      function checkRootConstraints(el) {
        if (el.tag === 'slot' || el.tag === 'template') {
          warnOnce(
            `Cannot use <${el.tag}> as component root element because it may ` +
            'contain multiple nodes.'
          )
        }

        if (el.attrsMap.hasOwnProperty('v-for')) {
          warnOnce(
            'Cannot use v-for on stateful component root element because ' +
            'it renders multiple elements.'
          )
        }
      }

      if (!root) {
        root = element
        checkRootConstraints(root)
      } else if (!stack.length) {
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element)
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          })
        } else {
          warnOnce(
            `Component template should contain exactly one root element. ` +
            `If you are using v-if on multiple elements, ` +
            `use v-else-if to chain them instead.`
          )
        }
      }

      if (currentParent && !element.forbidden) {
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent)
        } else if (element.slotScope) { // scoped slot
          currentParent.plain = false
          const name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
        } else {
          currentParent.children.push(element)
          element.parent = currentParent
        }
      }

      if (!unary) {
        currentParent = element
        stack.push(element)
      } else {
        endPre(element)
      }

      for (let i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options)
      }
    },

    end() {
      // remove trailing whitespace
      const element = stack[stack.length - 1]
      const lastNode = element.children[element.children.length - 1]
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
        element.children.pop()
      }

      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      endPre(element)
    },

    chars(text) {
      if (!currentParent) {
        if (text === template) {
          warnOnce(
            'Component template requires a root element, rather than just text.'
          )
        } else if ((text = text.trim())) {
          warnOnce(
            `text "${text}" outside root element will be ignored.`
          )
        }
        return
      }

      if (isIE && currentParent.tag === 'textarea' && currentParent.attrsMap.placeholder === text) return

      const children = currentParent.children
      text = inPre || text.trim()
        ? isTextTag(currentParent)
          ? text : decodeHTMLCached(text)
        : preserveWhiteSpace && children.length
          ? ' ' : ''

      if (text) {
        let expression
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          children.push({
            type: 2,
            expression,
            text
          })
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          children.push({
            type: 3,
            text
          })
        }
      }
    },

    comment(text) {
      currentParent.children.push({
        type: 3,
        text,
        isComment: true
      })
    }
  })

  return root
}

function processPre(el) {
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}

function processRawAttrs(el) {
  const l = el.attrsList.length
  if (l) {
    const attrs = el.attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      }
    }
  } else if (!el.pre) {
    el.plain = true
  }
}

function processElement(element, options) {
  processKey(element)
  element.plain = !element.key && !element.attrs.length

  processRef(element)
  processSlot(element)
  processComponent(element)
  for (let i = 0; i < transforms.length; i++) {
    element = transforms[i](element, options) || element
  }
  processAttrs(element)
}

function processKey(el) {
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    if (el.tag === 'template') {
      warn(`<template> cannot be keyed. Place the key on real elements instead.`)
    }
    el.key = exp
  }
}

function processRef(el) {
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    el.refer = checkInFor(el)
  }
}

function processFor(el) {
  const exp = getAndRemoveAttr(el, 'v-for')
  if (exp) {
    const inMatch = exp.match(forAliasRE)
    if (!inMatch) {
      warn(
        `Invalid v-for expression: ${exp}`
      )
      return
    }
    el.for = inMatch[2].trim()
    const alias = inMatch[1].trim()
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim()
      el.iterator1 = iteratorMatch[2].trim()
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim()
      }
    } else {
      el.alias = alias
    }
  }
}

function processIf(el) {
  const exp = getAndRemoveAttr(el, 'v-if')
  if (exp) {
    el.if = exp
    addIfCondition(el, {
      exp,
      block: el
    })
  } else {
    if (getAndRemoveAttr(el, 'v-else') != null) {
      el.else = true
    }
    const elseif = getAndRemoveAttr('v-else-if')
    if (elseif) {
      el.elseif = elseif
    }
  }
}

function processIfConditions(el, parent) {
  const prev = findPrevElement(parent.children)
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    })
  } else {
    warn(
      `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
      `used on element <${el.tag}> without corresponding v-if.`
    )
  }
}

function findPrevElement(children) {
  let i = children.length
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if (children[i].text !== ' ') {
        warn(
          `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
          `will be ignored.`
        )
      }
      children.pop()
    }
  }
}

function addIfCondition(el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}

function processOnce(el) {
  if (getAndRemoveAttr(el, 'v-once') != null) {
    el.once = true
  }
}

function processSlot(el) {
  if (el.tag === 'slot') {
    el.slotName = getBindingAttr(el, 'name')
    if (el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`
      )
    }
  } else {
    let slotScope
    if (el.tag === 'template') {
      slotScope = getAndRemoveAttr(el, 'scope')
      if (slotScope) {
        warn(
          `the "scope" attribute for scoped slots have been deprecated and ` +
          `replaced by "slot-scope" since 2.5. The new "slot-scope" attribute ` +
          `can also be used on plain elements in addition to <template> to ` +
          `denote scoped slots.`,
          true
        )
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope')
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      el.slotScope = slotScope
    }

    const slotTarget = getBindingAttr(el, 'slot')
    if (slotScope) {
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
      if (!el.slotTarget) {
        addAttr(el, 'slot', slotTarget)
      }
    }
  }
}

function processComponent(el) {
  const binding = getBindingAttr(el, 'is')
  if (binding) {
    el.component = binding
  }
  if (getBindingAttr(el, 'inline-template') != null) {
    el.inlineTemplate = true
  }
}

function processAttrs(el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, isProp
  for (i = 0, l = list.length; i < l; i++) {
    name = rawName = list[i].name
    value = list[i].value

    if (dirRE.test(name)) {
      el.hasBindings = true
      modifiers = parseModifiers(name)

      if (modifiers) {
        name = name.replace(modifierRE, '')
      }

      if (bindRE.test(name)) { // v-bind
        name = name.replace(bindRE, '')
        value = parseFilters(value)
        isProp = false

        if (modifiers) {

          if (modifiers.prop) {
            isProp = true
            name = camelize(name)

            if (name === 'innerHTML') name = 'innerHTML'
          }

          if (modifiers.camel) {
            name = camelize(name)
          }

          if (modifiers.async) {
            addHandler(
              el,
              `update:${camelize(name)}`,
              genAssignmentCode(value, '$event')
            )
          }
        }

        if (isProp || (!el.componennt && platformMustUseProp(el.tag, el.attrsMap.type, name))) {
          addProp(el, name, value)
        } else {
          addAttr(el, name, value)
        }

      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name,value, modifiers, false, warn)
      } else { // normal directives
        name = name.replace(dirRE, '')
        const argMatch = name.match(argRE)
        const arg = argMatch && argMatch[1]

        if (arg) {
          name = name.slice(0, -(arg.length + 1))
        }

        addDirective(el, name, rawName, value, arg, modifiers)

        if (name === 'model') {
          checkForAliasModel(el, value)
        }
      }
    } else {
      // literal attribute
      if (parseText(value, delimiters)) {
        warn(
          `${name}="${value}": ` +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div id="{{ val }}">, use <div :id="val">.'
        )
      }
      addAttr(el, name, JSON.stringify(value))
    }
  }
}

function checkInFor(el) {
  let parent = el
  while (parent) {
    if (parent.for !== void 0) return true
    parent = parent.parent
  }
  return false
}

function parseModifiers(name) {
  const match = name.match(modifierRE)
  if (match) {
    const ret = {}
    match.forEach(m => {
      ret[m.slice(1)] = true
    })
  }
}

function makeAttrsMap(attrs) {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (map[attrs[i].name] && !isIE && !isEdge) {
      warn('duplicate attribute: ' + attrs[i].name)
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}

function isTextTag(el) {
  return el.tag === 'script' || el.tag === 'style'
}

function isForbiddenTag(el) {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (!el.attrsMap.type || el.attrsMap.type === 'text/javascript')
    )
  )
}

const ieNSBug = /^xmlns:NS\d+/
const ieNSPrefix = /^NS\d+:/

function guardIESVGBug(attrs) {
  const res = []
  for (let i =0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '')
      res.push(attr)
    }
  }
  return res
}

function checkForAliasModel(el, value) {
  let _el = el
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`
      )
    }
    _el = _el.parent
  }
}

export {
  createASTElement,
  onRE,
  dirRE,
  forAliasRE,
  forIteratorRE,
  decodeHTMLCached,
  warn,
  parse,
  processElement,
  processFor,
  addIfCondition
}

