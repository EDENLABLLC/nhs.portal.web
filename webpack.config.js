require('dotenv').config({ silent: true });

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

const parts = require('./webpack/parts');

const DEBUG = process.env.NODE_ENV !== 'production';

const genConfig = webpackMerge(
  {
    devtool: DEBUG ? 'eval' : false,
    plugins: [
      new webpack.DefinePlugin({
        __DEV__: DEBUG,
      }),
    ],
  },
  parts.setupJs(),
  !DEBUG && parts.setupProduction()
);

const config = webpackMerge(
  {
    entry: {
      'main-join': ['./src/scripts/main-join.js'],
      'main': ['./src/scripts/main.js'],
      'config': ['./src/scripts/config.js'],
      'main.bundle': ['./src/scripts/react/pages/main.js'],
      'join.bundle': ['./src/scripts/react/pages/join.js'],
      'map.bundle': ['./src/scripts/react/pages/map.js'],
      'clarifications.bundle': ['./src/scripts/react/pages/clarifications.js'],
      'default.bundle': ['./src/scripts/react/pages/default.js']
    },
    output: {
      path: path.join(__dirname, 'dist', 'scripts'),
      filename: '[name].js?[hash]',
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        },
      }),
    ],
    externals : {
      react: 'React',
      'react-dom': 'ReactDOM'
    }
  },
  genConfig
);

module.exports = config;
