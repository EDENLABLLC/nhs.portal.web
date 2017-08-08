import React from 'react';
import throttleFn from 'lodash/throttle';
import debounceFn from 'lodash/debounce';


import Aside from './Aside';
import Map from '../components/Map';
import { createUrl } from '../helpers/url';

const geolocation = (
  navigator.geolocation ?
  navigator.geolocation :
  ({
    getCurrentPosition(success, failure) {
      failure && failure(`Your browser doesn't support geolocation.`);
    },
  })
);

const FIXTURE = [
  {
    "type": "CLINIC",
    "name": "Бориспільське відділення Клініки Odessa",
    "id": "df22a21e-998f-47fa-9cc1-f5c7cdc51867",
    "coordinates": {
      "longitude": 30.2501845,
      "latitude": 50.3130679
    },
    "contacts": {
      "phones": [
        {
          "type": "MOBILE",
          "number": "+380503410870"
        }
      ],
      "email": "sp.virny+51@gmail.com"
    },
    "addresses": [
      {
        "zip": "02090",
        "type": "REGISTRATION",
        "street_type": "STREET",
        "street": "вул. Ніжинська",
        "settlement_type": "CITY",
        "settlement_id": "707dbc55-cb6b-4aaa-97c1-2a1e03476100",
        "settlement": "СОРОКИ-ЛЬВІВСЬКІ",
        "region": "ПУСТОМИТІВСЬКИЙ",
        "country": "UA",
        "building": "15",
        "area": "ЛЬВІВСЬКА",
        "apartment": "23"
      }
    ]
  },
  {
    "type": "FAP",
    "name": "Бориспільське відділення Клініки Борис",
    "id": "0d96b5b9-1640-46e0-a912-5c16ee7cbf61",
    "coordinates": {
      "longitude": 30.3001845,
      "latitude": 50.5430679
    },
    "contacts": {
      "phones": [
        {
          "type": "MOBILE",
          "number": "+380503410870"
        }
      ],
      "email": "sp.virny+51@gmail.com"
    },
    "addresses": [
      {
        "zip": "02090",
        "type": "REGISTRATION",
        "street_type": "STREET",
        "street": "вул. Ніжинська",
        "settlement_type": "CITY",
        "settlement_id": "707dbc55-cb6b-4aaa-97c1-2a1e03476100",
        "settlement": "СОРОКИ-ЛЬВІВСЬКІ",
        "region": "ПУСТОМИТІВСЬКИЙ",
        "country": "UA",
        "building": "15",
        "area": "ЛЬВІВСЬКА",
        "apartment": "23"
      }
    ]
  },
  {
    "type": "AMBULANT_CLINIC",
    "name": "Бориспільське відділення Клініки Борис",
    "id": "e8ca8de5-e9be-4e9c-86d6-3472fc6bdc8d",
    "coordinates": {
      "longitude": 30.4001845,
      "latitude": 50.3430679
    },
    "contacts": {
      "phones": [
        {
          "type": "MOBILE",
          "number": "+380503410870"
        }
      ],
      "email": "sp.virny+51@gmail.com"
    },
    "addresses": [
      {
        "zip": "02090",
        "type": "REGISTRATION",
        "street_type": "STREET",
        "street": "вул. Ніжинська",
        "settlement_type": "CITY",
        "settlement_id": "707dbc55-cb6b-4aaa-97c1-2a1e03476100",
        "settlement": "СОРОКИ-ЛЬВІВСЬКІ",
        "region": "ПУСТОМИТІВСЬКИЙ",
        "country": "UA",
        "building": "15",
        "area": "ЛЬВІВСЬКА",
        "apartment": "23"
      }
    ]
  }
];


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 50.4021368, lng: 30.4525107 },
      bounds: null,
      type: 'CLINIC',
      search: null,
      zoom: 11
    };

    this.onBoundsChanged = this.onBoundsChanged.bind(this);
    this.onMapMounted = this.onMapMounted.bind(this);
    this.onSearchUpdate = this.onSearchUpdate.bind(this);
    this.onSearchTypeUpdate = this.onSearchTypeUpdate.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMarkerOver = this.onMarkerOver.bind(this);
    this.onMarkerOut = this.onMarkerOut.bind(this);

    this.fetchData = debounceFn(this.fetchData, 600);

    this.map = null;

    geolocation.getCurrentPosition((position) => {
      this.setState({
        center: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
      });
    });
  }
  onBoundsChanged(v) {
    if (!this.map) return;
    this.setState({
      bounds: this.map.getBounds(),
      center: this.map.getCenter(),
    }, () => {
      this.fetchData();
    });
  }
  onMapMounted(map) {
    this.map = map;
    this.fetchData();
  }
  onSearchUpdate(search) {
    this.setState({
      search: search,
    }, () => {
      this.fetchData();
    });
  }
  onSearchTypeUpdate(type) {
    this.setState({
      type: type,
    }, () => {
      this.fetchData();
    });
  }

  onMarkerClick(item) {
    console.log('onMarkerClick', item);
    this.setActiveMarker(item);
    // this.setCenter(item.coordinates)
  }
  onMarkerOver(item) {
    console.log('setHover', item);
    this.setState({
      hoverItem: item,
    });
  }
  onMarkerOut() {
    this.setState({
      hoverItem: null,
    });
  }

  setCenter(coordinates) {
    this.setState({
      center: {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      },
    });
  }

  setActiveMarker(item) {
    this.setState({
      activeItem: item,
    });
  }

  fetchData() {
    const topRight = this.state.bounds.getNorthEast();
    const bottomLeft = this.state.bounds.getSouthWest();

    console.log('fetch', this.state, topRight, bottomLeft);
    return fetch(createUrl(
      'http://dev.ehealth.world/reports/stats/divisions/map',
      {
        lefttop_latitude: topRight.lat(),
        lefttop_longitude: bottomLeft.lng(),
        rightbottom_latitude: bottomLeft.lat(),
        rightbottom_longitude: topRight.lng(),
        type: this.state.type,
        name: this.state.search,
      }
    )).then((resp) => {
      console.log(resp);
      return resp.json().then((json) => {
        this.setState({
          items: json.data,
        })
      })
    })
  }

  render() {
    return (
      <section className="search">
          <Aside
            type={this.state.type}
            onSeachUpdate={this.onSearchUpdate}
            onSearchTypeUpdate={this.onSearchTypeUpdate}
          />
          <Map
            defaultZoom={11}
            bounds={this.state.bounds}
            center={this.state.center}
            onMarkerClick={this.onMarkerClick}
            onMarkerOver={this.onMarkerOver}
            onMarkerOut={this.onMarkerOut}
            onMapMounted={this.onMapMounted}
            onBoundsChanged={this.onBoundsChanged}
            containerElement={
              <div className="search__map" />
            }
            mapElement={
              <div style={{ height: `100%` }} />
            }
            activeMarker={this.state.activeItem}
            hoverMarker={this.state.hoverItem}
            markers={this.state.items}
          />
      </section>
    );
  }
}
