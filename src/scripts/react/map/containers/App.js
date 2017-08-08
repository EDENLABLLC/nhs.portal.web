import React from 'react';
import throttleFn from 'lodash/throttle';
import debounceFn from 'lodash/debounce';
import withRouter from 'react-router/lib/withRouter';

import Aside from './Aside';
import Map from '../components/Map';
import { createUrl, replaceQuery } from '../helpers/url';

const geolocation = (
  navigator.geolocation ?
  navigator.geolocation :
  ({
    getCurrentPosition(success, failure) {
      failure && failure(`Your browser doesn't support geolocation.`);
    },
  })
);

@withRouter
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
    this.onClickSearchItem = this.onClickSearchItem.bind(this);

    this.fetchData = debounceFn(this.fetchData, 600);

    this.map = null;
  }
  onBoundsChanged(v) {
    if (!this.map) return;
    if (!this.mounted) {
      this.mounted = true;
      return;
    }

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
    this.setActiveItem(item);
  }
  onClickSearchItem(item) {
    this.setActiveItem(item);
  }
  onMarkerOver(item) {
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

  setActiveItem(item) {
    this.setState({
      activeItem: item,
    });
  }

  fetchData() {

    if (!this.state.bounds) return;
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
            items={this.state.items}
            activeItem={this.state.activeItem}
            type={this.state.type}
            onSeachUpdate={this.onSearchUpdate}
            onSearchTypeUpdate={this.onSearchTypeUpdate}
            onClickSearchItem={this.onClickSearchItem}
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
