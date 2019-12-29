import { createEmptyVNode } from "../vnode.js"
import { isDef, isObject, isTrue, isUnDef, once } from "../../util/index.js"
import { hasSymbol } from "../../util/index.js"

function resolveAsyncComponent(factory, baseCtor, context) {
  /*2019-12-25 21:11:23*/
  if (isTrue(factory.error) && isDef(factory.errorComp)) return factory.resolved

  if (isDef(factory.resolved)) return factory.resolved

  if (isDef(factory.contexts)) {
    factory.contexts.push(context)
  } else {
    const contexts = factory.contexts = [ context ]
    let sync = true

    const forceRender = () => {
      for (let i = 0, l = contexts.length; i < l; i++) {
        contexts[i].$forceUpdate()
      }
    }

    const resolve = once(res => {
      factory.resolved = ensureCtor(res, baseCtor)
      !sync && forceRender()
    })

    const reject = once(reason => {
      console.warn(`Failed to resolve async component: ${String(factory)}` + (reason ? `\nReason: ${reason}` : ''))
      if (isDef(factory.errorComp)) {
        factory.error = true
        forceRender()
      }
    })

    const res = factory(resolve, resolve)
    if (isObject(res)) {
      if (typeof res.then === 'function') {
        if (isUnDef(factory.resolved)) {
          res.then(resolve, reject)
        }
      } else if (isDef(res.component) && typeof res.component.then === 'function') {
        res.component.then(resolve, reject)

        if (isDef(res.error)) {
          factory.errorComp = ensureCtor(res.error, baseCtor)
        }

        if (isDef(res.loading)) {
          factory.loadingComp = ensureCtor(res.loading, baseCtor)
          if (res.delay === 0) {
            factory.loading = true
          } else {
            setTimeout(() => {
              if (isUnDef(factory.resolved) && isUnDef(factory.error)) {
                factory.loading = true
                forceRender()
              }
            }, res.delay || 200)
          }
        }

        if (isDef(res.timeout)) {
          setTimeout(() => {
            if (isUnDef(factory.resolved)) {
              reject(`timeout (${res.timeout}ms)`)
            }
          }, res.timeout)
        }
      }
    }

    sync = false
    return factory.loading ? factory.loadingComp : factory.resolved
  }
}

function createAsyncPlaceholder(factory, data, context, children, tag) {
  /*2019-12-26 22:15:9*/
  const node = createEmptyVNode()
  node.asyncFactory = factory
  node.asyncMeta = { data, context, children, tag }
  return node
}

function ensureCtor(comp, base) {
  if (comp.__esModel || (hasSymbol && comp[Symbol.toStringTag] === 'Module')) {
    comp = comp.default
  }
  return isObject(comp) ? base.extend(comp) : comp
}


export {
  resolveAsyncComponent,
  createAsyncPlaceholder
}
