import Choices from 'choices.js';
import { $ } from './dom';

const select_elem = $('#select')[0];

const example = new Choices(select_elem, {
  searchPlaceholderValue: "Ввідіть тему",
  noResultsText: "Не знайдено",
  itemSelectText: '',
  searchEnabled: false,

});
