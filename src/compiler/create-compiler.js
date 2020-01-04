/*2020-1-4 18:24:4*/
import { extend } from "../shared/util.js"
import { detectErrors } from "./error-detector.js"
import { createCompileToFunctionFn } from "./to-function.js"

function createCompilerCreator(baseCompile) {
  return function createCompiler(baseOptions) {

    function compile(template, options) {
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      finalOptions.warn = (msg, tip) => {
        (tip ? tips : errors).push(msg)
      }

      if (options) {
        if (options.modules) {
          finalOptions.modules = (baseOptions.modules || []).concat(options.modules)
        }

        if (options.directives) {
          finalOptions.directives = extend(Object.create(baseOptions.directives), options.directives)
        }

        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }

      }

      const compiled = baseCompile(template, finalOptions)
      errors.push.apply(errors, detectErrors(compiled.ast))

      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}

export {
  createCompilerCreator
}
