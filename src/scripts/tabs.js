import { $, BEM, buildClass, selector } from './dom';

const PANEL_ANIMATION_OPTIONS = {
  duration: 300,
  fill: 'forwards',
  easing: 'ease-in-out'
};

export default class Tabs extends BEM {
  constructor(node, { autoHeight = false } = {}) {
    super('tabs', node);

    this.$controls = this.elems('nav-item');
    this.$slides = this.elems('slide');

    this.$marker = document.createElement('div');
    this.$marker.classList.add(selector(this.name, 'marker'));

    this.elem('header').appendChild(this.$marker);

    if (autoHeight) {
      const maxHeight = this.$slides.reduce((target, item) => {
        if (item.clientHeight > target) {
          target = item.clientHeight;
        }

        return target;
      }, 0);

      this.elem('main').style.height = `${maxHeight}px`;
    }

    this.currentIndex = this.getIndexByElem(this.elem('nav-item', 'active'));

    this.elem('nav').addEventListener('click', (e) => {
      const $elem = e.target.closest(buildClass(this.name, 'nav-item'));

      if (!$elem) {
        return;
      }

      const toIndex = this.getIndexByElem($elem);

      if (toIndex === this.currentIndex) {
        return;
      }

      this.delMod(this.elem('nav-item', 'active'), 'nav-item', 'active');
      this.setMod($elem, 'nav-item', 'active');

      this.animatePanels(toIndex);
      this.animateMarker(toIndex);

      this.currentIndex = toIndex;

      if ($elem.dataset.tab) {
        location.hash = '#' + $elem.dataset.tab;
      }
    }, false);

    this.setMod(this.elem('nav-item', 'active'), 'nav-item', 'marker');
  }

  animatePanels(index) {
    const current = this.currentIndex;
    const isNext = current < index;

    (current !== undefined) && this.$slides[current].animate([
      { transform: 'translateX(0)', opacity: 1 },
      { transform: `translateX(${isNext ? '-' : ''}100%)`, opacity: 0 }
    ], PANEL_ANIMATION_OPTIONS);

    this.$slides[index].animate([
      { transform: `translateX(${isNext ? '' : '-'}100%)`, opacity: 0 },
      { transform: 'translateX(0)', opacity: 1 }
    ], PANEL_ANIMATION_OPTIONS);
  }

  animateMarker(index) {
    const current = {
      left: this.$controls[this.currentIndex].offsetLeft,
      width: this.$controls[this.currentIndex].clientWidth
    };

    const left = this.$controls[index].offsetLeft;
    const width = this.$controls[index].clientWidth;

    const player = this.$marker.animate([
      {
        transform: `translateX(${current.left}px)`,
        width: `${current.width}px`
      }, {
        transform: `translateX(${left}px)`,
        width: `${width}px`
      }
    ], {...PANEL_ANIMATION_OPTIONS });

    player.onfinish = () => {
      this.setMod(this.$controls[index], 'nav-item', 'marker');
      requestAnimationFrame(() => player.cancel());
    };

    this.delMod(this.$controls[this.currentIndex], 'nav-item', 'marker')
  }

  getIndexByElem(elem) {
    let index = -1;

    this.$controls.some((node, i) => {
      if (node === elem) {
        index = i;
        return true;
      }
    });

    return index;
  }

  selectElemByHash(hash) {
    const elemWithHash = this.$controls.filter(node => node.dataset.tab === hash);
    if (!elemWithHash[0]) return;
    const elemIndex = this.$controls.indexOf(elemWithHash[0]);
    this.animateMarker(elemIndex);
    this.animatePanels(elemIndex);
    this.currentIndex = elemIndex;
  }
}
