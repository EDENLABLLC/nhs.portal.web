import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import compose from "recompose/compose";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";

import { parseSearchParams, stringifySearchParams } from "../helpers/url";

@withRouter
export default class HistoryState extends Component {
  static defaultProps = {
    updateDebounce: 500
  };

  state = parseSearchParams(this.props.location.search);

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.search !== this.props.location.search) {
      this.setState(parseSearchParams(nextProps.location.search));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(isEqual(nextProps, this.props) && isEqual(nextState, this.state));
  }

  render() {
    const { renderFn, state: query, setQuery, setQueryImmediate } = this;

    return renderFn({ query, setQuery, setQueryImmediate });
  }

  get renderFn() {
    const { render, children } = this.props;

    return render || children;
  }

  setQuery = (query, method) => {
    this.setState(compose(stringifyValues, createUpdater(query)), () =>
      this.updateHistoryFromState(method)
    );
  };

  updateHistoryFromState = debounce(
    method => this.setQueryImmediate(this.state, method),
    this.props.updateDebounce
  );

  setQueryImmediate = (query, method = "push") => {
    const { location, history } = this.props;

    const search = compose(
      stringifySearchParams,
      createUpdater(query, true),
      parseSearchParams
    )(location.search);

    history[method]({ search });
  };
}

const stringifyValues = object =>
  Object.entries(object).reduce(
    (object, [key, value]) => ({ ...object, [key]: String(value) }),
    {}
  );

const createUpdater = (partialState, merge) => {
  const updater =
    typeof partialState === "function" ? partialState : () => partialState;

  return merge ? state => ({ ...state, ...updater(state) }) : updater;
};
