import React from 'react';
import GoogleMap from 'react-google-maps/lib/GoogleMap';
import withGoogleMap from 'react-google-maps/lib/withGoogleMap';

export default withGoogleMap(({ onMapMounted, ...props }) => (
  <GoogleMap
    ref={onMapMounted}
    {...props}
  >
  </GoogleMap>
));
