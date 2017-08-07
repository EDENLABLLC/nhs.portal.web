import React from 'react';

export default () => (
  <aside className="search__aside">
      <input placeholder="Пошук" type="text" className="search__input" />
      <ul className="search__nav">
          <li className="search__nav-item">
              Заклади первинної медичної допомоги
          </li>
          <li className="search__nav-item">
              Аптеки
          </li>
          <li className="search__nav-item search__nav-item_active">
              Діагностичні центри
          </li>
      </ul>
      <ul className="search__result" />
  </aside>
);
