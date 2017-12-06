import React from "react";
import classnames from "classnames";

const TabControl = ({ tabs, activeTab, onChange = () => {} }) => (
  <div className="tabs__header">
    <ul className="tabs__nav">
      {tabs.map((title, index) => (
        <li
          key={index}
          className={classnames("tabs__nav-item", {
            "tabs__nav-item_active": activeTab === index
          })}
          onClick={() => onChange(index)}
        >
          {title}
        </li>
      ))}
    </ul>
  </div>
);

export default TabControl;
