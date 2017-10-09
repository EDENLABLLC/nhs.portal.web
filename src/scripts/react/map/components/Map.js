import React from 'react';
import uniqBy from 'lodash/uniqBy';

import GoogleMap from 'react-google-maps/lib/GoogleMap';
import withGoogleMap from 'react-google-maps/lib/withGoogleMap';
import Marker from 'react-google-maps/lib/Marker';
import InfoBox from 'react-google-maps/lib/addons/InfoBox';
import MarkerClusterer from 'react-google-maps/lib/addons/MarkerClusterer';

import SearchMapTooltip from '../components/SearchMapTooltip';

export default withGoogleMap(({
  onMapMounted,
  onMarkerClick,
  onMarkerOver,
  onMarkerOut,
  markers = [],
  hoverMarker,
  activeMarker,
  ...props
}) => (
  <GoogleMap
    ref={onMapMounted}
    {...props}
  >
    { activeMarker && (
      <Marker
        {...{
          position: {
            lat: activeMarker.coordinates.latitude,
            lng: activeMarker.coordinates.longitude,
          },
          key: `${activeMarker.id}_active`,
          zIndex: 3,
          defaultAnimation: 0,
          icon: {
            url: 'images/icons/marker.png',
            scaledSize: new google.maps.Size(33, 47),
            anchor: new google.maps.Point(17, 60),
          },
          onClick: () => onMarkerClick(activeMarker)
        }}
      ></Marker>
    )}
    {
      console.log(markers, activeMarker, hoverMarker)
    }
    <MarkerClusterer>
      {uniqBy((markers || []).concat([activeMarker, hoverMarker]).filter(i => i), 'id').map((marker, index) => (
          <Marker
            {...{
              position: {
                lat: marker.coordinates.latitude,
                lng: marker.coordinates.longitude,
              },
              key: marker.id,
              zIndex: 2,
              defaultAnimation: 0,
              icon: (activeMarker && marker.id === activeMarker.id) ? {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                strokeColor: '#4880ed',
                fillOpacity: 1,
                fillColor: '#ffffff',
                strokeWeight: 6
              } : {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 4,
                strokeColor: '#4880ed',
                fillOpacity: 1,
                fillColor: '#4880ed'
              },
              onMouseOver: () => onMarkerOver(marker),
              onClick: () => onMarkerClick(marker)
            }}
          />
        ))}
      </MarkerClusterer>
      { hoverMarker && (
        <Marker
          {...{
            position: {
              lat: hoverMarker.coordinates.latitude,
              lng: hoverMarker.coordinates.longitude,
            },
            zIndex: 1,
            key: `${hoverMarker.id}_hover`,
            defaultAnimation: 0,
            onMouseOut: () => onMarkerOut(hoverMarker),
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              strokeColor: '#4880ed',
              fillOpacity: 1,
              fillColor: '#4880ed'
            },
            opacity: .1,
            draggable: true
          }}
        >
          <InfoBox
            maxWidth={250}
            disableAutoPan
            pixelOffset={new google.maps.Size(136,800)}
          >
           <div style={{ overflow: `hidden` }}>
              <SearchMapTooltip
                {...hoverMarker}
                active={hoverMarker && activeMarker && hoverMarker.id === activeMarker.id}
                address={hoverMarker.addresses[0]}
                phones={hoverMarker.contacts.phones}
                />
          </div>
          </InfoBox>
        </Marker>
      )}
  </GoogleMap>
));
