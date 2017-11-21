import React, { Component } from "react";
import classnames from "classnames";

export default class TabControl extends Component {
  static defaultProps = {
    onChange: () => {}
  };

  tabs = [];

  // componentDidUpdate(prevProps) {
  //   const { activeTab } = this.props;
  //
  //   if (activeTab !== prevProps.activeTab) {
  //     this.tabs[activeTab].scrollIntoView({
  //       behavior: "smooth",
  //       block: "nearest",
  //       inline: "nearest"
  //     });
  //   }
  // }

  render() {
    const { tabs, activeTab, onChange } = this.props;

    return (
      <div className="tabs__header">
        <ul className="tabs__nav">
          {tabs.map((title, index) => (
            <li
              key={index}
              ref={e => (this.tabs[index] = e)}
              className={classnames("tabs__nav-item", {
                "tabs__nav-item_active": activeTab === index,
                "tabs__nav-item_marker": activeTab === index
              })}
              onClick={() => onChange(index)}
            >
              {title}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
