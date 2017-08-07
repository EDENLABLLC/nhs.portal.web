(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var toArray = exports.toArray = function toArray(arrayLike) {
  if (Array.isArray(arrayLike)) {
    return arrayLike;
  }

  if (arrayLike instanceof Node) {
    return [arrayLike];
  }

  return Array.prototype.slice.call(arrayLike);
};

var $ = exports.$ = function $(selector) {
  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
  return toArray(context.querySelectorAll.call(context, selector));
};

var selector = exports.selector = function selector(block, elem, modName, modVal) {
  return block + '__' + elem + (modName ? modVal ? '_' + modName + '_' + modVal : '_' + modName : '');
};

var buildClass = exports.buildClass = function buildClass() {
  return '.' + selector.apply(undefined, arguments);
};

var BEM = exports.BEM = function (_ref) {
  _inherits(BEM, _ref);

  function BEM(name, node) {
    _classCallCheck(this, BEM);

    var _this = _possibleConstructorReturn(this, (BEM.__proto__ || Object.getPrototypeOf(BEM)).call(this));

    _this.node = node;
    _this.name = name;
    return _this;
  }

  _createClass(BEM, [{
    key: 'elem',
    value: function elem(name, modName, modVal) {
      return this.node.querySelector(buildClass(this.name, name, modName, modVal));
    }
  }, {
    key: 'elems',
    value: function elems(name, modName, modVal) {
      return $(buildClass(this.name, name, modName, modVal), this.node);
    }
  }, {
    key: 'setMod',
    value: function setMod(elem, elemName, modName, modValue) {
      var _this2 = this;

      toArray(elem).forEach(function (node) {
        return node.classList.add(selector(_this2.name, elemName, modName, modValue));
      });

      return this;
    }
  }, {
    key: 'delMod',
    value: function delMod(elem, elemName, modName) {
      var _this3 = this;

      toArray(elem).forEach(function (node) {
        return node.classList.remove(selector(_this3.name, elemName, modName));
      });

      return this;
    }
  }]);

  return BEM;
}(null);

},{}],2:[function(require,module,exports){
'use strict';

var _dom = require('./dom');

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _dom.$)('.tabs').forEach(function (node) {
  return new _tabs2.default(node, { autoHeight: true });
});

},{"./dom":1,"./tabs":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = require('./dom');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PANEL_ANIMATION_OPTIONS = {
  duration: 300,
  fill: 'forwards',
  easing: 'ease-in-out'
};

var Tabs = function (_BEM) {
  _inherits(Tabs, _BEM);

  function Tabs(node) {
    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
        _ref$autoHeight = _ref.autoHeight,
        autoHeight = _ref$autoHeight === undefined ? false : _ref$autoHeight;

    _classCallCheck(this, Tabs);

    var _this = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, 'tabs', node));

    _this.$controls = _this.elems('nav-item');
    _this.$slides = _this.elems('slide');

    _this.$marker = document.createElement('div');
    _this.$marker.classList.add((0, _dom.selector)(_this.name, 'marker'));
    _this.elem('header').appendChild(_this.$marker);

    if (autoHeight) {
      var maxHeight = _this.$slides.reduce(function (target, item) {
        if (item.clientHeight > target) {
          target = item.clientHeight;
        }

        return target;
      }, 0);

      _this.elem('main').style.height = maxHeight + 'px';
    }

    _this.currentIndex = _this.getIndexByElem(_this.elem('nav-item', 'active'));

    _this.elem('nav').addEventListener('click', function (e) {
      if (!e.target.closest((0, _dom.buildClass)(_this.name, 'nav-item'))) {
        return;
      }

      var toIndex = _this.getIndexByElem(e.target);

      if (toIndex === _this.currentIndex) {
        return;
      }

      _this.delMod(_this.elem('nav-item', 'active'), 'nav-item', 'active');
      _this.setMod(e.target, 'nav-item', 'active');

      _this.animatePanels(toIndex);
      _this.animateMarker(toIndex);

      _this.currentIndex = toIndex;
    }, false);

    _this.setMod(_this.elem('nav-item', 'active'), 'nav-item', 'marker');
    return _this;
  }

  _createClass(Tabs, [{
    key: 'animatePanels',
    value: function animatePanels(index) {
      var current = this.currentIndex;
      var isNext = current < index;

      current !== undefined && this.$slides[current].animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(' + (isNext ? '-' : '') + '100%)', opacity: 0 }], PANEL_ANIMATION_OPTIONS);

      this.$slides[index].animate([{ transform: 'translateX(' + (isNext ? '' : '-') + '100%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], PANEL_ANIMATION_OPTIONS);
    }
  }, {
    key: 'animateMarker',
    value: function animateMarker(index) {
      var _this2 = this;

      var current = {
        left: this.$controls[this.currentIndex].offsetLeft,
        width: this.$controls[this.currentIndex].clientWidth
      };

      var left = this.$controls[index].offsetLeft;
      var width = this.$controls[index].clientWidth;

      var player = this.$marker.animate([{
        transform: 'translateX(' + current.left + 'px)',
        width: current.width + 'px'
      }, {
        transform: 'translateX(' + left + 'px)',
        width: width + 'px'
      }], _extends({}, PANEL_ANIMATION_OPTIONS, { fill: 'none' }));

      player.onfinish = function () {
        _this2.setMod(_this2.$controls[index], 'nav-item', 'marker');
      };

      this.delMod(this.$controls[this.currentIndex], 'nav-item', 'marker');
    }
  }, {
    key: 'getIndexByElem',
    value: function getIndexByElem(elem) {
      var index = -1;

      this.$controls.some(function (node, i) {
        if (node === elem) {
          index = i;
          return true;
        }
      });

      return index;
    }
  }]);

  return Tabs;
}(_dom.BEM);

exports.default = Tabs;
module.exports = exports['default'];

},{"./dom":1}]},{},[2]);
