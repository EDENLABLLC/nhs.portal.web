import React from 'react';
import classnames from 'classnames';

const Gamburger = ({ onToggle, active }) => (
  <a
    onClick={() => onToggle()}
    className={
      classnames("control", active && "active")}
  >
    <span />
  </a>
);
export default Gamburger;