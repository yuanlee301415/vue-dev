import { isRegExp, remove } from '../shared/util.js'
import { getFirstComponentChild } from '../vdom/helpers/index.js'

function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag)
}

function matches(pattern, name) {
  if (Array.isArray(pattern)) return pattern.includes(name)
  else if (typeof pattern === 'string') return pattern.split(',').includes(name)
  else if (isRegExp(pattern)) return pattern.test(name)
  return false
}

function pruneCache(keepAliveInstance, filter) {
  const { cache, keys, _vnode } = keepAliveInstance
  for (const key in cache) {
    const cacheNode = cache[key]
    if (cacheNode) {
      const name = getComponentName(cacheNode.componentOptions)
      if (name && !filter(name)) pruneCacheEntry(cache, key, keys, _vnode)
    }
  }
}

function pruneCacheEntry(cache, key, keys, current) {
  const cached = cache[key]
  if (cached && !cached !== current) {
    cached.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes = [String, RegExp, Array]

export default {
  name: 'keep-alive',
  abstract: true,
  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number]
  },
  created () {
    this.cache = Object.create(null)
    this.keys = []
  },
  destroyed () {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },
  watch: {
    include(val) {
      pruneCache(this, name => matches(val, name))
    },
    exclude (val) {
      pruneCache(this, name => !matches(val, name))
    }
  },
  render () {
    const vnode = getFirstComponentChild(this.$slots.default)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      const name = getComponentName(componentOptions)
      if (name && (this.include && !matches(this.include, name)) || (this.exclude && matches(this.exclude, name))) return vnode

      const { cache, keys } = this
      const key = vnode.key == null ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '') : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        remove(keys, key)
      } else {
        cache[key] = vnode
        keys.push(key)
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
      }
      vnode.data.keepAlive = true
    }
    return vnode
  }
}

