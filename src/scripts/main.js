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
import { RegionsCharts } from './charts';

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
  //$('.map').forEach(node => new Map(node, data.data));
  const NUMBER_BY_REGION_DECLARATION = document.getElementById('declarations_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_MSPS = document.getElementById('msp_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_DOCTORS= document.getElementById('doctors_number__graph-canvas').getContext('2d');

  let DATA = data.data.reduce((acc, cur ) => {
    acc.push({
      region: cur.region.name,
      ...cur.stats,
    });
    return acc;
  }, []);

  RegionsCharts(
    NUMBER_BY_REGION_DECLARATION,
    DATA.map( i => i.region),
    DATA.map(i => i.declarations).sort((a, b) => a - b).reverse()
  );
  RegionsCharts(
    NUMBER_BY_REGION_MSPS,
    DATA.map( i => i.region),
    DATA.map(i => i.msps).sort((a, b) => a - b).reverse()
  );
  RegionsCharts(
    NUMBER_BY_REGION_DOCTORS,
    DATA.map( i => i.region),
    DATA.map(i => i.doctors).sort((a, b) => a - b).reverse()
  );
});

fetchJSON('http://dev.ehealth.world/reports/stats/').then(data => {
  const joined_items = $('.joined__item-count');

  // joined_items[0].innerText = data.data.msps;
  // joined_items[1].innerText = data.data.doctors;
  // joined_items[2].innerText = data.data.declarations;
});