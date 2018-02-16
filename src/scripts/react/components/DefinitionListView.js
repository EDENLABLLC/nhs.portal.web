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
      {Object.entries(details)
        .filter(
          ([name, details]) =>
            Object.keys(terms).includes(name) && Boolean(details)
        )
        .map(([name, details], index) => (
          <Fragment key={keyExtractor(name, index)}>
            <dt className="definition-list__term">{terms[name]}</dt>
            <dd className="definition-list__details">{details}</dd>
          </Fragment>
        ))}
    </dl>
  );
};

export default DefinitionListView;
