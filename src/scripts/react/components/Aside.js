import React, { Component } from "react";
import debounce from "lodash/debounce";
import classnames from "classnames";

import SearchResult from "./SearchResult";

const DIVISION_TYPES = [
  { name: "CLINIC", title: "Клініки" },
  { name: "AMBULANT_CLINIC", title: "Амбулаторії" },
  { name: "FAP", title: "ФАП" }
  // { name: 'DRUGSTORE', title: 'Аптеки' },
  // { name: 'DRUGSTORE_POINT', title: 'Аптечні пункти' }
];

export default class Aside extends Component {
  componentWillUpdate(nextProps) {
    if (nextProps.currentPage <= this.props.currentPage) {
      this.resultList.scrollTop = 0;
    }
  }

  render() {
    const {
      type,
      name,
      isLoading,
      items,
      activeItemId,
      currentPage,
      totalPages,
      onSearchResultClick,
      onTypeChange,
      onLoadMore
    } = this.props;

    return (
      <aside className="search__aside">
        <div className="search__header">
          <a href="/" className="search__back">
            <i className="icon icon_name_arrow-left" />
            Повернутися
          </a>
          <input
            placeholder="Пошук"
            type="text"
            className="search__input"
            value={name}
            onChange={event => this.handleNameChange(event.target.value)}
          />
          <ul className="search__nav">
            {DIVISION_TYPES.map(({ name, title }) => (
              <li
                key={name}
                className={classnames("search__nav-item", {
                  "search__nav-item_active": name === type
                })}
                onClick={() => onTypeChange(name)}
              >
                {title}
              </li>
            ))}
          </ul>
        </div>
        <div ref={e => (this.resultList = e)} className="search__result">
          {items.length > 0 && (
            <div className="search__result-total">
              Знайдено {items.length} закладів
            </div>
          )}
          <ul className="search__result-list">
            {items.length
              ? items.map((i) => {
                const { id, name, legal_entity, addresses, contacts } = i;

                return (
                    <SearchResult
                      key={id}
                      active={activeItemId === id}
                      name={name}
                      legalEntity={legal_entity}
                      addresses={addresses}
                      contacts={contacts}
                      onClick={() => onSearchResultClick(id)}
                    />
                  )
              }

              )
              : "Результати відсутні"}
          </ul>
          {isLoading
            ? "Шукаємо записи..."
            : currentPage < totalPages && (
                <a className="search__more" onClick={onLoadMore}>
                  Показати більше
                </a>
              )}
        </div>
      </aside>
    );
  }

  handleNameChange = debounce(
    value => this.props.onNameChange(value),
    1000
  );
}
