import React, { Component } from "react";
import { Slider, Slide } from "react-projector";
import classnames from "classnames";

import TabControl from "./TabControl";

const THEMES = {
  large: "tabs_theme_large"
};

export default class TabView extends Component {
  state = {
    activeTab: 0
  };

  render() {
    const { theme, children } = this.props;
    const { activeTab } = this.state;

    return (
      <div className={classnames("tabs", THEMES[theme])}>
        <TabControl
          activeTab={activeTab}
          onChange={this.changeTab}
          tabs={children.map(({ title }) => title)}
        />
        <Slider
          className="tabs__main"
          activeSlide={activeTab}
          onSlideChange={this.changeTab}
        >
          {children.map(({ content }, index) => (
            <Slide key={index}>{content}</Slide>
          ))}
        </Slider>
      </div>
    );
  }

  changeTab = index => this.setState({ activeTab: index });
}
