/*override*/
/* @flow */

import { identity, resolveAsset } from '../../../core/util/index.js'

/**
 * Runtime helper for resolving filters
 */
export function resolveFilter (id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}
