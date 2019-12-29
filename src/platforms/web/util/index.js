/*2019-12-29 16:38:29*/
export * from './attrs.js'
export * from './class.js'
export * from './element.js'

function query(el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      console.warn('Cannot find element: ' + el)
      return document.createElement('div')
    }
    return selected
  } else {
    return el
  }
}

export {
  query
}
