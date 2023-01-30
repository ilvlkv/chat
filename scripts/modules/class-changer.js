function addClass(node, class_name) {
  return node.classList.add(class_name);
}

function removeClass(node, class_name) {
  return node.classList.remove(class_name);
}

export { addClass, removeClass };
