import React from 'react';
import classnames from 'classnames';

const types = [
  { type: 'CLINIC', title: 'Клініки' },
  { type: 'AMBULANT_CLINIC', title: 'Амбулаторії' },
  { type: 'FAP', title: 'Аптеки' },
];

export default ({ type, onSearchTypeUpdate }) => (
  <aside className="search__aside">
      <input placeholder="Пошук" type="text" className="search__input" />
      <ul className="search__nav">
        {types.map(typeItem => (
          <li
            className={classnames(
              'search__nav-item',
              type === typeItem.type && 'search__nav-item_active'
            )}
            onClick={type !== typeItem.type && (() => onSearchTypeUpdate(typeItem.type))}
            key={typeItem.type}
          >
            {typeItem.title}
          </li>
        ))}
      </ul>
      <ul className="search__result" />
  </aside>
);
