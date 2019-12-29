import Vue from './index.js'

const GlobalComp = Vue.component('Test', {
  props: {
    title: String
  },
  template: '<h1>GlobalComp-Title is ${title}</h1>'
})
const Local = {
  props: {
    title: String
  },
  template: '<h1>LocalComp-Title is ${title}</h1>'
}

const app = new Vue({
  el: '#app',
  template: `<div id="test">
<global-comp title="Global"/>
<local-comp title="Local"/>
</div>`,
  data: {
    name: 'Tom'
  },
  created () {
    console.log('created')
  }
})

console.log('\n\n')
console.warn('Vue:')
console.dir(Vue)

console.warn('app')
console.dir(app)

