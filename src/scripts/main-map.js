import { $ } from './dom';
import { fetchJSON } from './utils';

import Search from './search';

fetchJSON('data/search.json').then(data => {
  $('.search').forEach(node => new Search(node, data));
});


/*var map;
window.initMap = function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.4021368, lng: 30.5525107 },
    zoom: 11
  });

  const marker = new google.maps.Marker({
    title: 'Test',
    position: { lat: 50.4021368, lng: 30.5525107 },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,
      strokeColor: '#4880ed',
      fillOpacity: 1,
      fillColor: '#4880ed'
    },
    draggable: true,
    map: map
  });

  const infowindow = new google.maps.InfoWindow({
    content: `<b>Test</b>`,
    maxWidth: 200
  });

  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });
};
*/