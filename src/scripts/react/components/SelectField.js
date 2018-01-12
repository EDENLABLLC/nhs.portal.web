import React from "react";
import Downshift from "downshift";
import classnames from "classnames";

const SelectField = ({
  label,
  placeholder,
  items,
  itemToString,
  selectedItemChanged,
  filterItems = (item, inputValue) =>
    item.toLowerCase().includes(inputValue.toLowerCase()),
  renderItem = (item, index) => item,
  itemKeyExtractor = (item, index) => item,
  inputValue,
  selectedItem,
  onInputValueChange,
  onSelect,
  onChange
}) => (
  <Downshift
    itemToString={itemToString}
    selectedItemChanged={selectedItemChanged}
    inputValue={inputValue}
    selectedItem={selectedItem}
    onInputValueChange={onInputValueChange}
    onSelect={onSelect}
    onChange={onChange}
    render={({
      getLabelProps,
      getInputProps,
      getItemProps,
      isOpen,
      inputValue,
      selectedItem,
      highlightedIndex,
      toggleMenu,
      clearSelection
    }) => (
      <div className="field">
        <label className="field__label" {...getLabelProps()}>
          {label}
        </label>
        <input
          className="field__input field__select-input"
          {...getInputProps({ placeholder })}
        />

        <div className="field__controls">
          {selectedItem != null ? (
            <button
              type="button"
              className="field__control-clear"
              onClick={clearSelection}
            >
              &times;
            </button>
          ) : (
            items.length > 0 && (
              <button
                type="button"
                className={classnames("field__control-toggle", {
                  "field__control-toggle--open": isOpen
                })}
                onClick={toggleMenu}
              />
            )
          )}
        </div>

        {isOpen &&
          items.length > 0 && (
            <div className="field__dropdown">
              {items
                .filter(item => filterItems(item, inputValue))
                .map((item, index) => (
                  <div
                    key={itemKeyExtractor(item, index)}
                    className={classnames("field__dropdown-item", {
                      "field__dropdown-item--highlighted":
                        highlightedIndex === index
                      // "field__dropdown-item--selected": selectedItem.id === item.id
                    })}
                    {...getItemProps({ item })}
                  >
                    {renderItem(item, index)}
                  </div>
                ))}
            </div>
          )}
      </div>
    )}
  />
);

export default SelectField;
