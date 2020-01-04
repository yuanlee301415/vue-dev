/*2020-1-4 18:27:29*/
import { parse } from "./parse/index.js"
import { optimize } from "./optimizer.js"
import { generate } from "./codegen/index.js"
import { createCompilerCreator } from './create-compiler.js'

const createCompiler = createCompilerCreator(function baseCompile (template, options) {
  const ast = parse(template.trim(), options)
  optimize(ast, options)
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})

export {
  createCompiler
}
