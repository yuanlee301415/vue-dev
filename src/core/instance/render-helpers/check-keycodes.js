import config from '../../config.js'
import { hyphenate } from '../../util/index.js'

function checkKeyCodes(eventKeyCode, key, builtInAlias, eventKeyName) {
  const keyCodes = config.keyCodes[key] || builtInAlias
  if (keyCodes) {
    if (Array.isArray(keyCodes)) {
      return keyCodes.indexOf(eventKeyCode) === -1
    } else {
      return keyCodes !== eventKeyCode
    }
  } else if (eventKeyName) {
    return hyphenate(eventKeyName) !== key
  }
}

export {
  checkKeyCodes
}
