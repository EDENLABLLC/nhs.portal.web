import React from "react";
import classnames from "classnames";

import MoreArrow from "./MoreArrow";

const SearchMapTooltip = ({
  active,
  name,
  legalEntity,
  addresses: [address],
  contacts: { phones: [phone] },
}) => (
  <div
    className={classnames("search__map-tooltip", {
      "search__map-tooltip--active": active
    })}
  >
    <div className="search__result-item-title">
      {name} ({legalEntity.name})
    </div>
    <div>{address.settlement}</div>
    <div>{address.street}, {address.building}</div>
    <div>Тел.: {phone.number}</div>
    <MoreArrow />
  </div>
);

export default SearchMapTooltip;
