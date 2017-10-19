import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';
import Chart from 'chart.js';
import './select';
import AOS from 'aos';

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

AOS.init({
  duration: 1200,
  disable: 'mobile',
});

$('.nav').forEach(node => new Nav(node));
$('.tabs').forEach(node => {
  const tab = new Tabs(node);
  tab.selectElemByHash(location.hash.slice(1));
});
$('.slider').forEach(node => new Slider(node));
$('.feedback').forEach(node => new Feedback(node));

const { API_ENDPOINT } = window.__CONFIG__;

const day = new Date().getDate() < 10 ? `0${new Date().getDate()}` : new Date().getDate();
const month = new Date().getMonth() < 9 ? `0${new Date().getMonth() + 1}` : new Date().getMonth() + 1;
const year = new Date().getFullYear();


fetchJSON(`${API_ENDPOINT}/reports/stats/histogram?from_date=${year}-${month}-01&to_date=${year}-${month}-${day}&interval=DAY`)
  .then(data => {
    const MONTH_REGION_DECLARATION = document.getElementById('declarations__graph-canvas').getContext('2d');
    const MONTH_REGION_MEDICATION = document.getElementById('medication_requests__graph-canvas').getContext('2d');

    const DATA_DECLARATION = data.data.reduce((acc, cur, index) => {
      acc.push({
        value: cur.declarations_active_end,
        label: index + 1,
        ...cur.stats,
      });
      return acc;
    },[]);

    const DATA_MEDICATION = data.data.reduce((acc, cur, index) => {
      acc.push({
        value: cur.medication_requests_active_end,
        label: index + 1,
        ...cur.stats,
      });
      return acc;
    },[]);
    DinamicalMonthChart(
      MONTH_REGION_DECLARATION,
      DATA_DECLARATION.map(i => i.label),
      DATA_DECLARATION.map(i => i.value),
      'declarations__graph-canvas'
    );
    DinamicalMonthChart(
      MONTH_REGION_MEDICATION,
      DATA_MEDICATION.map(i => i.label),
      DATA_MEDICATION.map(i => i.value),
      'medication_requests__graph-canvas'
    );
  });

fetchJSON(`${API_ENDPOINT}/reports/stats/regions`).then(data => {
  $('.map').forEach(node => new Map(node, data.data));
  const NUMBER_BY_REGION_MSPS = document.getElementById('msp_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_FARMACIES = document.getElementById('pharmacies_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_DOCTORS = document.getElementById('doctors_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_FARMACIST = document.getElementById('pharmacists_requests_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_REQUEST = document.getElementById('medication_requests_number__graph-canvas').getContext('2d');
  const NUMBER_BY_REGION_DECLARATION = document.getElementById('declarations_number__graph-canvas').getContext('2d');

  let DATA = data.data.reduce((acc, cur ) => {
    acc.push({
      region: cur.region.name,
      ...cur.stats,
    });
    return acc;
  }, []);

  RegionsCharts(
    NUMBER_BY_REGION_MSPS,
    DATA.sort((a, b) => a.msps - b.msps).reverse(),
    'msps',
  );
  RegionsCharts(
    NUMBER_BY_REGION_FARMACIES,
    DATA.sort((a, b) => a.pharmacies - b.pharmacies).reverse(),
    'pharmacies',
  );
  RegionsCharts(
    NUMBER_BY_REGION_DOCTORS,
    DATA.sort((a, b) => a.doctors - b.doctors).reverse(),
    'doctors',
  );
  RegionsCharts(
    NUMBER_BY_REGION_FARMACIST,
    DATA.sort((a, b) => a.pharmacists - b.pharmacists).reverse(),
    'pharmacists',
  );
  RegionsCharts(
    NUMBER_BY_REGION_REQUEST,
    DATA.sort((a, b) => a.medication_requests - b.medication_requests).reverse(),
    'medication_requests',
  );
  RegionsCharts(
    NUMBER_BY_REGION_DECLARATION,
    DATA.sort((a, b) => a.declarations - b.declarations).reverse(),
    'declarations'
  );
});

fetchJSON(`${API_ENDPOINT}/reports/stats/`).then(data => {
  const joined_items = $('.joined__item-count');

  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.pharmacies;
  joined_items[2].innerText = data.data.doctors;
  joined_items[3].innerText = data.data.pharmacists;
  joined_items[4].innerText = data.data.declarations;
});
