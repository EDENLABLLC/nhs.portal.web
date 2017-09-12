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
        <a href="/" className="search__back">
          <i className="icon icon_name_arrow-left" />
          Повернутися
        </a>
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
      <div className="search__result" ref={onMountList}>
        { !!items.length && (
          <div className="search__result-total">
            Знайдено {items.length} закрадів
          </div>
        )}
        <ul className="search__result-list">
          {
            items.length ? items.map(i => (
            <SearchResult
              key={i.id}
              {...i}
              phones={i.contacts.phones}
              address={i.addresses[0]}
              active={activeItem === i}
              onClick={() => onClickSearchItem(i)}
            />
          )) : "Результати відсутні"
          }
        </ul>
        { isLoading && 'Шукаємо записи...'}
        { !!items.length && hasMore && !isLoading  && <a className="search__more" onClick={onLoadMore}>Показати більше</a>}
      </div>
  </aside>
);
