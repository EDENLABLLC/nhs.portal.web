import React, { Component } from "react";
import Carousel from "nuka-carousel";
import classnames from "classnames";

const THEMES = {
  large: "tabs_theme_large"
};

export default class TabView extends Component {
  state = {
    activeTab: 0
  };

  tabs = {};

  render() {
    const { theme, children } = this.props;
    const { activeTab } = this.state;

    return (
      <div className={classnames("tabs", THEMES[theme])}>
        <div className="tabs__header">
          <ul className="tabs__nav">
            {children.map(({ title }, index) => (
              <li
                key={index}
                ref={e => (this.tabs[index] = e)}
                className={classnames("tabs__nav-item", {
                  "tabs__nav-item_active": activeTab === index,
                  "tabs__nav-item_marker": activeTab === index
                })}
                onClick={() => this.changeTab(index, true)}
              >
                {title}
              </li>
            ))}
          </ul>
        </div>
        <Carousel
          ref={e => (this.carousel = e)}
          className="tabs__main"
          afterSlide={this.changeTab}
          decorators={null}
          cellSpacing={20}
          swiping
        >
          {children.map(({ content }) => content)}
        </Carousel>
      </div>
    );
  }

  changeTab = (index, updateCarousel) => {
    const tab = this.tabs[index];

    this.setState({ activeTab: index });
    tab.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest"
    });
    if (updateCarousel) this.carousel.goToSlide(index);
  };
}
