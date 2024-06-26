/*override*/
/* @flow */

import { isDef } from '../../../shared/util.js'
import { isAsyncPlaceholder } from './is-async-placeholder.js'

export function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; i++) {
      const c = children[i]
      if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}
