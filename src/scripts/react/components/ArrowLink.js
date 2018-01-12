import React from "react";
import { Link } from "react-router-dom";
import classnames from "classnames";

const ArrowLink = ({ title, backwards, ...props }) => {
  const Component = props.to !== undefined ? Link : "a";

  const children = [
    <span key="title" className="arrow-link__title">
      {title}{" "}
    </span>,
    <i
      key="icon"
      className={classnames(
        "arrow-link__icon",
        "icon",
        `icon_name_arrow-${backwards ? "left" : "right"}`
      )}
    />
  ];

  return (
    <Component
      className={classnames(
        "arrow-link",
        backwards ? "arrow-link--backward" : "arrow-link--forward"
      )}
      {...props}
    >
      {backwards ? children.reverse() : children}
    </Component>
  );
};

export default ArrowLink;
