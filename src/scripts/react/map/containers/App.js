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


export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: { lat: 50.4021368, lng: 30.4525107 },
      bounds: null,
      type: null,
      search: null,
      zoom: 11
    };
    this.onBoundsChanged = this.onBoundsChanged.bind(this);
    this.onMapMounted = this.onMapMounted.bind(this);
    this.onSearchUpdate = this.onSearchUpdate.bind(this);
    this.onSearchTypeUpdate = this.onSearchTypeUpdate.bind(this);
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
      }
    )).then((resp) => {
      console.log(resp);
      return resp.json().then((json) => {
        console.log('json', json);
      })
    })
  }

  render() {
    return (
      <section className="search">
          <Aside
            onSeachUpdate={this.onSearchUpdate}
            onSearchTypeUpdate={this.onSearchTypeUpdate}
          />
          <Map
            defaultZoom={11}
            bounds={this.state.bounds}
            center={this.state.center}
            onMapMounted={this.onMapMounted}
            onBoundsChanged={this.onBoundsChanged}
            containerElement={
              <div className="search__map" />
            }
            mapElement={
              <div style={{ height: `100%` }} />
            }
          />
      </section>
    );
  }
}
