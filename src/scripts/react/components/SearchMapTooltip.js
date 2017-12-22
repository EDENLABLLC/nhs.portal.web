import React from 'react';
import MoreArrow from './MoreArrow';

export default ({legal_entity_name, name, active, address, phones = [], doctors, declarations }) => (
  <div className={`search__map-tooltip ${active ? 'search__map-tooltip--active' : ''}`}>
    <b>{name}</b> <br />
    <span className="search__result-item-title">({legal_entity_name})</span> <br />
    {address.settlement} <br />
    {address.street}, {address.building} <br />
    Тел.: {phones[0].number} <br />
    <MoreArrow />
  </div>
)
