import Vue from '../../../core/index.js'
import config from "../../../core/config.js"
import { extend, noop } from "../../../shared/util.js"
import { mountComponent } from '../../../core/instance/lifecycle.js'
import { devtools, inBrowser, isChrome } from "../../../core/util/index.js"

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from "../util/index.js"

import { patch } from './patch.js'
import platformDirectives from './directives/index.js'

export default Vue
