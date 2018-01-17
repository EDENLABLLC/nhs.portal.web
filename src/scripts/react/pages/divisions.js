require("es6-promise").polyfill();
require("isomorphic-fetch");

import React from "react";
import ReactDOM from "react-dom";

import {
  HashRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";

import Nav from "../components/Nav";
import DivisionsMap from "../components/DivisionsMap";
import DivisionsList from "../components/DivisionsList";
import DivisionDetails from "../components/DivisionDetails";

ReactDOM.render(<Nav />, document.getElementById("nav"));

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" component={DivisionsList} />
      <Route exact path="/map" component={DivisionsMap} />
      <Route path="/:id" component={DivisionDetails} />
    </Switch>
  </Router>,
  document.getElementById("divisions")
);
