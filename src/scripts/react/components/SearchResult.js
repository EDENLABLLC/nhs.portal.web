import React from "react";
import classnames from "classnames";

const SearchResult = ({
  active,
  name,
  legalEntity,
  addresses: [address],
  contacts: { phones: [phone] },
  onClick
}) => (
  <li
    className={classnames("search__result-item", {
      "search__result-item_active": active
    })}
    onClick={onClick}
  >
    <div className="search__result-item-title">{name} ({legalEntity.name})</div>
    {active && <div>{address.settlement}</div>}
    <div>
      {address.street}, {address.building}
    </div>
    {active && <div>Тел.: {phone.number}</div>}
    Години роботи: Пн-Пт, 9:00-19:00
  </li>
);

export default SearchResult;
