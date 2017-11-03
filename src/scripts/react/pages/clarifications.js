import React from "react";
import ReactDOM from "react-dom";

import Clarifications from "../components/Clarifications";

const {
  __CLARIFICATIONS__: clarifications,
  __CLARIFICATION_TYPES__: clarificationTypes,
} = window;

ReactDOM.render(
  <Clarifications
    clarifications={clarifications}
    types={clarificationTypes}
  />,
  document.getElementById("clarifications")
);
