import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';

import { $ } from './dom';
import { fetchJSON } from './utils';

import Tabs from './tabs';
import Slider from './slider';
import Map from './map';
import Statistic from './statistic';

if (!window.Promise) {
  window.Promise = Promise;
}

SmoothScroll.polyfill();

$('.tabs').forEach(node => new Tabs(node));
$('.slider').forEach(node => new Slider(node));

fetchJSON('data/stats.json').then(data => {
  $('.map').forEach(node => new Map(node, data.slice()));
  $('.declarations').forEach(node => new Statistic(node, data));
});

document.querySelector('.header__nav').addEventListener('click', e => {
  e.preventDefault();

  if (e.target.href === undefined) {
    return;
  }

  const to = e.target.href.split('#')[1];
  const { top } = document.getElementById(to).getBoundingClientRect();

  window.scroll({ top: (top + window.scrollY) - 50, left: 0, behavior: 'smooth' });
});
