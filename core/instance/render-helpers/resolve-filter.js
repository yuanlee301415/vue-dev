import { identity, resolveAsset } from '../../util/index.js'

function resolveFilter(id) {
  return resolveAsset(this.$options, 'filters', id, true) || identity
}

export {
  resolveFilter
}
