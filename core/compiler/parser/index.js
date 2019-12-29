import parseHTML from "./html-parser.js"

function parser () {
  const stack = []
  let root
  let currentParent

  parseHTML(template, {
    start (tag, attrs, unary) {

    },

    end () {

    },

    chars (text) {

    },

    comment (text) {

    }
  })
  return root
}

function createASTElement(tag, attrs, parent) {

  return {
    type: 1,
    tag,
    attrsList: attrs,
    parent,
    children: []
  }
}

export default parser
export {
  createASTElement
}
