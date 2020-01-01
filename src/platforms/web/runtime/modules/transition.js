
import { inBrowser, isIE9 } from "../../../../core/util/index.js"
import { mergeVNodeHook } from "../../../../core/vdom/helpers/index.js"
import { activeInstance } from "../../../../core/instance/lifecycle.js"

import {
  once,
  isDef,
  isUnDef,
  isObject,
  toNumber
} from '../../../../shared/util.js'

