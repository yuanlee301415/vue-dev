/*2019-12-21 21:13:22*/
const emptyObject = Object.freeze({})

function def(obj, key, value, enumerable) {
  Object.defineProperty(obj, key, {
    value,
    enumerable: !!enumerable,
    writable: true,
    configurable: true
  })
}

function isReserved(str) {
  /*2019-12-27 21:18:21*/
  const c = (str + '').charAt(0)
  return c === 0x24 || c === 0x5F
}

const bailRE = /[^\w.$]/
function parsePath(path) {
  /*2019-12-27 22:9:47*/
  if (bailRE.test(path)) return console.error(`parsePath: path ${path} invalid!`)
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}

export {
  def,
  emptyObject,
  isReserved,
  parsePath
}
