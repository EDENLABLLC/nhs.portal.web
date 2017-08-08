import React from 'react';
import classnames from 'classnames';

export default ({ name, active, address, phones = [], doctors, declarations }) => (
  <div className={classnames('search__map-tooltip', active && 'search__map-tooltip--active')}>
    <b>{name}</b> <br />
    {address.settlement} <br />
    {address.street}, {address.building} <br />
    Тел.: {phones[0].number} <br />
    {/*
    <div className="search__map-tooltip-count">
        {doctors}
        <small>лікарів</small>
    </div>
    <div className="search__map-tooltip-count">
        {declarations}
        <small>декларацій підписано</small>
    </div> */}
  </div>
)
