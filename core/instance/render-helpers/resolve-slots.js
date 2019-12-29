function resolveSlots(children, context) {
  /*2019-12-26 22:3:29*/
  const slots = {}
  if (!children) return slots
  const defaultSlots = []
  for (let i = 0, l = children.length; i < l; i++) {
    const child = children[i]
    const data = child.data
    if (data && data.attrs && data.attrs.slot) {
      delete data.attrs.slot
    }
    if ((child.context === context || child.functionalContext) &&  data && data.slot !== null) {
      const name = child.data.slot
      const slot = (slots[name] || (slots[name] = []))
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        slot.push(child)
      }
    } else {
      defaultSlots.push()
    }
  }
  if (!defaultSlots.every(isWhitespace)) {
    slots.default = defaultSlots
  }
  return slots
}

function resolveScopedSlots(fns, res = {}) {
  /*2019-12-27 19:54:11*/
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
}

function isWhitespace(node) {
  return node.isComment || node.text === ' '
}

export {
  resolveScopedSlots,
  resolveSlots
}
