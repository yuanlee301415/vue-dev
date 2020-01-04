/*2020-1-3 22:34:36*/
import { addProp } from "../../../../compiler/helpers.js"

function text(el, dir) {
  if (dir.value) {
    addProp(el, 'textContent', `_s(${dir.value})`)
  }
}

export default text
