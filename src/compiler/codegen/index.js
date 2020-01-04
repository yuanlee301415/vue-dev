/*2020-1-4 16:48:11*/
import { genHandlers } from "./events.js"
import baseDirectives from '../directvies/index.js'
import { camelize, no, extend } from "../../shared/util.js"
import { baseWarn, pluckModuleFunction } from "../helpers.js"

class CodegenState {
  options
  warn
  transforms
  dataGenFns
  directives
  maybeComponent
  onceId
  staticRenderFns

  constructor(options) {
    this.options = options
    this.warn = options.warn || baseWarn
    this.transforms = pluckModuleFunction(options.modules, 'transformCode')
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    this.directives = extend(extend({}, baseDirectives), options.directives)
    this.maybeComponent = el => !(options.isReservedTag || no)(el.tag)
    this.onceId = 0
    this.staticRenderFns = []
  }
}

function generate(ast, options) {
  console.log('generate>options:', JSON.stringify(options))
  const state = new CodegenState(options)
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

function genElement(el, state) {
  if (el.staticRoot && !el.staticProcessed) return genStatic(el, state)

  if (el.once && !el.onceProcessed) return genOnce(el, state)

  if (el.for && !el.forProcessed) return genFor(el, state)

  if (el.if && !el.ifProcessed) return genIf(el, state)

  if (el.tag === 'template' && !el.slotTarget) return genChildren(el, state) || 'void 0'

  if (el.tag === 'slot') return genSlot(el, state)

  let code
  if (el.component) {
    code = genComponent(el.component, el, state)
  } else {
    const data = el.plain ? void 0 : genData(el, state)
    const children = el.inlineTemplate ? null : genChildren(el, state, true)

    code = `_c('${el.tag}'${
      data ? `,${data}` : ''
    }${
      children ? `,${children}` : ''
    })`
  }

  for (let i = 0; i < state.transforms.length; i++) {
    code = state.transforms[i](el, code)
  }
  return code
}

function genStatic(el, state) {
  el.staticProcessed = true
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  return `_m(${state.staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}

function genOnce(el, state) {
  el.onceProessed = true
  if (el.if && !el.ifProcessed) return genIf(el, state)

  if (el.staticInFor) {
    let key = ''
    let parent = el.parent
    while (parent) {
      if (parent.key) {
        key = parent.key
        break
      }
      parent = parent.parent
    }
    if (key) {
      state.warn(
        `v-once can only be used inside v-for that is keyed. `
      )
      return genElement(el, state)
    }
    return `_o(${genElement(el, state)},${state.onceId++},${key})`
  }

  return genStatic(el, state)
}

function genIf(el, state, altGen, altEmpty) {
  el.ifProcessed = true
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

function genIfConditions(conditions, state, altGen, altEmpty) {
  if (!conditions.length) return altEmpty || '_e()'

  const condition = conditions.shift()
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions, state, altGen, altEmpty)
    }`
  }

  return `${genTernaryExp(condition.block)}`

  function genTernaryExp(el) {
    return altGen ? altGen(el, state) : el.once ? genOnce(el, state) : genElement(el, state)
  }
}

function genFor(el, state, altGen, altHelper) {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  if (state.maybeComponent(el) && el.tag !== 'slot' && el.tag !== 'template' && !el.key) {
    state.warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
      `v-for should have explicit keys. ` +
      `See https://vuejs.org/guide/list.html#key for more info.`,
      true /* tip */
    )
  }

  el.forProcessed = true

  return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${(altGen || genElement)(el, state)}` +
    `})`
}

function genData(el, state) {
  let data = '{'

  const dirs = genDirectives(el, state)
  if (dirs) data += `${dirs},`

  // key
  if (el.key) {
    data += `key:${el.key}`
  }

  // ref
  if (el.ref) {
    data += `ref:${el.ref}`
  }

  if (el.refInFor) {
    data += `refInFor:true,`
  }

  // pre
  if (el.pre) {
    data += `pre:true,`
  }

  if (el.component) {
    data += `tag:'${el.tag}',`
  }

  for (let i = 0; i < state.dataGenFns.length; i++) {
    data += state.dataGenFns[i](el)
  }

  // attrs
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }

  if (el.pros) {
    data += `domProps:{${genProps(el.props)}},`
  }

  if (el.events) {
    data += `${genHandlers(el.events, false, state.warn)},`
  }

  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true, state.warn)},`
  }

  if (el.scopedSlots) {
    data += `${genScopedSlots(el.scopedSlots, state)},`
  }

  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`
  }

  if (el.inlineTemplate) {
    const temp = genInlineTemplate(el, state)
    if (temp) {
      data += `${temp},`
    }
  }

  data = data.replace(/,$/, '') + '}'

  if (el.wrapData) {
    data = el.wrapData(data)
  }

  if (el.wrapListeners) {
    data = el.wrapListeners(data)
  }
  return data
}

function genDirectives(el, state) {
  const dirs = el.directives
  if (!dirs) return

  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime

  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    const gen = state.directives[dir.name]
    if (gen) {
      needRuntime = !!gen(el, dir, state.warn)
    }

    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:"${dir.arg}"` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }

  if (hasRuntime) return res.slice(0, -1) + ']'
}

function genInlineTemplate(el, state) {
  const ast = el.children[0]
  if (el.children.length !== 1 || ast.type !== 1) {
    state.warn('Inline-template components must have exactly one child element.')
  }

  if (ast.type === 1) {
    const inlineRenderFns = generate(ast, state.options)
    return `inlineTemplate:{render:function(){${
      inlineRenderFns.render
    }},staticRenderFns:[${
      inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join()
    }]}`
  }
}

function genScopedSlots(slots, state) {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => genScopedSlot(key, slots[key], state)).join()
  }])`
}

function genScopedSlot(key, el, state) {
  if (el.for && !el.forProcessed) return genForScopedSlot(key, el,state)

  const fn = `function(${String(el.slotScope)}){` +
  `return ${el.tag === 'template'}`
    ? el.if
      ? `${el.if}?${genChildren(el, state) || 'undefined'}:undefined`
      : genChildren(el, state) || 'undefined'
    : genElement(el, state)
  return `{key:${key},fn:${fn}}`
}

function genForScopedSlot(key, el, state) {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  el.forProcessed = true

  return `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
    `return ${genScopedSlot(key, el, state)}` +
    '})'
}

function genChildren(el, state, checkSkip, altGenElement, altGenNode) {
  const children = el.children
  if (children.length === 1 &&
    el.for &&
    el.tag !== 'template' &&
    el.tag !== 'slot'
  ) {
    return (altGenElement || genElement)(el, state)
  }

  const normalizationType = checkSkip
    ? getNormalizationType(children, state.maybeComponent)
    : 0

  const gen = altGenNode || genNode

  return `[${children.map(c =>gen(c, state)).join()}]${
    normalizationType ? `,${normalizationType}` : ''
  }`
}

function getNormalizationType(children, maybeComponent) {
  let res = 0
  for (let i = 0; i < children.length; i++) {
    const el = children[i]
    if (el.type !== 1) continue

    if (needsNormalization(el) ||
      (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))
    ) {
      res = 2
      break
    }

    if (maybeComponent(el) ||
      (el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))
    ) {
      res = 1
    }
  }
  return res
}

function needsNormalization(el) {
  return el.for !== void 0 || el.tag === 'template' || el.tag === 'slot'
}

function genNode(node, state) {
  if (node.type === 1) return genElement(node, state)

  if (node.type === 3 && node.isComment) return genComment(node)

  return genText(node)
}

function genText(text) {
  return `_v(${text.type === 2
    ? text.expression
    : transformSpacialNewlines(JSON.stringify(text.text))
  })`
}

function genComment(comment) {
  return `_e(${JSON.stringify(comment.text)})`
}

function genSlot(el, state) {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,${children}` : '' }`
  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join()}}`
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }

  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }

  return res + ')'
}

function genComponent(componentName, el, state) {
  const children = el.inlineTemplate ? null : genChildren(el, state, true)
  return `_c(${componentName},${genData(el, state)}${
    children ? `,${children}` : ''
  })`
}

function genProps(props) {
  let res = ''
  for (let i = 0; i < props.length; i++) {
    const prop = props[i]
    res += `"${prop.name}":${transformSpacialNewlines(prop.value)},`
  }
  return res.slice(0, -1)
}

function transformSpacialNewlines(text) {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export {
  CodegenState,
  generate,
  genElement,
  genIf,
  genFor,
  genData,
  genChildren,
  genText,
  genComment
}
