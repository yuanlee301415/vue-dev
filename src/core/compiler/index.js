import parse from './parser'
import generate from './codegen'

export const createCompiler = function (template, options) {
  const ast = parse(template.trim(), options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render
  }
}
