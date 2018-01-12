import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";

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

    componentDidUpdate(prevProps, prevState) {
      if (!isEqual(this.state, prevState)) {
        this.updateHistory();
      }
    }

    render() {
      const { props, state, setState } = this;
      return <WrappedComponent query={state} setQuery={setState} {...props} />;
    }

    setState = this.setState.bind(this);

    updateHistory = debounce(
      () =>
        this.props.history.push({
          search: stringifySearchParams(this.state)
        }),
      UPDATE_DEBOUNCE
    );
  }

  return withRouter(HistoryState);
};

export default enhanceWithHistoryState;

const getDisplayName = WrappedComponent =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";
