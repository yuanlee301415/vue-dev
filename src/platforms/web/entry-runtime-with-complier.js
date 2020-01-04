/*2020-1-4 18:35:11*/
import config from '.././../core/config.js'
import { cached } from '.././../core/util/index.js'
import { mark, measure } from '.././../core/util/perf.js'

import Vue from './runtime/index.js'
import { query } from './util/index.js'
import { shouldDecodeNewlines } from './util/compat.js'
import { compileToFunctions } from './compiler/index.js'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el, hydrating) {
  el = el && query(el)

  if (el === document.body || el === document.documentElement) {
    console.warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          !template && console. warn(
            `Template element not found or is empty: ${options.template}`,
            this
          )
        } else if (template.nodeType) {
          template = template.innerHTML
        } else {
          console.warn('invalid template option:' + template, this)
          return this
        }
      }
    } else if (el) {
      template = getOuterHTML(el)
    }

    if (template) {
      config.performance && mark && mark('compile')
    }

    const { render, staticRenderFns } = compileToFunctions(template, {
      shouldDecodeNewlines,
      delimiters: options.delimiters,
      comments: options.comments
    }, this)

    options.render = render
    options.staticRenderFns = staticRenderFns

    if (config.performance && mark) {
      mark('compile end')
      measure(`Vue ${this.name} compile`, 'compile', 'compile end')
    }
  }
  return  mount.call(this, el, hydrating)
}

function getOuterHTML(el) {
  if (el.outerHTML) return el.outerHTML
  else {
    const container = document.createElement('div')
    container.append(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
