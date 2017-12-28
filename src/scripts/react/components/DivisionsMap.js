import React, { Component } from "react";
import pickBy from "lodash/pickBy";

import { createUrl } from "../helpers/url";

import Aside from "./Aside";
import MapView from "./MapView";

const { API_ENDPOINT } = window.__CONFIG__;

const DEFAULT_CENTER = { lat: 50.4021368, lng: 30.4525107 };
const DEFAULT_ZOOM = 9;
const DEFAULT_TYPE = "CLINIC";

export default class DivisionsMap extends Component {
  state = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    type: DEFAULT_TYPE,
    items: [],
    isLoading: false,
    paging: {}
  };

  componentDidMount() {
    this.initFromSearchParams();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.type !== prevState.type ||
      this.state.name !== prevState.name ||
      this.state.bounds !== prevState.bounds
    ) {
      this.fetchDivisions();
    }
  }

  render() {
    const {
      type,
      name,
      center,
      zoom,
      isLoading,
      items,
      activeItemId,
      hoverItemId,
      paging: { page_number: currentPage, total_pages: totalPages }
    } = this.state;

    return (
      <section className="search">
        <Aside
          type={type}
          name={name}
          isLoading={isLoading}
          items={items}
          activeItemId={activeItemId}
          currentPage={currentPage}
          totalPages={totalPages}
          onSearchResultClick={this.setActiveItem}
          onSearchChange={name => this.setState({ name })}
          onTypeChange={type => this.setState({ type })}
          onLoadMore={() => this.fetchDivisions({ page: currentPage + 1 })}
        />
        <MapView
          containerElement={<div className="search__map" />}
          mapElement={<div className="search__map__el" />}
          center={center}
          zoom={zoom}
          items={items}
          activeItemId={activeItemId}
          hoverItemId={hoverItemId}
          onMapChange={changes => this.setState(changes)}
          onMarkerClick={this.setActiveItem}
          onMarkerOver={hoverItemId => this.setState({ hoverItemId })}
          onMarkerOut={() => this.setState({ hoverItemId: null })}
        />
      </section>
    );
  }

  initFromSearchParams() {
    const { location } = this.props;

    let { activeItemId, type, lat, lng, zoom } = parseSearchParams(
      location.search
    );

    [lat, lng, zoom] = [lat, lng, zoom].map(n => parseFloat(n, 10));

    const center = [lat, lng].every(v => !isNaN(v))
      ? { lat, lng }
      : undefined;

    this.setState(pickBy({ activeItemId, type, center, zoom }));
  }

  async fetchDivisions({ page = 1, page_size = 50 } = {}) {
    const { isLoading, type, name, bounds } = this.state;

    if (isLoading || !bounds) return;

    this.setState({ isLoading: true });

    const { north, east, south, west } = bounds.toJSON();

    const divisionsResponse = await fetch(
      createUrl(`${API_ENDPOINT}/reports/stats/divisions`, {
        type,
        name,
        north,
        east,
        south,
        west,
        page,
        page_size
      })
    );

    const { data, paging } = await divisionsResponse.json();

    this.setState(({ items }) => ({
      isLoading: false,
      items: page > 1 ? items.concat(data) : data,
      paging
    }));
  }

  setActiveItem = activeItemId => this.setState({ activeItemId });
}

const parseSearchParams = queryString =>
  Array.from(new URLSearchParams(queryString).entries()).reduce(
    (params, [name, value]) => ({ ...params, [name]: value }),
    {}
  );
