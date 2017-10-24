import { BEM, buildClass } from './dom';

const HOVER_DEBOUNCE_TIMEOUT = 200;

const REGION_POINT_MAP = {
  "М.КИЇВ": { left: 453, top: 175 },
  "КИЇВСЬКА": { left: 453, top: 140 },
  "ВОЛИНСЬКА": { left: 153, top: 100 },
  "ЛЬВІВСЬКА": { left: 83, top: 206 },
  "ЗАКАРПАТСЬКА": { left: 48, top: 312 },
  "ІВАНО-ФРАНКІВСЬКА": { left: 153, top: 312 },
  "ЧЕРНІВЕЦЬКА": { left: 207, top: 329 },
  "ТЕРНОПІЛЬСЬКА": { left: 188, top: 241 },
  "РІВНЕНСЬКА": { left: 241, top: 100 },
  "ХМЕЛЬНИЦЬКА": { left: 259, top: 206 },
  "ЖИТОМИРСЬКА": { left: 347, top: 153 },
  "ВІННИЦЬКА": { left: 365, top: 277 },
  "ЧЕРКАСЬКА": { left: 523, top: 241 },
  "КІРОВОГРАДСЬКА": { left: 541, top: 312 },
  "ПОЛТАВСЬКА": { left: 646, top: 188 },
  "ЧЕРНІГІВСЬКА": { left: 541, top: 65 },
  "СУМСЬКА": { left: 646, top: 100 },
  "ХАРКІВСЬКА": { left: 770, top: 205 },
  "ЛУГАНСЬКА": { left: 911, top: 259 },
  "ДНІПРОПЕТРОВСЬКА": { left: 682, top: 311 },
  "ДОНЕЦЬКА": { left: 840, top: 347 },
  "ЗАПОРІЗЬКА": { left: 752, top: 417 },
  "ХЕРСОНСЬКА": { left: 629, top: 452 },
  "МИКОЛАЇВСЬКА": { left: 523, top: 399 },
  "ОДЕСЬКА": { left: 453, top: 435 },
  "АВТОНОМНА РЕСПУБЛІКА КРИМ": { left: 664, top: 558 },
  "М.СЕВАСТОПОЛЬ": { left: 614, top: 588 }
};

const createPoint = ({ left, top }) => {
  const node = document.createElement('div');

  node.classList.add('map__point');
  node.style.left = `${left}px`;
  node.style.top = `${top}px`;

  return node;
};

export default class Map extends BEM {
  data = [];
  timeout = null;


  constructor(node, data) {
    super('map', node);

    this.data = data;
    this.$tooltip = this.elem('tooltip');

    const fragment = document.createDocumentFragment();

    data.forEach((item, index) => {
      const point = createPoint(REGION_POINT_MAP[item.region.name]);
      point.dataset.index = index;

      point.addEventListener('mouseover', this, false);
      point.addEventListener('mouseout', this, false);

      fragment.appendChild(point);
    });

    this.$tooltip.addEventListener('mouseover', this, false);
    this.$tooltip.addEventListener('mouseout', this, false);

    this.elem('main').appendChild(fragment);
  }

  handleEvent({ target, type }) {
    if (type === 'mouseover' && target.dataset.index) {
      this.$tooltip.style.top = target.style.top;
      this.$tooltip.style.left = target.style.left;
    }

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      switch (type) {
        case 'mouseout':
          this.delMod(this.$tooltip, 'tooltip', 'show');
          this.delMod(this.$active, 'point', 'active');
          break;
        case 'mouseover':
          const data = this.data[target.dataset.index];

          if (data) {
            const $tooltipData = this.$tooltip.querySelectorAll(`${buildClass('map', 'tooltip-data')} dt`);
            const $tooltipLink = this.$tooltip.querySelectorAll(`${buildClass('map', 'tooltip-link')}`)[0];

            var att = document.createAttribute("href");
            att.value = `map.html#${data.region.name}`;
            $tooltipLink.setAttributeNode(att);
            this.$tooltip.style.top = target.style.top;
            this.$tooltip.style.left = target.style.left;

            this.$active && this.delMod(this.$active, 'point', 'active');
            this.setMod(this.$tooltip, 'tooltip', 'show');

            this.$tooltip.querySelector(buildClass('map', 'tooltip-title')).textContent = data.region.name;
            this.$active = target;

            $tooltipData[0].textContent = data.stats.msps;
            $tooltipData[1].textContent = data.stats.doctors;
            $tooltipData[2].textContent = data.stats.declarations;

            this.setMod(this.$active, 'point', 'active');
          }

          this.setMod(this.$tooltip, 'tooltip', 'show');
          break;
      }
    }, HOVER_DEBOUNCE_TIMEOUT);
  }
}