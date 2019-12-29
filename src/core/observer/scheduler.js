/*2019-12-27 22:36:37*/
import config from "../config.js"
import { callHook, activateChildComponent } from "../instance/lifecycle.js"
import { nextTick, devtools } from "../util/index.js"

const MAX_UPDATE_COUNT = 100

const queue = []
const activatedChild = []
let has = {}
let circular = {}
let waiting = false
let flushing = false
let index = 0

function resetSchedulerState() {
  /*2019-12-27 22:24:37*/
  index = queue.length = activatedChild.length = 0
  has = {}
  waiting = flushing = false
}

function flushSchedulerQueue() {
  /*2019-12-27 22:28:34*/
  flushing = true
  let watcher, id
  queue.sort((a ,b) => a.id - b.id)
  for (index = 0; index < queue.length; index++) {
    watcher = queue[index]
    id = watcher.id
    has[id] = null
    watcher.run()
    if (has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        console.warn(
          'You may have an infinite update loop ' + (
          watcher.user
            ? `in watcher with expression "${watcher.expression}"`
            : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  const activatedQueue = activatedChild.slice()
  const updateQueue = queue.slice()
  resetSchedulerState()

  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updateQueue)

  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks(queue) {
  let i = queue.length
  while(i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted) {
      callHook(vm, 'updated')
    }
  }
}

function queueActivatedComponent (vm) {
  /*2019-12-27 20:18:38*/
  vm._inactive = false
  activatedChild.push(vm)
}

function callActivatedHooks(queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true)
  }
}

function queueWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    has[id] = true
    if (!flushing) {
      queue.push(watcher)
    } else {

      let i = queue.length - 1
      while( i > index && queue[i].id > id) {
        i--
      }
      queue.slice(i + 1, 0, watcher)
    }
    if (!waiting) {
      waiting = true
      nextTick(flushSchedulerQueue)
    }
  }
}

export {
  MAX_UPDATE_COUNT,
  queueWatcher,
  queueActivatedComponent
}

