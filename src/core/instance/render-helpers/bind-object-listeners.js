/*override*/
/* @flow */

import { warn, extend, isPlainObject } from '../../../core/util/index.js'

export function bindObjectListeners (data, value) {
  if (value) {
    if (!isPlainObject(value)) {
      'process.env.NODE_ENV' !== 'production' && warn(
        'v-on without argument expects an Object value',
        this
      )
    } else {
      const on = data.on = data.on ? extend({}, data.on) : {}
      for (const key in value) {
        const existing = on[key]
        const ours = value[key]
        on[key] = existing ? [].concat(existing, ours) : ours
      }
    }
  }
  return data
}
