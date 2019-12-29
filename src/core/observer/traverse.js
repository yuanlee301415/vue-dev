import { isObject } from "../util/index.js"

const seenSet = new Set()
function traverse(value) {
  _traverse(value, seenSet)
  seenSet.clear()
}

function _traverse(value, seen) {
  const isA = Array.isArray(value)
  if (!(isA || isObject(value)) || Object.isFrozen(value)) return
  if (value.__ob__) {
    const depId = value.__ob__.dep.id
    if (seen.has(depId)) return
    seen.add(depId)
  }
  isA ? value.forEach(item => traverse(item, seen)) : Object.keys(value).forEach(key => traverse(value[key], seen))
}

export {
  traverse
}
