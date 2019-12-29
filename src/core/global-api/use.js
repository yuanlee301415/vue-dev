/*2019-12-22 20:50:29*/
import { toArray } from '../util/index.js'

function initUse(Vue) {
  console.log('Vue.use')
  Vue.use = function (plugin) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.includes(plugin)) {
      return this
    }

    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return  this
  }
}

export {
  initUse
}
