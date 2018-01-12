import React from "react";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import InfoBox from "react-google-maps/lib/addons/InfoBox";
import MarkerClusterer from "react-google-maps/lib/addons/MarkerClusterer";
import classnames from "classnames";

import ArrowLink from "./ArrowLink";

const CIRCLE_ICON = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 4,
  strokeColor: "#4880ed",
  fillColor: "#4880ed",
  fillOpacity: 1
};

const HOVER_CIRCLE_ICON = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 20,
  strokeColor: "#4880ed",
  fillColor: "#4880ed",
  fillOpacity: 1
};

const ACTIVE_CIRCLE_ICON = {
  path: google.maps.SymbolPath.CIRCLE,
  scale: 8,
  strokeColor: "#4880ed",
  strokeWeight: 6,
  fillColor: "#ffffff",
  fillOpacity: 1
};

const ACTIVE_PIN_ICON = {
  url: "images/icons/marker.png",
  scaledSize: new google.maps.Size(33, 47),
  anchor: new google.maps.Point(17, 60)
};

const MapView = ({
  center,
  zoom,
  options,
  items,
  activeItemId,
  hoverItemId,
  onMapChange,
  onMarkerClick,
  onMarkerOver,
  onMarkerOut
}) => {
  let map;

  const activeItem = items.find(({ id }) => id === activeItemId);
  const hoverItem = items.find(({ id }) => id === hoverItemId);

  return (
    <GoogleMap
      ref={ref => (map = ref)}
      center={center}
      zoom={zoom}
      options={options}
      onIdle={() =>
        onMapChange({
          bounds: map.getBounds(),
          center: map.getCenter(),
          zoom: map.getZoom()
        })
      }
    >
      <MarkerClusterer>
        {items.map(({ id, coordinates: { latitude: lat, longitude: lng } }) => (
          <Marker
            key={id}
            position={{ lat, lng }}
            zIndex={2}
            defaultAnimation={0}
            icon={id === activeItemId ? ACTIVE_CIRCLE_ICON : CIRCLE_ICON}
            onMouseOver={() => onMarkerOver(id)}
            onClick={() => onMarkerClick(id)}
          />
        ))}
      </MarkerClusterer>

      {activeItem && (
        <Marker
          position={{
            lat: activeItem.coordinates.latitude,
            lng: activeItem.coordinates.longitude
          }}
          zIndex={3}
          defaultAnimation={0}
          icon={ACTIVE_PIN_ICON}
          onClick={() => onMarkerClick(activeItemId)}
        />
      )}

      {hoverItem && (
        <Marker
          position={{
            lat: hoverItem.coordinates.latitude,
            lng: hoverItem.coordinates.longitude
          }}
          zIndex={1}
          defaultAnimation={0}
          icon={HOVER_CIRCLE_ICON}
          opacity={0.1}
          onMouseOut={() => onMarkerOut(hoverItemId)}
        >
          <InfoBox>
            <SearchMapTooltip
              active={hoverItemId === activeItemId}
              id={hoverItem.id}
              name={hoverItem.name}
              legalEntity={hoverItem.legal_entity}
              addresses={hoverItem.addresses}
              contacts={hoverItem.contacts}
            />
          </InfoBox>
        </Marker>
      )}
    </GoogleMap>
  );
};

export default withGoogleMap(MapView);

const SearchMapTooltip = ({
  active,
  id,
  name,
  legalEntity,
  addresses: [address],
  contacts: { phones: [phone] },
}) => (
  <div
    className={classnames("search__map-tooltip", {
      "search__map-tooltip--active": active
    })}
  >
    <div className="search__result-item-title">
      {name} ({legalEntity.name})
    </div>
    <div>{address.settlement}</div>
    <div>{address.street}, {address.building}</div>
    <div>Тел.: {phone.number}</div>
    <ArrowLink to={`/${id}`} title="Детальніше" />
  </div>
);
