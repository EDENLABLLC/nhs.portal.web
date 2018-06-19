import React, { Component } from "react";
import { subDays, format } from "date-fns";

import TabView from "./TabView";
import DynamicsChart from "./DynamicsChart";
import RegionsChart from "./RegionsChart";

const { API_ENDPOINT } = window.__CONFIG__;

const DECLARATIONS_DICT = ["декларація", "декларації", "декларацій"];
const MEDICATIONS_DICT = ["рецепт", "рецепти", "рецептів"];

export default class Statistics extends Component {
  state = {
    data: []
  };

  async componentDidMount() {
    const params = getHistogramParams(
      document.body.clientWidth > 768 ? 30 : 15
    );

    const dynamicsRequest = await fetch(
      `${API_ENDPOINT}/reports/stats/histogram?${params}`
    );

    const { data } = await dynamicsRequest.json();

    this.setState({ data });
  }
  render(){
    const { data } = this.state;

    if (data.length === 0) return null;

    return (
      <section className="statistic">
        <header className="statistic__header">
          <h3>Статистика</h3>
        </header>
        <article className="statistic__main">
          <TabView>
            {[
              {
                title: "Динаміка реєстрації декларацій",
                content: (
                  <DynamicsChart
                    data={data}
                    dataKey="declarations_active_end"
                    units={DECLARATIONS_DICT}
                  />
                )
              },
              { title: "Кількість по регіонах", content: <RegionsChart /> },
            ]}
          </TabView>
        </article>
      </section>
    )
  }
}

// {
//   title: "Динаміка відпуску рецептів",
//   content: (
//     <DynamicsChart
//       data={data}
//       dataKey="medication_requests_active_end"
//       units={MEDICATIONS_DICT}
//     />
//   )
// }

const getHistogramParams = daysAmount => {
  const params = new URLSearchParams();

  let to_date = new Date();
  let from_date = subDays(to_date, daysAmount);

  [to_date, from_date] = [to_date, from_date].map(date =>
    format(date, "YYYY-MM-dd")
  );

  Object.entries({ to_date, from_date, interval: "DAY" }).forEach(
    ([key, value]) => params.set(key, value)
  );

  return params;
};
