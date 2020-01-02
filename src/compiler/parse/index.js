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
const dirRe = /^v-|^@|^:/
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
    parent,
    children: []
  }
}

function parse(template, options) {
  warn = options.warn || baseWarn
  platformIsPreTag = options.isPreTag || no
  platformMustUseProp = options.mustUseProp || no
  platformGetTagNamespace = options.getTagNamespace || no

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
        processElement(element)
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


      if (isIE&& currentParent.tag === 'textara' && currentParent.attrsMap.placeholder === text) return

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
  
}

function processRawAttrs(el) {

}

function processElement(element, options) {

}

function processKey(el) {

}

function processRef(el) {

}

function processFor(el) {

}

function processIf(el) {

}

function processIfConditions(el, parent) {

}

function findPrevElement(children) {

}

function addIfCondition(el, condition) {

}

function processOnce(el) {

}

function processSlot(el) {

}

function processComponent(el) {

}

function processAttrs(el) {

}

function checkInFor(el) {

}

function parseModifiers(name) {

}

function makeAttrsMap(attrs) {

}

function isTextTag(el) {

}

function isForbiddenTag(el) {

}

const ieNSBug = /^xmlns:NS\d+/
const ieNSPrefix = /^NS\d+:/

function guardIESVGBug(attrs) {

}

function checkForAliasModel(el, value) {

}

export default createASTElement

export {
  onRE,
  dirRe,
  forAliasRE,
  forIteratorRE,
  decodeHTMLCached,
  warn,
  parse,
  processElement,
  processFor,
  addIfCondition
}

