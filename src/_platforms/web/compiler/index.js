/*2020-1-4 18:31:11*/
import { baseOptions } from './options.js'
import { createCompiler } from '../../../compiler/index.js'

const { compile, compileToFunctions } = createCompiler(baseOptions)

export {
  compile,
  compileToFunctions
}
