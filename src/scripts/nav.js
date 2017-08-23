export default class Nav {
  constructor(node) {
    node.addEventListener('click', e => {
      if (e.target.href.indexOf('#') === -1) return;

      e.preventDefault();

      if (e.target.href === undefined) {
        return;
      }

      const to = e.target.href.split('#')[1];
      const toElement = document.getElementById(to);
      if (!toElement) return null;

      const { top } = toElement.getBoundingClientRect();
      window.scroll({ top: (top + window.scrollY) - 50, left: 0, behavior: 'smooth' });
    })
  }
}
