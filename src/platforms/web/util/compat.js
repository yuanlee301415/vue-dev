/*2020-1-1 16:7:42*/
import { inBrowser } from "../../../core/util/index.js"

function shouldDecode(content, encoded) {
  const div = document.createElement('div')
  div.innerHTML = `<div a="${content}"/>`
  return div.innerHTML.indexOf(encoded) > 0
}

const shouldDecodeNewLines = inBrowser ? shouldDecode('\n', '&#10;') : false

export {
  shouldDecodeNewLines
}
