/*2020-1-4 14:21:28*/
function bind(el, dir) {
  el.wrapData = code => {
    return `_b(${code},'${el.tag}',${dir.value},${
      dir.modifiers && dir.modifiers.prop ? 'true' : 'false'
    }${
      dir.modifiers && dir.modifiers.sync ? ',true': ''
    })`
  }
}

export default bind
