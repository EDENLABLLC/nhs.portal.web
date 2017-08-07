require('es6-promise').polyfill();
require('isomorphic-fetch');

import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';

ReactDOM.render(<App />, document.getElementById('map'));
