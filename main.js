import Vue from './src/platforms/web/entry-runtime-with-complier.js'

const GlobalComp = Vue.component('GlobalComp', {
  props: {
    title: String
  },
  template: '<h1>GlobalComp-Title is : [{{ title }}]</h1>'
})
const LocalComp = {
  name: 'LocalComp',
  props: {
    title: String
  },
  template: '<h1>LocalComp-Title is ${title}</h1>'
}

const app = new Vue({
  el: '#app',
  components: {
    GlobalComp
  },
  template: '#temp',
  data: {
    time: new Date()
  },
  created () {
    console.warn('created')
    this.interval()
  },
  methods: {
    interval () {
      setInterval(() => {
        this.time = new Date()
      }, 1000)
    }
  }
})

console.log('\n\n')
console.warn('Vue:')
console.dir(Vue)

console.warn('app')
console.dir(app)
