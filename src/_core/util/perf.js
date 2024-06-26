/*2019-12-29 14:53:39*/
import { inBrowser } from "./env.js"

let mark
let measure

const perf = inBrowser && window.performance
if (perf && perf.mark && perf.measure && perf.clearMarks && perf.clearMeasures) {
  mark = tag => perf.mark(tag)
  measure = (name, startTag, endTag) => {
    perf.measure(name, startTag, endTag)
    perf.clearMarks(startTag)
    perf.clearMarks(endTag)
    perf.clearMeasures(name)
  }
}

export {
  mark,
  measure
}
