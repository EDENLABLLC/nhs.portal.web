import React from 'react';

export default ({ name, address, phones = [] }) => (
  <li className="search__result-item">
    <div class="search__result-item-title">
        {name}
    </div>
    {address.settlement} <br />
    {address.street}, {address.building} <br />
    Тел.: {phones[0].number} <br />
    Години роботи: Пн-Пт, 9:00-19:00
  </li>
)
