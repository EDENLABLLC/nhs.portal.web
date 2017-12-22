import React, { Component } from 'react';

class MoreArrow extends Component {
  render() {
    return (
      <a href='#' className="map__tooltip-link">
      Детальніше <i className="icon icon_name_arrow-right" />
      </a>
    );
  }
}

export default MoreArrow;