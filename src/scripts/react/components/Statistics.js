import React from 'react';
import classnames from 'classnames';
import TabView from "./TabView";

const data = [{
  title: "Динаміка реєстрації декларацій",
  content: '<canvas class="declarations__graph" id="declarations__graph-canvas" width="700" height="350"></canvas>'
}, {
  title: "Кількість закладів, лікарів, декларацій<br />  по регіонах",
  content: [{
    title: "Заклади",
    content: '<canvas class="declarations__graph" id="msp_number__graph-canvas" width="700" height="350"></canvas>'
  },{
    title: "Лікарі",
    content: '<canvas class="declarations__graph" id="doctors_number__graph-canvas" width="700" height="350"></canvas>'
  }, {
    title: "Декларації",
    content: '<canvas class="declarations__graph" id="declarations_number__graph-canvas" width="700" height="350"></canvas>'
  }]
}
];

export default class Statistics extends React.Component {
  render() {
    return (<section class="statistic" id="statistic" data-aos="fade-up">
        <header class="statistic__header">
          <h3>статистика</h3>
        </header>
        <article class="statistic__main">
          <TabView>
            {[{
                title: "Динаміка реєстрації декларацій",
                content: <canvas class="declarations__graph" id="declarations__graph-canvas" width="700" height="350"></canvas>
            }, {
              title: "Кількість закладів, лікарів, декларацій \n по регіонах",
              content: (
                <TabView>
                  {[
                    {
                      title: "Заклади",
                      content: <canvas ref={i => this.declaration = i} class="declarations__graph" id="msp_number__graph-canvas" width="700" height="350"></canvas>
                    },{
                      title: "Лікарі",
                      content: <canvas class="declarations__graph" id="doctors_number__graph-canvas" width="700" height="350"></canvas>
                    }, {
                      title: "Декларації",
                      content: <canvas class="declarations__graph" id="declarations_number__graph-canvas" width="700" height="350"></canvas>
                    }
                  ]}
                </TabView>
              )
            }]
            }
          </TabView>
        </article>
      </section>
    )
  }
}