/*2020-1-4 14:17:51*/
const fnExpRE = /^\s*([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/
const simplePathRE = /^\s*[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['.*?']|\[".*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*\s*$/

const keyCodes = {
  esc: 27,
  tab: 9,
  enter: 13,
  space: 32,
  up: 38,
  left: 37,
  right: 39,
  down: 40,
  'delete': [8, 45]
}

const genGuard = condition => `if(${condition})return null;`

const modifierCode = {
  stop: '$event.stopPropagation();',
  prevent: '$event.preventDefault();',
  self: genGuard(`$event.target !== $event.currentTarget`),
  ctrl: genGuard(`!$event.ctrlKey`),
  shift: genGuard(`!$event.shiftKey`),
  alt: genGuard(`!$event.altKey`),
  meta: genGuard(`!$event.metaKey`),
  left: genGuard(`'button' in $event && $event.button !== 0`),
  middle: genGuard(`'button' in $event && $event.button !== 1`),
  right: genGuard(`'button' in $event && $event.button !== 2`)
}

function genHandlers(events, isNative, warn) {
  let res = isNative ? 'nativeOn:{' : 'on:{'
  for (const name in events) {
    const handler = events[name]
    if (name === 'click' && handler.modifiers && handler.modifiers.right) {
      warn(
        `Use "contextmenu" instead of "click.right" since right clicks ` +
        `do not actually fire "click" events.`
      )
    }
    res += `"${name}":${genHandler(name, handler)},`
  }
  return res.slice(0, -1) + '}'
}

function genHandler(name, handler) {
  if (!handler) return `function(){}`

  if (Array.isArray(handler)) return `[${handler.map(handler => genHandler(name, handler)).join()}]`

  const isMethodPath = simplePathRE.test(handler.value)
  const isFunctionExp = fnExpRE.test(handler.value)

  if (!handler.modifiers) {
    return isMethodPath || isFunctionExp
      ? handler.value
      : `function($event){${handler.value}}`
  } else {
    let code = ''
    let genModifiersCode = ''
    const keys = []
    for (const key in handler.modifiers) {
      if (modifierCode[key]) {
        genModifiersCode += modifierCode[key]
        // left/right
        if (keyCodes[key]) {
          keys.push(key)
        }
      } else if (key === 'exact') {
        const modifiers = handler.modifiers
        genModifiersCode += genGuard(
          ['ctrl', 'shift', 'alt', 'meta']
            .filter(keyModifier => !modifiers[keyModifier])
            .map(keyModifier => `$event.${keyModifier}Key`)
            .join('||')
        )
      } else {
        keys.push(key)
      }
    }

    if (keys.length) {
      code += genKeyFilter(keys)
    }

    if (genModifiersCode) {
      code += genModifiersCode
    }

    const handlerCode = isMethodPath
      ? handler.value + '($event)'
      : isFunctionExp
        ? `(${handler.value})($event)`
        : handler.value
    return `function($event){${code}${handlerCode}}`
  }
}

function genKeyFilter(keys) {
  return `if(!('button in $event')&&${keys.map(genFilterCode).join('&&')}) return null;`
}

function genFilterCode(key) {
  const keyVal = parseInt(key)
  if (keyVal) return `$event.keyCode!==${keyVal}`

  const code = keyCodes[key]
  return (
    `_k($event.keyCode,` +
      `${JSON.stringify(key)},` +
      `${JSON.stringify(code)},` +
      `$event.key)`
  )
}

export {
  genHandlers
}
