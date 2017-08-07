import React from 'react';
import { GoogleMap, withGoogleMap } from 'react-google-maps';

const Map = withGoogleMap(() => (
  <GoogleMap
    defaultZoom={11}
    defaultCenter={{ lat: 50.4021368, lng: 30.4525107 }}
  >
  </GoogleMap>
));

export default (props) => (
  <Map
    containerElement={
      <div className="search__map" />
    }
    mapElement={
      <div style={{ height: `100%` }} />
    }
  />
);
