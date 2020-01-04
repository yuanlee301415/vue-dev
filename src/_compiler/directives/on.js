/*2020-1-4 14:24:17*/
function on(el, dir) {
  if (dir.modifiers) {
    console.warn(`v-on without argument does not support modifiers.`)
  }
  el.wrapListeners = code => `_g(${code},${dir.value})`
}

export default on
