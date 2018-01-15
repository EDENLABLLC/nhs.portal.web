import React from "react";
import wrapDisplayName from "recompose/wrapDisplayName";
import hoistStatics from "recompose/hoistStatics";

import HistoryState from "./HistoryState";

const enhanceWithHistoryState = WrappedComponent => {
  const withHistoryState = props => (
    <HistoryState>
      {injectedProps => <WrappedComponent {...injectedProps} {...props} />}
    </HistoryState>
  );

  withHistoryState.displayName = wrapDisplayName(
    WrappedComponent,
    "withHistoryState"
  );

  return withHistoryState;
};

export default hoistStatics(enhanceWithHistoryState);
