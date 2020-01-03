/*2020-1-3 22:15:10*/
/**
 * Expand input[v-model] with dyanmic type bindings into v-if-else chains
 * Turn this:
 *   <input v-model="data[type]" :type="type">
 * into this:
 *   <input v-if="type === 'checkbox'" type="checkbox" v-model="data[type]">
 *   <input v-else-if="type === 'radio'" type="radio" v-model="data[type]">
 *   <input v-else :type="type" v-model="data[type]">
 */
import {
  getBindingAttr,
  getAndRemoveAttr
} from "../../../../compiler/helpers.js"

import {
  processFor,
  processElement,
  addIfCondition,
  createASTElement
} from "../../../../compiler/parse/index.js"

function preTransformNode(el, options) {
  if (el.tag === 'input') {
    const attrs = el.attrsMap
    if (attrs['v-model'] && (attrs['v-bind:type'] || attrs[':type'])) {
      const typeBinding = getBindingAttr(el, 'type')
      const ifCondition = getAndRemoveAttr('el', 'v-if', true)
      const ifConditionExtra = ifCondition ? `&&(${ifCondition})` : ''

      // checkbox
      const branch0 = createASTElement(el)
      processFor(branch0)
      addRawAttr(branch0, 'type', 'checkbox')
      processElement(branch0, options)
      branch0.processed = true
      branch0.if = `(${typeBinding})==='checkbox'${ifCondition}`
      addIfCondition(branch0, {
        exp: branch0.if,
        block: branch0
      })

      // radio else if condition
      const branch1 = cloneASTElement(el)
      getAndRemoveAttr(branch1, 'v-for', true)
      addRawAttr(branch1, 'type', 'radio')
      processElement(branch1, options)
      addIfCondition(branch0, {
        exp: `(${typeBinding}==='radio')${ifConditionExtra}`,
        block: branch1
      })

      // other
      const branch2 = cloneASTElement(el)
      getAndRemoveAttr(branch2, 'v-for', true)
      addRawAttr(branch2, ':type', typeBinding)
      processElement(branch2, options)
      addIfCondition(branch0, {
        exp: ifCondition,
        block: branch2
      })
      return branch0
    }
  }
}

function cloneASTElement(el) {
  return createASTElement(el.tag, el.attrsList.slice(), el.parent)
}

function addRawAttr(el, name, value) {
  el.attrsMap[name] = value
  el.attrsList.push({ name, value })
}

export default {
  preTransformNode
}



