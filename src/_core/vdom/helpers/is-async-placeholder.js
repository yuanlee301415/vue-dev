function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory
}

export {
  isAsyncPlaceholder
}
