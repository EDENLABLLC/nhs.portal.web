import Promise from "promise-polyfill";
import SmoothScroll from "smoothscroll-polyfill";
import "./select";
import AOS from "aos";

import { $ } from "./dom";
import { fetchJSON } from "./utils";

import Nav from "./nav";
import Feedback from "./feedback";

if (!window.Promise) {
  window.Promise = Promise;
}

SmoothScroll.polyfill();

AOS.init({
  duration: 1200,
  disable: "mobile"
});

$(".nav").forEach(node => new Nav(node));
$(".feedback").forEach(node => new Feedback(node));

const { API_ENDPOINT } = window.__CONFIG__;

fetchJSON(`${API_ENDPOINT}/reports/stats/`).then(data => {
  const joined_items = $(".joined__item-count");
  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.doctors;
  joined_items[2].innerText = data.data.declarations;
  joined_items[3].innerText = data.data.pharmacies;
  joined_items[4].innerText = data.data.pharmacists;
});
