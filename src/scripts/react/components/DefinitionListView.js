import React, { Fragment } from "react";

const DefinitionListView = ({
  data,
  terms,
  renderDetails,
  keyExtractor = (name, index) => name
}) => {
  const details = renderDetails(data);

  return (
    <dl className="definition-list">
      {Object.entries(terms).map(([name, term], index) => (
        <Fragment key={keyExtractor(name, index)}>
          <dt className="definition-list__term">{term}</dt>
          <dd className="definition-list__details">{details[name]}</dd>
        </Fragment>
      ))}
    </dl>
  );
};

export default DefinitionListView;
