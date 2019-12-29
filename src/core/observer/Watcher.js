/*2019-12-22 14:22:5*/
import { queueWatcher } from './scheduler.js'
import { pushTarget, popTarget } from './dep.js'
import {
  remove,
  isObject,
  parsePath,
  _Set as Set
} from '../util/index.js'

let uid = 0

class Watcher {
  vm // Component
  expression
  cb
  id
  deep
  user
  lazy
  sync
  dirty
  active
  deps // Array<Dep>
  depIds // ISet
  newDepIds // ISet
  getter
  value
  constructor (vm, expOrFn, cb, options) {
    this.vm = vm
    vm._watchers.push(this)

    if (options) {
      this.deep = !!options.deep
      this.user = !!options.user
      this.lazy = !!options.lazy
      this.sync = !!options.sync
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    this.cb = cb
    this.id = ++uid
    this.active = true
    this.dirty = this.lazy
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    this.expression = expOrFn.toString()
    if (typeof expOrFn === 'function') {
      this.getter = parsePath(expOrFn)
    } else {
      this.getter = expOrFn
      if (!this.getter) {
        this.getter = function() {}
        console.warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    this.value = this.lazy ? void 0 : this.get()
  }

  get () {
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        console.error(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      this.deep && traverse(value)
      popTarget()
      this.cleanupDeps()
    }
    return value
  }

  addDep (dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      !this.depIds.has(id) && dep.addSub(this)
    }
  }

  cleanupDeps () {
    let l = this.deps.length
    while (l--) {
      const dep = this.deps[l]
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  update () {
    if (this.lazy) {
      this.dirty = true
    } else if (this.sync) {
      this.run()
    } else {
      queueWatcher(this)
    }
  }

  run () {
    if (!this.active) return
    const value = this.get()
    if (value !== this.value || isObject(value) || this.deep) {
      const oldValue = this.value
      this.value = value
      if (this.user) {
        try {
          this.cb.call(this.vm, value, oldValue)
        } catch (e) {
          console.error(e, this.vm, `callback for watch "${this.expression}"`)
        }
      } else {
        this.cb.call(this.vm, value, oldValue)
      }
    }
  }

  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  depend () {
    let l = this.deps.length
    while(l--) {
      this.deps[l].depend()
    }
  }

  teardown () {
    if (this.active) {
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let l = this.deps.length
      while(l--) {
        this.deps[l].removeSub(this)
      }
      this.active = false
    }
  }
}

const seenObjects = new Set()
function traverse(val) {
  /*2019-12-27 22:10:19*/
  seenObjects.clear()
  _traverse(val, seenObjects)
}

function _traverse(val, seen) {
  /*2019-12-27 22:11:11*/
  const isA = Array.isArray(val)
  if (!isA && !isObject(val) || !Object.isExtensible(val)) return

  if (val.__ob__) {
    const depId = val.__ob__.dep.id
    if (seen.has(depId)) return
    seen.add(depId)
  }
  let i, keys
  if (isA) {
    i = val.length
    while(i--) _traverse(val[i], seen)
  } else {
    keys = Object.keys(val)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen)
  }
}

export default Watcher
