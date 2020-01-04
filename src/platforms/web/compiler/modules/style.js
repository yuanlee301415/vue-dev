/*2020-1-3 22:27:34*/
import { parseText } from "../../../../compiler/parser/text-parser.js"
import { parseStyleText } from "../../util/style.js"
import {
  getAndRemoveAttr,
  getBindingAttr,
  baseWarn
} from "../../../../compiler/helpers.js"

function transformNode(el, options) {
  const warn = options.warn || baseWarn
  const staticStyle = getAndRemoveAttr(el, 'style')

  if (staticStyle) {
    if (parseText(staticStyle, options.delimiters)) {
      warn(
        `style="${staticStyle}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div style="{{ val }}">, use <div :style="val">.'
      )
    }
    el.staticStyle = JSON.stringify(parseStyleText(staticStyle))
  }

  const styleBinding = getBindingAttr(el, 'style', false)
  if (styleBinding) {
    el.styleBinding = styleBinding
  }
}

function genData(el) {
  let data = ''
  if (el.staticStyle) {
    data += `staticStyle:${el.staticStyle}`
  }
  if (el.styleBinding) {
    data += `style:(${el.styleBinding})`
  }
  return data
}

export default {
  staticKeys: ['staticStyle'],
  transformNode,
  genData
}
