import React from 'react';

import SearchResult from '../components/SearchResult';

const types = [
  { type: 'CLINIC', title: 'Клініки' },
  { type: 'AMBULANT_CLINIC', title: 'Амбулаторії' },
  { type: 'FAP', title: 'Аптеки' },
];

export default ({
  type,
  activeItem,
  items = [],
  onLoadMore,
  onMountList,
  isLoading,
  hasMore,
  onSearchUpdate,
  onSearchTypeUpdate,
  onClickSearchItem
}) => (
  <aside className="search__aside">
      <div className="search__header">
        <input placeholder="Пошук" type="text" className="search__input" onInput={(e) => onSearchUpdate(e.target.value)} />
        <ul className="search__nav">
          {types.map(typeItem => (
            <li
              className={`search__nav-item ${type === typeItem.type ? 'search__nav-item_active' : ''}`}
              onClick={type !== typeItem.type && (() => onSearchTypeUpdate(typeItem.type))}
              key={typeItem.type}
            >
              {typeItem.title}
            </li>
          ))}
        </ul>
      </div>
      <ul className="search__result" ref={onMountList}>
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
        { isLoading && 'Шукаємо записи...'}
        { !!items.length && hasMore && !isLoading  && <button onClick={onLoadMore}>Знайти ще</button>}
      </ul>
  </aside>
);
