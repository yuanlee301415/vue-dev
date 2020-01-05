/*2020-1-1 14:19:56*/
import * as nodeOps from './node-ops.js'
import { createPatchFunction } from '../../../core/vdom/patch.js'
import baseModules from '../../../core/vdom/modules/index.js'
import platformModules from '../../web/runtime/modules/index.js'

const modules = platformModules.concat(baseModules)
const patch = createPatchFunction({ nodeOps, modules })

export {
  patch
}
