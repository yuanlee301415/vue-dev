/*2020-1-3 22:38:37*/
import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from "../util/index.js"

import modules from './modules/index.js'
import directives from './directives/index.js'
import { genStaticKeys } from '../../../shared/util.js'
import { isUnaryTag, canBeLeftOpenTag } from './util.js'

const baseOptions = {
  expectHTML: true,
  modules,
  directives,
  isPreTag,
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys
}

export {
  baseOptions
}
