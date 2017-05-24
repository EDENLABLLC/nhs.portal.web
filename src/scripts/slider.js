import { BEM, buildClass, selector } from './dom';

const createMarker = (active = false) => {
  const node = document.createElement('li');

  node.classList.add(selector('slider', 'marker'));
  active && node.classList.add(selector('slider', 'marker', 'active'));

  return node;
};

export default class Slider extends BEM {
  currentIndex = 0;

  constructor(node) {
    super('slider', node);
    this.$slides = this.elems('slide');

    this.$markers = [];

    this.$control = document.createElement('ul');
    this.$control.classList.add(selector(this.name, 'markers'));

    this.$slides.forEach((node, index) => {
      const marker = createMarker(index === this.currentIndex);
      this.$control.appendChild(marker);
      this.$markers.push(marker);
    });

    this.$control.addEventListener('click', ({ target }) => {
      if (!target.closest(buildClass(this.name, 'marker'))) {
        return;
      }

      const toIndex = this.getIndexByElem(target);

      if (toIndex === this.currentIndex) {
        return;
      }

      this.delMod(this.elem('marker', 'active'), 'marker', 'active');
      this.setMod(target, 'marker', 'active');

      this.slide(toIndex);
    }, false);

    this.node.appendChild(this.$control);
  }

  slide(index) {
    const isNext = this.currentIndex < index;

    this.$slides[this.currentIndex].animate([
      { transform: 'translateX(0)' },
      { transform: `translateX(${isNext ? '-' : ''}100%)` }
    ], this.constructor.ANIMATION_OPTIONS);

    this.$slides[index].animate([
      { transform: `translateX(${isNext ? '' : '-'}100%)` },
      { transform: 'translateX(0)' }
    ], this.constructor.ANIMATION_OPTIONS);

    this.currentIndex = index;
  }

  getIndexByElem(elem) {
    let index = -1;

    this.$markers.some((node, i) => {
      if (node === elem) {
        index = i;
        return true;
      }
    });

    return index;
  }

  static ANIMATION_OPTIONS = {
    duration: 300,
    fill: 'forwards',
    easing: 'ease-in-out'
  }
}