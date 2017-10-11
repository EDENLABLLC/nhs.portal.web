import { $, addRule } from './dom';
import Smart from 'smart-plurals';
import Chart from 'chart.js';

Chart.defaults.global.defaultFontFamily='GothamPro';
Chart.defaults.global.defaultFontColor='#292b37';

const ukrainian = Smart.Plurals.getRule('ru');
const dict_declaration = [' декларація', ' декларації', ' декларацій' ];
const dict_medications = [' рецепт', ' рецепти', ' рецептів'];

const MONTHS = ["Січня", "Лютого", "Березня", "Квітня", "Травня", "Червня", "Липня",  "Серпня", "Вересня", "Жовтня",  "Листопада", "Грудня"];

const REGIONS = {
  "ІВАНО-ФРАНКІВСЬКА": "Івано-Франківська",
  "АВТОНОМНА РЕСПУБЛІКА КРИМ": "Aвтономна Республіка Крим",
  "ВІННИЦЬКА": "Вінницька",
  "ВОЛИНСЬКА": "Волинська",
  "ДНІПРОПЕТРОВСЬКА": "Дніпропетровська",
  "ДОНЕЦЬКА": "Донецька",
  "ЖИТОМИРСЬКА": "Житомирська",
  "ЗАКАРПАТСЬКА": "Закарпатська",
  "ЗАПОРІЗЬКА": "Запорізька",
  "КІРОВОГРАДСЬКА": "Кіровоградська",
  "КИЇВСЬКА": "Київська",
  "ЛУГАНСЬКА": "Луганська",
  "ЛЬВІВСЬКА": "Львівська",
  "М.КИЇВ": "м. Київ",
  "М.СЕВАСТОПОЛЬ": "м. Севастополь",
  "МИКОЛАЇВСЬКА": "Миколаївська",
  "ОДЕСЬКА": "Одеська",
  "ПОЛТАВСЬКА": "Полтавська",
  "РІВНЕНСЬКА": "Рівненська",
  "СУМСЬКА": "Сумська",
  "ТЕРНОПІЛЬСЬКА": "Тернопільська",
  "ХАРКІВСЬКА": "Харківська",
  "ХЕРСОНСЬКА": "Херсонська",
  "ХМЕЛЬНИЦЬКА": "Хмельницька",
  "ЧЕРКАСЬКА": "Черкаська",
  "ЧЕРНІВЕЦЬКА": "Чернівецька",
  "ЧЕРНІГІВСЬКА": "Чернігівська"
};

export const DinamicalMonthChart = (elem, names, values, name) =>
  new Chart(elem, {
  type: 'line',
  data: {
    labels: names,
    datasets: [{
      backgroundColor: 'rgba(66,147,243, .9)',
      borderColor: 'rgb(72,98,237)',
      data: values,
    }]
  },
  options: {
    title: {
      display: false,
    },
    legend: {
      display: false
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
        ticks: {
          beginAtZero:true,
          min: 0,
          max: Math.max.apply(this, values) + 1,
        }
      }]
    },
    tooltips: {
      enabled: false,
      custom: function(tooltip) {

        // Tooltip Element
        let tooltipEl = $('#chartjs-tooltip'+'_'+name)[0];
        if (!tooltipEl) {
          const el = document.createElement('div');
          el.setAttribute("id", "chartjs-tooltip"+"_"+ name);
          $('#'+name)[0].offsetParent.appendChild(el);
          tooltipEl = $('#chartjs-tooltip' +'_' +name)[0];
        }

        // Hide if no tooltip
        if (!tooltip.opacity) {
          tooltipEl.style.opacity = 0;
          // $('canvas').forEach(function(index, el) {
          //   $(el).style.cursor = 'default';
          // });
          return;
        }

        $('#' + this._chart.canvas.id)[0].style.cursor = 'pointer';

        // Set caret Position
        tooltipEl.classList.remove('above');
        tooltipEl.classList.remove('below');
        tooltipEl.classList.remove('no-transform');

        if (tooltip.yAlign) {
          tooltipEl.classList.add(tooltip.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }

        // Set Text
        if (tooltip.body) {
          const month = new Date().getMonth();
          let titleLines = tooltip.title[0] + " " + MONTHS[month];
          let bodyLines = tooltip.body;
          let innerHtml = document.createElement('div');
          innerHtml.innerHTML = null;

          let title = document.createElement('div');
          let value = document.createElement('div');
          title.innerText = titleLines;
          let label;
          if (name === 'declarations__graph-canvas') {
            label = ukrainian(tooltip.dataPoints[0].yLabel, dict_declaration);
          }
          if (name === 'medication_requests__graph-canvas') {
            label = ukrainian(tooltip.dataPoints[0].yLabel, dict_medications);
          }

          value.innerHTML = '<span>' + tooltip.dataPoints[0].yLabel + label + '</span>' ;
          Object.assign(title.style, {
            color: '#17184e',
            fontSize: '16px',
            lineHeight: '1.5em',
          });

          Object.assign(value.style, {
            color: '#292b37',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '1.5em',
          });

          innerHtml.appendChild(title);
          innerHtml.appendChild(value);
          while (tooltipEl.firstChild) {
            tooltipEl.removeChild(tooltipEl.firstChild);
          }
          tooltipEl.appendChild(innerHtml);
        }

        let top = 0;

        if (tooltip.yAlign) {
          let ch = 0;
          if (tooltip.caretHeight) {
            ch = tooltip.caretHeight;
          }
          if (tooltip.yAlign == 'above') {
            top = tooltip.y - ch - tooltip.caretPadding;
          } else {
            top = tooltip.y + ch + tooltip.caretPadding;
          }
        }

        let elem = $('#'+name)[0];
        const position = {
          left: elem.offsetLeft,
          top: elem.offsetTop - 100,
        };
        let height = 580 - tooltip.caretY - 74;
        if(tooltip.yAlign === 'top') {
          height -= 29;
        }
        if(tooltip.yAlign === 'bottom') {
          height += 29;
        }

        // Display, position, and set styles for font
        Object.assign(tooltipEl.style, {
          opacity: 1,
          position: 'absolute',
          width: '200px',
          height: '75px',
          top: position.top + top + 'px',
          zIndex: 99,
          backgroundColor: '#fff',
          border: '1px solid #d6d6d6',
          fontSize: tooltip.fontSize,
          fontStyle: tooltip._fontStyle,
          padding: '10px',
          _bodyFontFamily: 'Gotham Pro',
          marginLeft: '-7px',
        });
        if (tooltip.xAlign === "left") {

          Object.assign(tooltipEl.style, {
            left: position.left + tooltip.caretX + 7 + 'px',
          });

          addRule("#chartjs-tooltip" +"_"+ name + ":before", {
            content: "''",
            position: "absolute",
            background: "#4880ed",
            display: "block",
            width: "1px",
            height: height + "px",
            left: "-1px",
            right: 'initial',
            top: "74px",
            zIndex: "100",
          });
        } else if (tooltip.xAlign === "right" || tooltip.xAlign === "center" ) {

          Object.assign(tooltipEl.style, {
            left: position.left + tooltip.caretX + 8 - 200 + 'px',
          });

          addRule("#chartjs-tooltip" + "_" + name + "::before", {
            content: "''",
            position: "absolute",
            background: "#4880ed",
            display: "block",
            width: "1px",
            height: height + "px",
            right: "-1px",
            left: 'initial',
            top: "74px",
            zIndex: "100",
          });
        }
      }
    }
  }
});


export const RegionsCharts = (elem, data, name)  =>
  new Chart(elem, {
    type: 'horizontalBar',
    data: {
      labels: data.map(i => REGIONS[i.region]),
      datasets: [{
        backgroundColor: 'rgb(0, 128, 249)',
        borderColor: 'rgb(88,181,252)',
        data: data.map(i => i[name]),
      }],
    },
    onAnimationComplete: function() {
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
      scales: {
        xAxes: [{
          gridLines: {
            display: true,
            // lineWidth: 0,
            drawTicks: false,
            drawBorder: false,
            color: "rgba(0,0,0,0)",
            zeroLineWidth: 1,
          },
          ticks: {
            display: false,
            beginAtZero:true,
            min: 0,
            max: Math.max.apply(this, data.map(i => i[name])) * 2,
          }
        }],
        yAxes: [{
          barPercentage: .98,
          categoryPercentage: 1,
          ticks: {
            padding: 25,
          },
          gridLines: {
            display: false,
            drawBorder: false,
            drawTicks: false,
            showBorder:false
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
              ctx.fillText(data, bar._model.x + 25, bar._model.y + 7);
            });
          });
        }
      }
    }
  });
