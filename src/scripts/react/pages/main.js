import "isomorphic-fetch";

import React from "react";
import ReactDOM from "react-dom";

import Header from "../components/Header";
import RegionsMap from "../components/RegionsMap";
import Statistics from "../components/Statistics";
import Clarifications from "../components/Clarifications";
import Documents from "../components/Documents";

const {
  __CLARIFICATIONS__: clarifications,
  __CLARIFICATION_TYPES__: clarificationTypes,
  __DOCUMENTS__: documents
} = window;

ReactDOM.render(<Header />, document.getElementById("header"));

ReactDOM.render(<RegionsMap />, document.getElementById("regions_map"));

ReactDOM.render(<Statistics />, document.getElementById("statistic"));

ReactDOM.render(
  <Clarifications
    clarifications={clarifications}
    types={clarificationTypes}
    limit={4}
  />,
  document.getElementById("explain")
);

ReactDOM.render(
  <Documents documents={documents} />,
  document.getElementById("documents")
);
