import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';
import Chart from 'chart.js';

import { $ } from './dom';
import { fetchJSON } from './utils';

import Nav from './nav';
import Tabs from './tabs';
import Slider from './slider';
import Map from './map';
// import Statistic from './statistic';
import Feedback from './feedback';
import './charts';

if (!window.Promise) {
  window.Promise = Promise;
}

SmoothScroll.polyfill();

$('.nav').forEach(node => new Nav(node));
$('.tabs').forEach(node => new Tabs(node));
$('.slider').forEach(node => new Slider(node));
$('.feedback').forEach(node => new Feedback(node));

fetchJSON('data/stats.json').then(data => {
  $('.map').forEach(node => new Map(node, data.slice()));
  // $('.declarations').forEach(node => new Statistic(node, data));
});

