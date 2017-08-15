import { $ } from './dom';

const dinamical_declaration = document.getElementById('declarations__graph-canvas').getContext('2d');

const DATA = {
  labels: ["January", "February", "March", "April", "May", "June", "July"],
  datasets: [{
    label: "My First dataset",
    backgroundColor: 'rgb(98, 164, 240)',
    borderColor: 'rgb(72,98,237)',
    data: [0, 10, 12, 22, 29, 30, 45],
  }]
};

export const dinamicMonthChart = new Chart(dinamical_declaration, {
  type: 'line',
  data: DATA,
  options: {
    title: {
      display: false,
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
      enabled: false,
      custom: function(tooltip) {
        // Tooltip Element
        let tooltipEl = $('#chartjs-tooltip')[0];
        if (!tooltipEl) {
          const el = document.createElement('div');
          el.setAttribute("id", "chartjs-tooltip");
          $('#declarations__graph-canvas')[0].offsetParent.appendChild(el);
          tooltipEl = $('#chartjs-tooltip')[0];
        }
        // Hide if no tooltip
        if (!tooltip.opacity) {
          tooltipEl.style.opacity = 0;
          // $('.chartjs-wrap canvas').forEach(function(index, el) {
          //   $(el).style.cursor = 'default';
          // });
          return;
        }
        $('#' + this._chart.canvas.id)[0].style.cursor = 'pointer';
        // Set caret Position
        // tooltipEl.classList.remove('above below no-transform');
        // tooltipEl.classList.remove('above');
        // tooltipEl.classList.remove('below');
        tooltipEl.classList.remove('no-transform');
        if (tooltip.yAlign) {
          tooltipEl.classList.add(tooltip.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }
        // Set Text
        if (tooltip.body) {
          let titleLines = tooltip.title[0] || [];
          let bodyLines = tooltip.body;
          console.log('tooltip', tooltip);
          let innerHtml = document.createElement('div');
          innerHtml.innerHTML = null;

          let title = document.createElement('div');
          let value = document.createElement('div');
          title.innerText = titleLines;
          value.innerText = tooltip.dataPoints[0].yLabel + ' лікаря';
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

        let elem = $('#declarations__graph-canvas')[0];
        const position = {
          left: elem.offsetLeft,
          top: elem.offsetTop,
        };

        // Display, position, and set styles for font
        Object.assign(tooltipEl.style, {
          opacity: 1,
          position: 'absolute',
          width: tooltip.width ? (tooltip.width + 'px') : 'auto',
          left: position.left + tooltip.x + 'px',
          top: position.top + top + 'px',
          zIndex: 99,
          backgroundColor: '#fff',
          border: '1px solid #d6d6d6',
          fontSize: tooltip.fontSize,
          fontStyle: tooltip._fontStyle,
          padding: tooltip.yPadding + 'px ' + tooltip.xPadding + 'px',
          paddingRight: "100px",
          _bodyFontFamily: 'Gotham Pro',
        });
      }
    }
  }
});


export const RegionsCharts = (elem, names, values)  =>
  new Chart(elem, {
    type: 'horizontalBar',
    data: {
      labels: names,
      datasets: [{
        backgroundColor: 'rgb(98, 164, 240)',
        borderColor: 'rgb(72,98,237)',
        data: values,
      }],
    },
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
      scales: {
        xAxes: [{
          gridLines: {
            display: true,
            lineWidth: 0,
            drawTicks: false,
            drawBorder: false,
            color: "rgba(0,0,0,0)",
            zeroLineWidth: 1,
          },
          ticks: {
            display: false,
          }
        }],
        yAxes: [{
          barPercentage: 0.95,
          // categoryPercentage: 1,
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
              ctx.fillText(data, bar._model.x + 30, bar._model.y + 7);
            });
          });
        }
      }
    }
  });

