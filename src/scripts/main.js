import Promise from 'promise-polyfill';
import SmoothScroll from 'smoothscroll-polyfill';
import Chart from 'chart.js';


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
  $('.map').forEach(node => new Map(node, data.slice()));
  // $('.declarations').forEach(node => new Statistic(node, data));
});

const ctx = document.getElementById('declarations__graph-canvas').getContext('2d');

const DATA = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [{
    label: "My First dataset",
    backgroundColor: 'rgb(98, 164, 240)',
    borderColor: 'rgb(72,98,237)',
    data: [0, 10, 12, 22, 29, 30, 45],
  }]
};

const customTooltips = function(tooltip) {
  // Tooltip Element
  let tooltipEl = document.getElementById('chartjs-tooltip');
  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-tooltip';
    tooltipEl.innerHTML = "<table></table>";
    this._chart.canvas.offsetParent.appendChild(tooltipEl);
  }
  // Hide if no tooltip
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = 0;
    return;
  }
  // Set caret Position
  tooltipEl.classList.remove('above', 'below', 'no-transform');
  if (tooltip.yAlign) {
    tooltipEl.classList.add(tooltip.yAlign);
  } else {
    tooltipEl.classList.add('no-transform');
  }
  function getBody(bodyItem) {
    return bodyItem.lines;
  }

  // Set Text
  if (tooltip.body) {
    const titleLines = tooltip.title || [];
    const bodyLines = tooltip.body.map(getBody);
    let innerHtml = '<thead>';
    titleLines.forEach(function(title) {
      innerHtml += '<tr><th>' + title + '</th></tr>';
    });
    innerHtml += '</thead><tbody>';
    bodyLines.forEach(function(body, i) {
      const colors = tooltip.labelColors[i];
      let style = 'background:' + colors.backgroundColor;
      style += '; border-color:' + colors.borderColor;
      style += '; border-width: 2px';
      let span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
      innerHtml += '<tr><td>' + span + body + '</td></tr>';
    });
    innerHtml += '</tbody>';
    let tableRoot = tooltipEl.querySelector('table');
    tableRoot.innerHTML = innerHtml;
  }
  let positionY = this._eventPosition.x;
  let positionX = this._eventPosition.y;
  console.log('position', this, positionY, positionX);
  console.log('tooltip', tooltip.caretX, tooltip.caretX);

  // Display, position, and set styles for font
  tooltipEl.style.opacity = 1;
  tooltipEl.style.left = positionX + tooltip.caretX + 'px';
  tooltipEl.style.top = positionY + tooltip.caretY + 'px';
  tooltipEl.style.fontFamily = tooltip._fontFamily;
  tooltipEl.style.fontSize = tooltip.fontSize;
  tooltipEl.style.fontStyle = tooltip._fontStyle;
  tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
};

const myLineChart = new Chart(ctx, {
  type: 'line',
  data: DATA,
  options: {
    title:{
      display: true,
      text: 'Chart.js Line Chart - Custom Tooltips'
    },
    tooltips: {
      position: 'nearest',
      intersect: false,
      yPadding: 30,
      xPadding: 30,
      caretSize: 1,
      backgroundColor: '#fff',
      titleFontColor: '#000',
      bodyFontColor: '#000',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 1,
      caretPadding: 40,
      cornerRadius: 0
    }
  }
});

