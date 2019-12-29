const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qname = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qname}`)
console.log('startTagOpen:', startTagOpen)
const startTagClose = /^\s*(\/?)>/

function parseHTML (html, options) {
  const stack = []
  let index = 0
  let last, lastTag

  while (html) {
    last = html

  }

  parseEndTag()

  function advance(n) {
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    console.log('start:', start)
  }

  function handleStartTag(match) {

  }

  function parseEndTag(tagName, start, end) {

  }
}

export default parseHTML
