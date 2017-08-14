

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
      yPadding: 20,
      xPadding: 30,
      caretSize: 0,
      backgroundColor: '#fff',
      titleFontColor: '#000',
      bodyFontColor: '#000',
      borderColor: 'rgba(0,0,0,1)',
      borderWidth: 1,
      caretPadding: 0,
      cornerRadius: 0,
      callbacks: {
        title: function(tooltipItem, data) {
          return data['labels'][tooltipItem[0]['index']];
        },
        label: function(tooltipItem, data) {
          return data['datasets'][0]['data'][tooltipItem['index']];
        },
      },
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
              ctx.fillText(data, bar._model.x + 30, bar._model.y + 7);
            });
          });
        }
      }
    }
  });


// not used
const customTooltips = function(tooltip) {
  // Tooltip Element
  console.log('tooltip', tooltip);
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