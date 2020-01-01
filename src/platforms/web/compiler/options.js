
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

}

export {
  baseOptions
}
