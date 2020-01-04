/*2020-1-3 22:31:24*/
import { addProp } from "../../../../compiler/helpers.js"

function html(el, dir) {
  if (dir.value) {
    addProp(el, 'innerHTML', `_s(${dir.value})`)
  }
}

export default html
