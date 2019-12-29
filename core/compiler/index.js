import parse from './parser/index.js'
import generate from './codegen/index.js'

export const createCompiler = function (template, options) {
  const ast = parse(template.trim(), options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render
  }
}
