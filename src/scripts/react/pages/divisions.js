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

ReactDOM.render(<Nav />, document.getElementById("nav"));

ReactDOM.render(
  <Router>
    <Switch>
      <Redirect exact from="/" to="/map" />
      <Route exact path="/map" component={DivisionsMap} />
      {/* <Route path="/list" component={} />
      <Route path="/:id" component={} /> */}
    </Switch>
  </Router>,
  document.getElementById("divisions")
);
