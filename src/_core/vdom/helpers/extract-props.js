/*2019-12-25 22:1:59*/
import { hasOwn, hyphenate, isDef, isUnDef } from "../../util/index.js"

function extractPropsFromVNodeData(data, Ctor, tag) {
  /*2019-12-27 20:9:3*/
  const propOptions = Ctor.options.props
  if (isUnDef(propOptions)) return

  const res = {}
  const { attrs, props } = data
  if (isDef(attrs) || isDef(props)) {
    for (const key in propOptions) {
      const altKey = hyphenate(key)
      checkProp(res, props, key, altKey, true) || checkProp(res, attrs, key, altKey, false)
    }
  }
  return res
}

function checkProp(res, hash, key, altKey, preserve) {
  /*2019-12-27 20:9:12*/
  if (isDef(hash)) {
    if (hasOwn(hash, key)) {
      res[key] = hash[key]
      if (!preserve) {
        delete hash[key]
      }
      return true
    } else if (hasOwn(hash, altKey)) {
      res[key] = hash[altKey]
      if (!preserve) {
        delete hash[altKey]
      }
      return true
    }
  }
  return false
}

export {
  extractPropsFromVNodeData
}
