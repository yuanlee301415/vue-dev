/*2020-1-1 16:38:41*/

let decoder

export default {
  decode (html) {
    decoder = decoder || document.createElement('div')
    decoder.innerHTML = html
    return decoder.textContent
  }
}
