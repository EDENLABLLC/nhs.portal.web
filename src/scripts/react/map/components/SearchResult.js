import React from 'react';

export default ({ active, name, address, onClick, phones = [] }) => (
  <li className={`search__result-item ${active ? 'search__result-item_active' : ''}`} onClick={onClick}>
    <div className="search__result-item-title">
        {name}
    </div>
    {address.settlement} <br />
    {address.street}, {address.building} <br />
    Тел.: {phones[0].number} <br />
    Години роботи: Пн-Пт, 9:00-19:00
  </li>
)
