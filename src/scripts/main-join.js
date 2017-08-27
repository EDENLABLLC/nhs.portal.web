import { $ } from './dom';
import Tabs from './tabs';
import Back from './back';
import ToggleClass from './toggleClass';

$('.tabs').forEach(node => {
  const tab = new Tabs(node);
  tab.selectElemByHash(location.hash.slice(1));
  return tab;
});
const $togglers = $('.providers-list__requirements');

$togglers.forEach(node => {
  node.addEventListener('click', () => {
    $togglers.filter(a => node !== a).forEach(node => node.classList.remove('providers-list__requirements_active'));
  })
  new ToggleClass(node, 'providers-list__requirements_active')
});
// $('.js-back-link').forEach(node => new Back(node));
