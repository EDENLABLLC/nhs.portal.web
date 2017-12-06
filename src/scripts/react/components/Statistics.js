import React, { Component } from "react";

import TabView from "./TabView";
import DeclarationsDynamicsChart from "./DeclarationDynamicsChart";
import RegionsChart from "./RegionsChart";

const Statistics = () => (
  <section className="statistic">
    <header className="statistic__header">
      <h3>Статистика</h3>
    </header>
    <article className="statistic__main">
      <TabView>
        {[
          {
            title: "Динаміка реєстрації декларацій",
            content: <DeclarationsDynamicsChart />
          },
          { title: "Кількість по регіонах", content: <RegionsChart /> }
        ]}
      </TabView>
    </article>
  </section>
);

export default Statistics;
