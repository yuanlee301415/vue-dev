import { def } from "../util/index.js"

const arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

~[
  'splice',
  'push',
  'pop',
  'shift',
  'unshift',
  'sort',
  'reverse'
].forEach(method => {
  const origin = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    const ret = origin.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    ob.dep.notify()
    return ret
  })
})

export {
  arrayMethods
}
