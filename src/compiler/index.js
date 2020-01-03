import { parse } from "./parse/index.js"

import { createCompilerCreator } from './create-compiler.js'

const createCompiler = createCompilerCreator(function baseCompile () {

})

export {
  createCompiler
}
