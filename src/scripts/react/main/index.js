import React from "react";
import ReactDOM from "react-dom";

import Clarifications from "./components/Clarifications";
import Documents from "./components/Documents";

const {
  __CLARIFICATIONS__: clarifications,
  __CLARIFICATION_TYPES__: clarificationTypes,
  __DOCUMENTS__: documents
} = window;

ReactDOM.render(
  <Clarifications clarifications={clarifications} types={clarificationTypes} />,
  document.getElementById("explain")
);

ReactDOM.render(
  <Documents documents={documents} />,
  document.getElementById("documents")
);
