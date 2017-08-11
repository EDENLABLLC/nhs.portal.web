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

const REGION__MAP = {
  "Київ": 502,
  "Луцьк": 523,
  "Львов": 423,
  "Ужгород": 324,
  "Ивано-Франковск": 232,
  "Черновцы": 252,
  "Тернополь": 232,
  "Ровно": 200,
  "Хмельницкий": 182,
  "Житомир": 132,
  "Винница": 92,
  "Черкассы": 82,
  "Кировоград": 66,
  "Полтава": 50,
  "Чернигов": 32,
  "Суммы": 12,
  "Харьков": 9,
  "Луганск": 8,
  "Днепропетровск": 7,
  "Донецк": 6,
  "Запорожье": 5,
  "Херсон": 4,
  "Николаев": 3,
  "Одесса": 2,
  "Крым": 1,
};

// Dinamical number of declaraion, mis, doctors
const dinamical_declaration = document.getElementById('declarations__graph-canvas').getContext('2d');
// const dinamical_doctors = document.getElementById('declarations__graph-canvas').getContext('2d');
// const dinamical_mis = document.getElementById('declarations__graph-canvas').getContext('2d');

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

const dinamicalDeclarationChart = new Chart(dinamical_declaration, {
  type: 'line',
  data: DATA,
  options: {
    title: {
      display: true,
      text: 'Chart.js Line Chart - Custom Tooltips',
    },
    scales: {
      xAxes: [{
        gridLines: {
          drawBorder: false,
          drawTicks: true,
          zeroLineWidth: 1,
          zeroLineColor: "rgba(232,232,232,1)",
        },
      }],
      yAxes: [{
        gridLines: {
          drawBorder: false,
          drawTicks: true,
          zeroLineWidth: 1,
          zeroLineColor: "rgba(232,232,232,1)",
        },
      }]
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


// Number of declarations, mis, doctors
const NUMBER_BY_REGION_DECLARATION = document.getElementById('declarations_number__graph-canvas').getContext('2d');

const REGION_DECLARATIONS = {
  labels: Object.keys(REGION__MAP).map( i => i),
  datasets: [{
    backgroundColor: 'rgb(98, 164, 240)',
    borderColor: 'rgb(72,98,237)',
    data: Object.values(REGION__MAP).map( i => i),
  }],
};


const NUMBER_BY_REGION = new Chart(NUMBER_BY_REGION_DECLARATION, {
  type: 'horizontalBar',
  data: REGION_DECLARATIONS,
  onAnimationComplete: function() {
    console.log(this.chart);
    let ctx = this.chart.ctx;
    ctx.font = this.scale.font;
    ctx.fillStyle = this.scale.textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    this.datasets.forEach(function(dataset)  {
      dataset.bars.forEach(function(bar) {
        ctx.fillText(bar.value, bar.x, bar.y - 5);
      });
    })
  },
  scaleLineColor: "rgba(0,0,0,0)",
  options: {
    title: {
      display: false,
    },
    legend: {
      display: false,
      labels: {
        padding: 20,
      }
    },
    tooltipTemplate: "<%= value %>",
    scaleLineColor: "rgba(0,0,0,0)",
    scales: {
      xAxes: [{
        gridLines: {
          lineWidth: 0,
          display: false,
          drawBorder: false,
          drawTicks: false,
        },
        ticks: {
          display: false,
        }
      }],
      yAxes: [{
        barPercentage: 0.95,
        categoryPercentage: 1,
        ticks: {
          padding: 25,
        },
        gridLines: {
          display: false,
          drawBorder: false,
          drawTicks: false,
        },
      }]
    },
    tooltips: {
      enabled: false
    },
    hover: {
      animationDuration: 0
    },
    animation: {
      duration: 1,
      onComplete: function () {
        let chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.font = Chart.helpers.fontString(14, '700', 'GothamPro');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#000';

        this.data.datasets.forEach(function (dataset, i) {
          let meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach(function (bar, index) {
            let data = dataset.data[index];
            ctx.fillText(data, bar._model.x + 20, bar._model.y + 7);
          });
        });
      }
    }
  }
});