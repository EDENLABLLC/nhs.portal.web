import React, { Component } from "react";
import { Slider, Slide } from "react-projector";
import { ResponsiveSlide } from "react-projector-responsive";

import TabControl from "./TabControl";
// import TabView from "./TabView";
import DeclarationsDynamicsChart from "./DeclarationDynamicsChart";
import RegionsChart from "./RegionsChart";

export default class Statistics extends Component {
  state = {
    activeTab: 0
  };

  render() {
    const { theme, children } = this.props;
    const { activeTab } = this.state;

    return (
      <section className="statistic">
        <header className="statistic__header">
          <h3>Статистика</h3>
        </header>
        <article className="statistic__main">
          <div className="tabs">
            <TabControl
              activeTab={activeTab}
              onChange={index => this.setState({ activeTab: index })}
              tabs={[
                "Динаміка реєстрації декларацій",
                <div>
                  Кількість закладів, лікарів, декларацій<br />
                  по регіонах
                </div>
              ]}
            />
            <Slider
              className="tabs__main"
              activeSlide={activeTab}
              onSlideChange={index => this.setState({ activeTab: index })}
            >
              <Slide key="declarations" component={ResponsiveSlide}>
                <DeclarationsDynamicsChart />
              </Slide>
              <Slide key="regions" component={ResponsiveSlide}>
                <RegionsChart />
              </Slide>
            </Slider>
          </div>
        </article>
      </section>
    );
  }
}
