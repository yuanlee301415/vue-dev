function generate(ast, options) {
  const state = new options
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this)return ${code}}`
  }
}
