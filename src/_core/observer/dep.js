/*2019-12-22 14:0:32*/
import { remove } from '../util/index.js'

let uid = 0

class Dep {
  constructor () {
    this.id = uid++
    this.subs = []
  }

  addSub (sub) {
    this.subs.push(sub)
  }

  removeSub (sub) {
    remove(this.subs, sub)
  }

  depend () {
    Dep.target && Dep.target.addDep(this)
  }

  notify () {
    this.subs.forEach(sub => sub.update())
  }
}

Dep.target = null
const targetStack = []

function pushTarget (target) {
  /*2019-12-27 22:9:20*/
  Dep.target && targetStack.push(target)
  Dep.target = target
}

function popTarget () {
  /*2019-12-27 22:9:20*/
  Dep.target = targetStack.pop()
}

export default Dep

export {
  pushTarget,
  popTarget
}
