import Choices from 'choices.js';
import { $ } from './dom';

const select_elem = $('#select')[0];
// console.log(select_elem);

const example = new Choices(select_elem, {
  placeholderValue: "Оберіть тему",
  searchPlaceholderValue: "Ввідіть тему",
  noResultsText: "Не знайдено",
  itemSelectText: ''
});

// example.setChoices([
//   {value: 'One', label: 'Label One', disabled: true},
//   {value: 'Two', label: 'Label Two', selected: true},
//   {value: 'Three', label: 'Label Three'},
// ], 'value', 'label', false);