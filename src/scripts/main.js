import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';

import { $ } from './dom';
import { fetchJSON } from './utils';

import Nav from './nav';
import Tabs from './tabs';
import Slider from './slider';
import Map from './map';
import Statistic from './statistic';
import Feedback from './feedback';

if (!window.Promise) {
  window.Promise = Promise;
}

SmoothScroll.polyfill();

$('.nav').forEach(node => new Nav(node));
$('.tabs').forEach(node => new Tabs(node));
$('.slider').forEach(node => new Slider(node));
$('.feedback').forEach(node => new Feedback(node));

fetchJSON('data/stats.json').then(data => {
  $('.declarations').forEach(node => new Statistic(node, data));
});

fetchJSON('http://dev.ehealth.world/reports/stats/regions').then(data => {
  $('.map').forEach(node => new Map(node, data.data));
});

fetchJSON('http://dev.ehealth.world/reports/stats/').then(data => {
  const joined_items = $('.joined__item-count');
  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.doctors;
  joined_items[2].innerText = data.data.declarations;
});
