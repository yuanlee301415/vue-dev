/*2019-12-22 13:43:43*/
import { no, noop, identity } from '../shared/util.js'
import { LIFECYCLE_HOOKS } from "../shared/constants.js"

const process = {
  env: {
    NODE_ENV: 'product'
  }
}

export default {
  optionMergeStrategies: Object.create(null),
  silent: false,
  productionTip: process.env.NODE_ENV !== 'product',
  devtools: process.env.NODE_ENV !== 'product',
  performance: false,
  errorHandler: null,
  warnHandler: null,
  ignoredElements: [],
  keyCodes: Object.create(null),
  isReservedTag: no,
  isReservedAttr: no,
  isUnknownElement: no,
  getTagNamespace: noop,
  parsePlatformTagName: identity,
  mustUseProp: no,
  _lifecycleHooks: LIFECYCLE_HOOKS
}
