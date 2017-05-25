import { $ } from './dom';
import { fetchJSON } from './utils';

import Search from './search';

fetchJSON('data/search.json').then(data => {
  $('.search').forEach(node => new Search(node, data));
});