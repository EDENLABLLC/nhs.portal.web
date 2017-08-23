import { $ } from './dom';
import Tabs from './tabs';
import Back from './back';

$('.tabs').forEach(node => {
  const tab = new Tabs(node);
  tab.selectElemByHash(location.hash.slice(1));
  return tab;
});
$('.js-back-link').forEach(node => new Back(node));
