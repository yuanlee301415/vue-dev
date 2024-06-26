/*2019-12-29 16:35:53*/
import { inBrowser, makeMap } from "../../../core/util/index.js"

const namespaceMap = {
  svg: 'http://www.w3.org/2000/svg',
  math: 'http://www.w3.org/1998/Math/MathML'
}

const isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
  'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
  'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
  'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
  's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
  'embed,object,param,source,canvas,script,noscript,del,ins,' +
  'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
  'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
  'output,progress,select,textarea,' +
  'details,dialog,menu,menuitem,summary,' +
  'content,element,shadow,template,blockquote,iframe,tfoot'
)

const isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
  'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
  'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
)

const isPreTag = tag => tag === 'pre'
const isReservedTag = tag => isHTMLTag(tag) || isSVG(tag)

function getTagNamespace(tag) {
  return isSVG(tag) ? 'svg' : tag === 'math' ? 'math' : void 0
}

const unknownElementCache = Object.create(null)

function isUnknownElement(tag) {
  if (!inBrowser) return true
  if (isReservedTag(tag)) return false
  tag = tag.toLowerCase()
  if (unknownElementCache[tag] != null) {
    return unknownElementCache[tag]
  }
  const el = document.createElement(tag)
  if (tag.indexOf('-') > -1) {
    return (unknownElementCache[tag] = (
      el.constructor === window.HTMLUnknownElement || el.constructor === window.HTMLElement
    ))
  } else {
    return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
  }
}

const isTextInputType = makeMap('text,number,password,search,email,tel,url')

export {
  namespaceMap,
  isHTMLTag,
  isSVG,
  isPreTag,
  isReservedTag,
  getTagNamespace,
  isUnknownElement,
  isTextInputType
}
