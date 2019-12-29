/*2019-12-22 13:42:34merge*/
const SSR_ATTR = 'data-server-rendered'

const ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]

const LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated',
  'errorCaptured'
]

export {
  SSR_ATTR,
  ASSET_TYPES,
  LIFECYCLE_HOOKS
}
