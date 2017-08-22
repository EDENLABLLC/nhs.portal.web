import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';
import Chart from 'chart.js';

import { $ } from './dom';
import { fetchJSON } from './utils';

import Nav from './nav';
import Tabs from './tabs';
import Slider from './slider';
import Map from './map';

import Feedback from './feedback';
import { RegionsCharts, DinamicalMonthChart } from './charts';

if (!window.Promise) {
  window.Promise = Promise;
}

SmoothScroll.polyfill();

$('.nav').forEach(node => new Nav(node));
$('.tabs').forEach(node => new Tabs(node));
$('.slider').forEach(node => new Slider(node));
$('.feedback').forEach(node => new Feedback(node));

const today = new Date().getDate();
fetchJSON('https://dev.ehealth.world/reports/stats/histogram?from_date=2017-07-01&to_date=2017-07-'+
  today + '&interval=DAY').then(data => {
  const MONTH_REGION_DECLARATION = document.getElementById('declarations__graph-canvas').getContext('2d');
  const DATA = data.data.reduce((acc, cur, index) => {
    acc.push({
      value: cur.declarations_active_start,
      label: index + 1,
      ...cur.stats,
    });
    return acc
  },[]);
  DinamicalMonthChart(
    MONTH_REGION_DECLARATION,
    DATA.map(i => i.label),
    DATA.map(i => i.value),
  );
});

fetchJSON('https://dev.ehealth.world/reports/stats/regions').then(data => {
  $('.map').forEach(node => new Map(node, data.data));
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

fetchJSON('https://dev.ehealth.world/reports/stats/').then(data => {
  const joined_items = $('.joined__item-count');
  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.doctors;
  joined_items[2].innerText = data.data.declarations;
});