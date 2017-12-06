require("es6-promise").polyfill();
require("isomorphic-fetch");

import React from "react";
import ReactDOM from "react-dom";
import hashHistory from "react-router/lib/hashHistory";
import Router from "react-router/lib/Router";
import Route from "react-router/lib/Router";

import Nav from "../components/Nav";
import App from "../containers/App";

ReactDOM.render(<Nav />, document.getElementById("nav"));

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="*" component={App} />
  </Router>,
  document.getElementById("map")
);
