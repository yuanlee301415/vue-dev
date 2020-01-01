/*2020-1-1 12:19:36*/
/**
 * Add class with compatibility for SVG since classList is not supported on
 * SVG elements in IE
 */
function addClass(el, cls) {
  if(!cls || !(cls = cls.trim())) return

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.add(c))
    } else {
      el.classList.add(cls)
    }
  } else {
    const cur = ` ${el.getActiveAttrib('class') || ''} `
    if (cur.indexOf(` ${cls} `) < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}

function removeClass(el, cls) {
  if (!cls || !(cls = cls.trim())) return

  if (el.classList) {
    if (cls.indexOf(' ') > -1) {
      cls.split(/\s+/).forEach(c => el.classList.remove(c))
    } else {
      el.classList.remove(cls)
    }
    if (!el.classList.length) {
      el.removeAttibute('class')
    }
  } else {
    let cur = ` ${el.getActiveAttrib('class') || ''}`
    const tar = ` ${cls} `
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    cur = cur.trim()
    if (cur) {
      el.setAttribute('class', cur)
    } else {
      el.removeAttibute('class')
    }
  }
}
export {
  addClass,
  removeClass
}
