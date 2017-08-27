export default class ToggleClass {
  constructor(node, toggleClass, event = 'click') {
    node.addEventListener(event, (e) => {
      node.classList.toggle(toggleClass);
    })
  }
}
