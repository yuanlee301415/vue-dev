import { isDef } from '../../util/index.js'
import { isAsyncPlaceholder } from './is-async-placeholder.js'

function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length;i++) {
      const child = children[i]
      if (isDef(child) && (isDef(child.componentOptions) || isAsyncPlaceholder(child))) return child
    }
  }
}

export {
  getFirstComponentChild
}
