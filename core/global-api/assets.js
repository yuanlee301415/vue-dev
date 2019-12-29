/*2019-12-22 21:1:45*/
import config from "../config.js"
import { ASSET_TYPES } from "../shared/constants.js"
import { isPlainObject } from '../util/index.js'

function initAssetRegisters(Vue) {
  ASSET_TYPES.forEach((type,i) => {
    console.log(`Vue.${type}`)
    Vue[type] = function (id, definition) {
      if (!definition) return this.options[type + 's'][id]

      if (type === 'component' && config.isReservedTag(id)) {
        console.warn(
          'Do not use built-in or reserved HTML elements as component ' +
          'id: ' + id
        )
      }
      if (type === 'component' && isPlainObject(definition)) {
        definition.name = definition.name || definition.id
        definition = this.options._base.extend(definition)
      }
      if (type === 'directive' && typeof definition === 'function') {
        definition = { bind: definition, update: definition }
      }
      this.options[type + 's'][id] = definition
      return definition
    }
  })
}

export {
  initAssetRegisters
}
