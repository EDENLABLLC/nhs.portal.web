import { BEM, buildClass } from './dom';

const HOVER_DEBOUNCE_TIMEOUT = 200;

const REGION_POINT_MAP = {
  "Київ": { left: 453, top: 170 },
  "Луцьк": { left: 153, top: 100 },
  "Львов": { left: 83, top: 206 },
  "Ужгород": { left: 48, top: 312 },
  "Ивано-Франковск": { left: 153, top: 312 },
  "Черновцы": { left: 207, top: 329 },
  "Тернополь": { left: 188, top: 241 },
  "Ровно": { left: 241, top: 100 },
  "Хмельницкий": { left: 259, top: 206 },
  "Житомир": { left: 347, top: 153 },
  "Винница": { left: 365, top: 277 },
  "Черкассы": { left: 523, top: 241 },
  "Кировоград": { left: 541, top: 312 },
  "Полтава": { left: 646, top: 188 },
  "Чернигов": { left: 541, top: 65 },
  "Суммы": { left: 646, top: 100 },
  "Харьков": { left: 770, top: 205 },
  "Луганск": { left: 911, top: 259 },
  "Днепропетровск": { left: 682, top: 311 },
  "Донецк": { left: 840, top: 347 },
  "Запорожье": { left: 752, top: 417 },
  "Херсон": { left: 629, top: 452 },
  "Николаев": { left: 523, top: 399 },
  "Одесса": { left: 453, top: 435 },
  "Крым": { left: 664, top: 558 }
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
      const point = createPoint(REGION_POINT_MAP[item.region_name]);
      point.dataset.index = index;

      point.addEventListener('mouseover', this, false);
      point.addEventListener('mouseout', this, false);

      fragment.appendChild(point);
    });

    this.elem('main').appendChild(fragment);
  }

  handleEvent({ target, type }) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      switch (type) {
        case 'mouseout':
          this.delMod(this.$tooltip, 'tooltip', 'show');
          break;
        case 'mouseover':
          const data = this.data[target.dataset.index];
          const $tooltipData = this.$tooltip.querySelectorAll(`${buildClass('map', 'tooltip-data')} dt`);

          this.$tooltip.querySelector(buildClass('map', 'tooltip-title')).textContent = data.region_name;

          $tooltipData[0].textContent = data.medical_system_providers;
          $tooltipData[1].textContent = data.doctors;
          $tooltipData[2].textContent = data.declarations_signed;

          this.$tooltip.style.top = target.style.top;
          this.$tooltip.style.left = target.style.left;
          this.setMod(this.$tooltip, 'tooltip', 'show');
          break;
      }
    }, HOVER_DEBOUNCE_TIMEOUT);
  }
}