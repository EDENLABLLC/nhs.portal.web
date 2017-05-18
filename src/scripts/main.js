import Promise from 'promise-polyfill';

import { $ } from './dom';
import { fetchJSON } from './utils';

import Tabs from './tabs';
import Slider from './slider';
import Map from './map';
import Statistic from './statistic';

if (!window.Promise) {
  window.Promise = Promise;
}

$('.tabs').forEach(node => new Tabs(node));
$('.slider').forEach(node => new Slider(node));

fetchJSON('data/stats.json').then(data => {
  $('.map').forEach(node => new Map(node, data.slice()));
  $('.declarations').forEach(node => new Statistic(node, data));
});