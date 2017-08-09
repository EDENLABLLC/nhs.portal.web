import React from 'react';

export default ({ name, active, address, phones = [], doctors, declarations }) => (
  <div className={`search__map-tooltip ${active ? 'search__map-tooltip--active' : ''}`}>
    <b>{name}</b> <br />
    {address.settlement} <br />
    {address.street}, {address.building} <br />
    Тел.: {phones[0].number} <br />
  </div>
)
