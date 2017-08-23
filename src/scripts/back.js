export default class Back {
  constructor(node) {
    node.addEventListener('click', (e) => {
      if (history.back) {
        console.log('back');
        e.preventDefault();
        history.back();
      }
    })
  }
}
