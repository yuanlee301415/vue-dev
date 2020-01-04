/*override*/
/* @flow */

import on from './on.js'
import bind from './bind.js'
import { noop } from '../../shared/util.js'

export default {
  on,
  bind,
  cloak: noop
}
