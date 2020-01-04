/*2020-1-2 21:49:41*/
let decoder

export default {
  decode (html) {
    decoder = decoder || document.createElement('dev')
    decoder.innerHTML = html
    return decoder.textContent
  }
}
