import { BEM, selector } from './dom';
import { numberFormatting } from './utils';

const COLORS_MAP = [
  '#90c8e6', '#b097c6', '#dfb0d0',
  '#e3aab8', '#afd5e7', '#c7b2d5',
  '#e9c7df', '#ecc7cf', '#f1eec9',
  '#ced8e2', '#5da892', '#5296cd',
  '#a3d7f2', '#f3f1a0', '#bcdad5',
  '#71b7a8', '#5ca9dc', '#dc91a3',
  '#d8816f', '#e2a394', '#7566aa',
  '#cadfeb', '#ddd2df', '#f4d9b5',
  '#d381b2'
];

const createListItemNode = (title, value, color) => {
  const $li = document.createElement('li');
  const $span = document.createElement('span');
  const $value = document.createElement('div');

  $li.classList.add(selector('declarations', 'list-item'));
  $li.textContent = title;

  $span.style.backgroundColor = color;

  $value.classList.add(selector('declarations', 'list-item-value'));
  $value.textContent = numberFormatting(value);

  $li.prepend($span);
  $li.append($value);

  return $li;
};

export default class Statistic extends BEM {
  constructor(node, data) {
    super('declarations', node);

    const fragment = document.createDocumentFragment();

    this.$canvas = this.elem('graph-canvas');
    this.context = this.$canvas.getContext('2d');

    const total = data.reduce((target, { declarations }) => target + declarations, 0);

    data.sort((a, b) => a.declarations < b.declarations ? 1 : -1);

    let [x, y, r, s] = [490, 490, 480, 0];

    data.forEach((item, index) => {
      const $item = createListItemNode(
        item.region_name,
        item.declarations,
        COLORS_MAP[index]
      );

      fragment.appendChild($item);

      let radians = ((item.declarations / data[0].declarations) * 360) * (Math.PI / 360);

      this.context.beginPath();
      this.context.lineWidth = 6;
      this.context.strokeStyle = COLORS_MAP[index];
      this.context.arc(x, y, r - (20 * index), s, radians, false);
      this.context.stroke();
    });

    this.elem('list').appendChild(fragment);
    this.elem('total-value').textContent = numberFormatting(total);
  }
}