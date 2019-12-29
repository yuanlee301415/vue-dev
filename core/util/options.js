import config from "../config.js"
import { hasOwn, camelize, capitalize, isPlainObject, extend, toRawType } from "../util/index.js"

const starts = config.optionMergeStrategies
const defaultStatus = function (parentVal, childVal) {
  return childVal === void 0 ? parentVal : childVal
}

function resolveAsset(options, type, id, warnMissing) {
  /*2019-12-26 22:10:42*/
  if (typeof id !== 'string') return

  const assets = options[type]
  if (hasOwn(assets, id)) return assets[id]

  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]

  const pascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, pascalCaseId)) return assets[pascalCaseId]

  const res = assets[id] || assets[camelizedId] || assets[pascalCaseId]
  if (warnMissing && !res) {
    console.warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}

function normalizeProps(options, vm) {
  /*2019-12-22 20:53:48*/
  const props = options.props
  if (!props) return
  const res = {}
  let l, val, name
  if (Array.isArray(props)) {
    l = props.length
    while (l--) {
      val = props[l]
      if (typeof val === 'string') {
        name = camelize(val)
        res[name] = { type: null }
      } else {
        console.warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val) ? val : { type: val }
    }
  } else {
    console.warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = props
}

function normalizeInject(options, vm) {
  /*2019-12-22 20:53:48*/
  const inject = options.inject
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i]}
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val) ? extend( { from: key }, val) : { from: val }
    }
  } else {
    console. warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

function normalizeDirectives(options) {
  /*2019-12-22 20:53:48*/
  const dirs = options.directives
  if (!dirs) return
  for (const key in dirs) {
    const def = dirs[key]
    if (typeof def === 'function') {
      dirs[key] = { bind: def, update: def}
    }
  }
}


function mergeOptions(parent, child, vm) {
  /*2019-12-22 21:48:13*/
  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)

  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }

  if (child.mixins) {
    for (let i = 0; i < child.mixins.length; i ++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }

  const options = {}
  let key
  for (key in parent) {
    mergeField(key)
  }

  for (key in child) {
    if(!hasOwn(parent, key)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    const start = starts[key] || defaultStatus
    options[key] = start(parent[key], child[key], vm, key)
  }
  return options
}


export {
  resolveAsset,
  mergeOptions
}
