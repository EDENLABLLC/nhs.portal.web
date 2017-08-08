import React from 'react';
import classnames from 'classnames';
import SearchResult from '../components/SearchResult';

const types = [
  { type: 'CLINIC', title: 'Клініки' },
  { type: 'AMBULANT_CLINIC', title: 'Амбулаторії' },
  { type: 'FAP', title: 'Аптеки' },
];

export default ({ type, activeItem, items = [], onSearchTypeUpdate, onClickSearchItem }) => (
  <aside className="search__aside">
      <div className="search__header">
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
      </div>
      <ul className="search__result">
        {items.map(i => (
          <SearchResult
            key={i.id}
            {...i}
            phones={i.contacts.phones}
            address={i.addresses[0]}
            active={activeItem === i}
            onClick={() => onClickSearchItem(i)}
          />
        ))}
      </ul>
  </aside>
);
