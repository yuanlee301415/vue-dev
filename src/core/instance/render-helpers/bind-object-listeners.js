import { extend, isPlainObject } from "../../util/index.js"

function bindObjectListeners (data, value) {
  if (value) {
    if (isPlainObject(value)) {
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
export {
  bindObjectListeners
}
