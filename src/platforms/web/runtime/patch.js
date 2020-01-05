/*override*/
/* @flow */

import * as nodeOps from '../../web/runtime/node-ops.js'
import { createPatchFunction } from '../../../core/vdom/patch.js'
import baseModules from '../../../core/vdom/modules/index.js'
import platformModules from '../../web/runtime/modules/index.js'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)

export const patch = createPatchFunction({ nodeOps, modules })
