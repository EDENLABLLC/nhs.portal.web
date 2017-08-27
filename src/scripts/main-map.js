import { $ } from './dom';
import { fetchJSON } from './utils';

import Search from './search';
import Back from './back';

fetchJSON('data/search.json').then(data => {
  $('.search').forEach(node => new Search(node, data));
});
// $('.js-back-link').forEach(node => new Back(node));
