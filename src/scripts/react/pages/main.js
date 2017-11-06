import React from "react";
import ReactDOM from "react-dom";

import Header from "../components/Header";
import Statistics from "../components/Statistics";
import Clarifications from "../components/Clarifications";
import Documents from "../components/Documents";

const {
  __CLARIFICATIONS__: clarifications,
  __CLARIFICATION_TYPES__: clarificationTypes,
  __DOCUMENTS__: documents
} = window;

ReactDOM.render(
  <Clarifications
    clarifications={clarifications}
    types={clarificationTypes}
    limit={4}
  />,
  document.getElementById("explain")
);

ReactDOM.render(
  <Statistics />,
  document.getElementById("statistic")
);

ReactDOM.render(
  <Documents documents={documents} />,
  document.getElementById("documents")
);

ReactDOM.render(
  <Header />,
  document.getElementById("header")
);

