/*2019-12-29 15:59:8*/
import { makeMap } from "../../../shared/util.js"

const isReservedAttr = makeMap('style,class')
const acceptValue = makeMap('input,textarea,option,select,progress')
const mustUseProp = (tag, type, attr) => {
  return (
    (attr === 'value' && acceptValue(tag) && type !== 'button') ||
    (attr === 'selected' && tag === 'option') ||
    (attr === 'checked' && tag === 'input') ||
    (attr === 'muted' && tag === 'video')
  )
}

const isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck')

const isBooleanAttr = makeMap(
  'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
  'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
  'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
  'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
  'required,reversed,scoped,seamless,selected,sortable,translate,' +
  'truespeed,typemustmatch,visible'
)

const xlinksNS = 'http://www.w3.org/1999/xlink'

const isXlink =name => {
  return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
}

const getXlinkProp = name => {
  return isXlink(name) ? name.slice(6, name.length) : ''
}

const isFalsyAttrValue = val => {
  return val == null || val === false
}
export {
  isReservedAttr,
  mustUseProp,
  isEnumeratedAttr,
  isBooleanAttr,
  xlinksNS,
  isXlink,
  getXlinkProp,
  isFalsyAttrValue
}
