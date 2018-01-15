import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";
import compose from "recompose/compose";

import { parseSearchParams, stringifySearchParams } from "../helpers/url";

const UPDATE_DEBOUNCE = 500;

const enhanceWithHistoryState = WrappedComponent => {
  class HistoryState extends Component {
    static displayName = `withHistoryState(${getDisplayName(
      WrappedComponent
    )})`;

    state = parseSearchParams(this.props.location.search);

    componentWillReceiveProps(nextProps) {
      if (nextProps.location.search !== this.props.location.search) {
        this.setState(parseSearchParams(nextProps.location.search));
      }
    }

    shouldComponentUpdate(nextProps, nextState) {
      return !(
        isEqual(nextProps, this.props) && isEqual(nextState, this.state)
      );
    }

    render() {
      const { props, state, setQuery, setQueryImmediate } = this;

      return (
        <WrappedComponent
          query={state}
          setQuery={setQuery}
          setQueryImmediate={setQueryImmediate}
          {...props}
        />
      );
    }

    setQuery = (query, method) => {
      this.setState(compose(stringifyValues, createUpdater(query)), () =>
        this.updateHistoryFromState(method)
      );
    };

    updateHistoryFromState = debounce(
      method => this.setQueryImmediate(this.state, method),
      UPDATE_DEBOUNCE
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

  return withRouter(HistoryState);
};

export default enhanceWithHistoryState;

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";

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
