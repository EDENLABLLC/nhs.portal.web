import Promise from "promise-polyfill";
import SmoothScroll from "smoothscroll-polyfill";
import "./select";
import AOS from "aos";
import { subDays, eachDay } from "date-fns";

import { $ } from "./dom";
import { fetchJSON } from "./utils";

import Nav from "./nav";
import Tabs from "./tabs";
import Slider from "./slider";
import Map from "./map";

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
$(".tabs").forEach(node => {
  const tab = new Tabs(node);
  tab.selectElemByHash(location.hash.slice(1));
});
$(".feedback").forEach(node => new Feedback(node));

const { API_ENDPOINT } = window.__CONFIG__;

fetchJSON(`${API_ENDPOINT}/reports/stats/regions`).then(data => {
  $(".map").forEach(node => new Map(node, data.data));
});

fetchJSON(`${API_ENDPOINT}/reports/stats/`).then(data => {
  const joined_items = $(".joined__item-count");
  joined_items[0].innerText = data.data.msps;
  joined_items[1].innerText = data.data.doctors;
  joined_items[2].innerText = data.data.declarations;
});
