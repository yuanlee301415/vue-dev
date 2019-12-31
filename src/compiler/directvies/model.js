/*2019-12-31 22:18:14*/
function genComponentModel(el, value, modifiers) {
  const { number, trim } = modifiers || {}
  const baseValueExpression = '$$v'
  let valueExpression = baseValueExpression
  if (trim) {
    valueExpression = `(typeof ${baseValueExpression} === 'string' ? ${baseValueExpression}.trim() : ${baseValueExpression})`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }

  const assignment = genAssignmentCode(value, valueExpression)
  el.model = {
    value: `(${value})`,
    expression: `"${value}"`,
    callback: `function (${baseValueExpression}){${assignment}}`
  }
}

function genAssignmentCode(value, assignment) {
  const res = parseModel(value)
  if (res.key === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`
  }
}

let len, str, chr, index, expressionPos, expressionEndPos

function parseModel(val) {
  len = val.length

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len -1) {
    index = val.lastIndexOf('.')
    if (index > -1) {
      return {
        exp: val.slice(0, index),
        key: `"${val.slice(index+1)}"`
      }
    } else {
      return {
        exp: val,
        key: null
      }
    }
  }

  str = val
  index = expressionPos = expressionEndPos = 0

  while (!eof()) {
    chr = next()
    if (isStringStart(chr)) {
      parseString(chr)
    } else if (chr === 0x5b) {
      parseBracket(chr)
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    kye: val.slice(expressionPos + 1, expressionEndPos)
  }
}

function next() {
  return str.charCodeAt(++index)
}

function eof() {
  return index >= len
}

function isStringStart(chr) {
  return chr === 0x22 || chr === 0x27
}


function parseBracket(chr) {
  let inBracket = 1
  expressionEndPos = index
  while (!eof()) {
    chr = next()
    if (isStringStart(chr)) {
      parseString(chr)
      continue
    }
    if (chr === 0x5b) inBracket++
    if (chr === 0x5d) inBracket--
    if (inBracket === 0) {
      expressionEndPos = index
      break
    }
  }
}

function parseString(chr) {
  const stringQuote = chr
  while (!eof()) {
    chr = next()
    if (chr === stringQuote) break
  }
}

export {
  genComponentModel,
  genAssignmentCode,
  parseModel
}
