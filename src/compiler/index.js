import { parse } from "./parse/index.js"
import { optimize } from "./optimizer.js"

import { createCompilerCreator } from './create-compiler.js'

const createCompiler = createCompilerCreator(function baseCompile () {

})

export {
  createCompiler
}
