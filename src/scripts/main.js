import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';
import Chart from 'chart.js';
import './select';
import AOS from 'aos';
import { subDays, eachDay } from 'date-fns';

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


const today = new Date();
const goBackDay = subDays(today, 30);
const last_days_30 = eachDay(goBackDay, today, 1);

const today_day = today.getDate() < 10 ? `0${today.getDate()}` : today.getDate();
const last_day = goBackDay.getDate() < 10 ? `0${goBackDay.getDate()}` : goBackDay.getDate();

const today_month = today.getMonth() < 9 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
const last_month = goBackDay.getMonth() < 9 ? `0${goBackDay.getMonth() + 1}` : goBackDay.getMonth() + 1;


fetchJSON(`${API_ENDPOINT}/reports/stats/histogram?from_date=${goBackDay.getFullYear()}-${last_month}-${last_day}&to_date=${today.getFullYear()}-${today_month}-${today_day}&interval=DAY`)
  .then(data => {
    const MONTH_REGION_DECLARATION = document.getElementById('declarations__graph-canvas').getContext('2d');
    const DATA = data.data.reduce((acc, cur, index) => {
      acc.push({
        value: cur.declarations_active_end,
        day: last_days_30[index].getDate(),
        month: last_days_30[index].getMonth(),
        ...cur.stats,
      });
      return acc
    },[]);
    DinamicalMonthChart(
      MONTH_REGION_DECLARATION,
      DATA.map(i => i.day),
      DATA.map(i => i.month),
      DATA.map(i => i.value),
    );
  });

fetchJSON(`${API_ENDPOINT}/reports/stats/regions`).then(data => {
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
    DATA.sort((a, b) => a.declarations - b.declarations).reverse(),
    'declarations'
  );
  RegionsCharts(
    NUMBER_BY_REGION_MSPS,
    DATA.sort((a, b) => a.msps - b.msps).reverse(),
    'msps',
  );
  RegionsCharts(
    NUMBER_BY_REGION_DOCTORS,
    DATA.sort((a, b) => a.doctors - b.doctors).reverse(),
    'doctors',
  );
});

fetchJSON(`${API_ENDPOINT}/reports/stats/`).then(data => {
  const joined_items = $('.joined__item-count');
  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.doctors;
  joined_items[2].innerText = data.data.declarations;
});
