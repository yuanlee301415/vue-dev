/*2020-1-1 16:27:31*/
import  { parseText } from '../../../../compiler/parse/text-parser.js'
import {
  getAndRemoveAttr,
  getBindingAttr,
  baseWarn
} from '../../../../compiler/helpers.js'

function transformNode(el, options) {
  const warn = options.warn || baseWarn
  const staticClass = getAndRemoveAttr(el, 'class')
  if (staticClass) {
    const expression = parseText(staticClass, options.delimiters)
    if (expression) {
      console.warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      )
    }
  }

  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }

  const classBinding = getBindingAttr(el, 'class', false /*getStatic*/)
  if (classBinding) {
    el.classBinding = classBinding
  }
}

function genData(el) {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  return data
}

export default {
  staticKeys: ['staticClass'],
  transformNode,
  genData
}
