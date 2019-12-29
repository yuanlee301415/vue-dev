/*2019-12-29 18:59:38*/
import { namespaceMap } from "../util/index.js"

function createElement(tagName, vnode) {
  const elm = document.createElement(tagName)
  if (tagName !== 'select') return elm

  if (vnode.data && vnode.attrs && vnode.data.attrs.multiple !== void 0) {
    elm.setAttribute('multiple', 'multiple')
  }
  return elm
}

function createElementNS(namespace, tagName) {
  return document.createAttributeNS(namespaceMap[namespace], tagName)
}

function createTextNode(text) {
  return document.createTextNode(text)
}

function createComment(text) {
  return document.createComment(text)
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode)
}

function removeChild(node, child) {
  node.removeChild(child)
}

function appendChild(node, child) {
  node.appendChild(child)
}

function parentNode(node) {
  return node.parentNode
}

function nextSibling(node) {
  return node.nextSibling
}

function tagName(node) {
  return node.tagName
}

function setTextContent(node, text) {
  node.textContent = text
}

function setAttribute(node, key, val) {
  node.setAttribute(key, val)
}

export {
  createElement,
  createElementNS,
  createTextNode,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  setAttribute
}
