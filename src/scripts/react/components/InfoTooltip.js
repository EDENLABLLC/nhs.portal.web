import React from "react";

import Tooltip from "./Tooltip";
import InfoIcon from "./InfoIcon";

const InfoTooltip = ({ children }) => (
  <Tooltip
    renderParent={({ getProps }) => (
      <InfoIcon {...getProps({ refKey: "innerRef", className: "info-tooltip-icon" })} />
    )}
    renderOverlay={({ active, getProps }) =>
      active && <div {...getProps({ className: "tooltip", children })} />
    }
  />
);

export default InfoTooltip;
