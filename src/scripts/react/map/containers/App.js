import React from 'react';
import throttleFn from 'lodash/throttle';
import debounceFn from 'lodash/debounce';
import pickFn from 'lodash/pick';

import withRouter from 'react-router/lib/withRouter';

import Aside from './Aside';
import Map from '../components/Map';
import { createUrl } from '../helpers/url';

const { API_ENDPOINT } = window.__CONFIG__;

@withRouter
export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      center: { lat: 50.4021368, lng: 30.4525107 },
      bounds: null,
      type: 'CLINIC',
      search: null,
      zoom: 11,
      items: [],
      isLoading: false,
      pagination: {
        page_number: null,
        page_size: null,
        total_entries: null,
        total_pages: null,
      },
    };

    this.onBoundsChanged = debounceFn(this.onBoundsChanged.bind(this), 2000);
    this.onMapMounted = this.onMapMounted.bind(this);
    this.onSearchUpdate = debounceFn(this.onSearchUpdate.bind(this), 1000);
    this.onSearchTypeUpdate = this.onSearchTypeUpdate.bind(this);
    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onMarkerOver = this.onMarkerOver.bind(this);
    this.onMarkerOut = this.onMarkerOut.bind(this);
    this.onClickSearchItem = this.onClickSearchItem.bind(this);

    this.onMountList = this.onMountList.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);

    this.fetchData = this.fetchData.bind(this);

    this.map = null;

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
    this.setState({
      bounds: this.map.getBounds(),
      center: this.map.getCenter(),
    }, () => {
      setTimeout(() => {
        this.fetchData();
      });
    });
  }
  onSearchUpdate(value) {
    this.setState({
      search: value,
    }, () => {
      this.fetchData();
    });
  }
  onMountList(list) {
    this.list = list;
  }
  onSearchTypeUpdate(type) {
    this.setState({
      type: type,
    }, () => {
      setTimeout(() => {
        this.fetchData();
      });
    });
  }
  onLoadMore() {
    return this.fetchData({
      page: this.state.pagination.page_number + 1
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

  fetchData({ page = 1 } = {}) {

    console.log('fetchData', this.state);
    if (!this.state.bounds) return;
    if (this.state.isLoading) return;

    return this.setState({
      isLoading: true,
    }, () => {

      const newSet = page === 1;
      const oldTopScroll = this.list.scrollTop;

      const topRight = this.state.bounds.getNorthEast();
      const bottomLeft = this.state.bounds.getSouthWest();

      return fetch(createUrl(
        `${API_ENDPOINT}/reports/stats/divisions/map`,
        {
          lefttop_latitude: topRight.lat(),
          lefttop_longitude: bottomLeft.lng(),
          rightbottom_latitude: bottomLeft.lat(),
          rightbottom_longitude: topRight.lng(),
          type: this.state.type,
          name: this.state.search,
          page_size: 50,
          page: page,
        }
      )).then((resp) => {
        return resp.json().then((json) => {
          this.setState({
            isLoading: false,
            items: json.data.length > 0 ? (newSet ? json.data : [].concat(this.state.items).concat(json.data)) : [].concat(this.state.items),
            pagination: pickFn(json.paging, ['page_number', 'page_size', 'total_entries', 'total_pages']),
          }, () => {
            if (this.list && newSet) this.list.scrollTop = 0;
            else this.list.scrollTop = oldTopScroll;
          });
        })
      })
    });
  }

  render() {
    return (
      <section className="search">
          <Aside
            items={this.state.items}
            activeItem={this.state.activeItem}
            type={this.state.type}
            onSearchUpdate={this.onSearchUpdate}
            onSearchTypeUpdate={this.onSearchTypeUpdate}
            onClickSearchItem={this.onClickSearchItem}
            onLoadMore={this.onLoadMore}
            hasMore={this.state.pagination.page_number <= this.state.pagination.total_pages}
            isLoading={this.state.isLoading}
            onMountList={this.onMountList}
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
              <div className="search__map__el" />
            }
            activeMarker={this.state.activeItem}
            hoverMarker={this.state.hoverItem}
            markers={this.state.items}
          />
      </section>
    );
  }
}
