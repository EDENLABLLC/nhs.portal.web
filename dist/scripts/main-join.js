/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 358);
/******/ })
/************************************************************************/
/******/ ({

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nvar toArray = exports.toArray = function toArray(arrayLike) {\n  if (Array.isArray(arrayLike)) {\n    return arrayLike;\n  }\n\n  if (arrayLike instanceof Node) {\n    return [arrayLike];\n  }\n\n  return Array.prototype.slice.call(arrayLike);\n};\n\nvar $ = exports.$ = function $(selector) {\n  var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;\n  return toArray(context.querySelectorAll.call(context, selector));\n};\n\nvar selector = exports.selector = function selector(block, elem, modName, modVal) {\n  return block + \"__\" + elem + (modName ? modVal ? \"_\" + modName + \"_\" + modVal : \"_\" + modName : '');\n};\nvar addRule = exports.addRule = function (style) {\n  var sheet = document.head.appendChild(style).sheet;\n  return function (selector, css) {\n    var propText = typeof css === \"string\" ? css : Object.keys(css).map(function (p) {\n      return p + \":\" + (p === \"content\" ? \"'\" + css[p] + \"'\" : css[p]);\n    }).join(\";\");\n    sheet.insertRule(selector + \"{\" + propText + \"}\", sheet.cssRules.length);\n  };\n}(document.createElement(\"style\"));\n\nvar buildClass = exports.buildClass = function buildClass() {\n  return \".\" + selector.apply(undefined, arguments);\n};\n\nvar getParents = exports.getParents = function getParents(target) {\n  var parent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;\n\n  var parents = [];\n  var p = target.parentNode;\n\n  while (p !== parent) {\n    var o = p;\n    parents.push(o);\n    p = o.parentNode;\n  }\n  parents.push(parent);\n\n  return parents;\n};\n\nvar BEM = exports.BEM = function (_ref) {\n  _inherits(BEM, _ref);\n\n  function BEM(name, node) {\n    _classCallCheck(this, BEM);\n\n    var _this = _possibleConstructorReturn(this, (BEM.__proto__ || Object.getPrototypeOf(BEM)).call(this));\n\n    _this.node = node;\n    _this.name = name;\n    return _this;\n  }\n\n  _createClass(BEM, [{\n    key: \"elem\",\n    value: function elem(name, modName, modVal) {\n      return this.node.querySelector(buildClass(this.name, name, modName, modVal));\n    }\n  }, {\n    key: \"elems\",\n    value: function elems(name, modName, modVal) {\n      var _this2 = this;\n\n      return $(buildClass(this.name, name, modName, modVal), this.node).filter(function (node) {\n        var $parents = getParents(node, _this2.node);\n        var $firstBlock = $parents.filter(function (parent) {\n          return parent.classList.contains(_this2.name);\n        })[0];\n\n        return $firstBlock === _this2.node;\n      });\n    }\n  }, {\n    key: \"setMod\",\n    value: function setMod(elem, elemName, modName, modValue) {\n      var _this3 = this;\n\n      toArray(elem).forEach(function (node) {\n        return node.classList.add(selector(_this3.name, elemName, modName, modValue));\n      });\n\n      return this;\n    }\n  }, {\n    key: \"delMod\",\n    value: function delMod(elem, elemName, modName) {\n      var _this4 = this;\n\n      toArray(elem).forEach(function (node) {\n        return node.classList.remove(selector(_this4.name, elemName, modName));\n      });\n\n      return this;\n    }\n  }]);\n\n  return BEM;\n}(null);\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/scripts/dom.js\n// module id = 11\n// module chunks = 1 2 3\n\n//# sourceURL=webpack:///./src/scripts/dom.js?");

/***/ }),

/***/ 358:
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(359);\n\n\n//////////////////\n// WEBPACK FOOTER\n// multi ./src/scripts/main-join.js\n// module id = 358\n// module chunks = 2\n\n//# sourceURL=webpack:///multi_./src/scripts/main-join.js?");

/***/ }),

/***/ 359:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _dom = __webpack_require__(11);\n\nvar _tabs = __webpack_require__(43);\n\nvar _tabs2 = _interopRequireDefault(_tabs);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\n(0, _dom.$)('.tabs').forEach(function (node) {\n  return new _tabs2.default(node);\n});\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/scripts/main-join.js\n// module id = 359\n// module chunks = 2\n\n//# sourceURL=webpack:///./src/scripts/main-join.js?");

/***/ }),

/***/ 43:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nObject.defineProperty(exports, \"__esModule\", {\n  value: true\n});\nexports.default = undefined;\n\nvar _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };\n\nvar _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if (\"value\" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();\n\nvar _dom = __webpack_require__(11);\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError(\"Cannot call a class as a function\"); } }\n\nfunction _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\"); } return call && (typeof call === \"object\" || typeof call === \"function\") ? call : self; }\n\nfunction _inherits(subClass, superClass) { if (typeof superClass !== \"function\" && superClass !== null) { throw new TypeError(\"Super expression must either be null or a function, not \" + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }\n\nvar PANEL_ANIMATION_OPTIONS = {\n  duration: 300,\n  fill: 'forwards',\n  easing: 'ease-in-out'\n};\n\nvar Tabs = function (_BEM) {\n  _inherits(Tabs, _BEM);\n\n  function Tabs(node) {\n    var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},\n        _ref$autoHeight = _ref.autoHeight,\n        autoHeight = _ref$autoHeight === undefined ? false : _ref$autoHeight;\n\n    _classCallCheck(this, Tabs);\n\n    var _this = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, 'tabs', node));\n\n    _this.$controls = _this.elems('nav-item');\n    _this.$slides = _this.elems('slide');\n\n    _this.$marker = document.createElement('div');\n    _this.$marker.classList.add((0, _dom.selector)(_this.name, 'marker'));\n\n    _this.elem('header').appendChild(_this.$marker);\n\n    if (autoHeight) {\n      var maxHeight = _this.$slides.reduce(function (target, item) {\n        if (item.clientHeight > target) {\n          target = item.clientHeight;\n        }\n\n        return target;\n      }, 0);\n\n      _this.elem('main').style.height = maxHeight + 'px';\n    }\n\n    _this.currentIndex = _this.getIndexByElem(_this.elem('nav-item', 'active'));\n\n    _this.elem('nav').addEventListener('click', function (e) {\n      var $elem = e.target.closest((0, _dom.buildClass)(_this.name, 'nav-item'));\n\n      if (!$elem) {\n        return;\n      }\n\n      var toIndex = _this.getIndexByElem($elem);\n\n      if (toIndex === _this.currentIndex) {\n        return;\n      }\n\n      _this.delMod(_this.elem('nav-item', 'active'), 'nav-item', 'active');\n      _this.setMod($elem, 'nav-item', 'active');\n\n      _this.animatePanels(toIndex);\n      _this.animateMarker(toIndex);\n\n      _this.currentIndex = toIndex;\n    }, false);\n\n    _this.setMod(_this.elem('nav-item', 'active'), 'nav-item', 'marker');\n    return _this;\n  }\n\n  _createClass(Tabs, [{\n    key: 'animatePanels',\n    value: function animatePanels(index) {\n      var current = this.currentIndex;\n      var isNext = current < index;\n\n      current !== undefined && this.$slides[current].animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(' + (isNext ? '-' : '') + '100%)', opacity: 0 }], PANEL_ANIMATION_OPTIONS);\n\n      this.$slides[index].animate([{ transform: 'translateX(' + (isNext ? '' : '-') + '100%)', opacity: 0 }, { transform: 'translateX(0)', opacity: 1 }], PANEL_ANIMATION_OPTIONS);\n    }\n  }, {\n    key: 'animateMarker',\n    value: function animateMarker(index) {\n      var _this2 = this;\n\n      var current = {\n        left: this.$controls[this.currentIndex].offsetLeft,\n        width: this.$controls[this.currentIndex].clientWidth\n      };\n\n      var left = this.$controls[index].offsetLeft;\n      var width = this.$controls[index].clientWidth;\n\n      var player = this.$marker.animate([{\n        transform: 'translateX(' + current.left + 'px)',\n        width: current.width + 'px'\n      }, {\n        transform: 'translateX(' + left + 'px)',\n        width: width + 'px'\n      }], _extends({}, PANEL_ANIMATION_OPTIONS));\n\n      player.onfinish = function () {\n        _this2.setMod(_this2.$controls[index], 'nav-item', 'marker');\n        requestAnimationFrame(function () {\n          return player.cancel();\n        });\n      };\n\n      this.delMod(this.$controls[this.currentIndex], 'nav-item', 'marker');\n    }\n  }, {\n    key: 'getIndexByElem',\n    value: function getIndexByElem(elem) {\n      var index = -1;\n\n      this.$controls.some(function (node, i) {\n        if (node === elem) {\n          index = i;\n          return true;\n        }\n      });\n\n      return index;\n    }\n  }]);\n\n  return Tabs;\n}(_dom.BEM);\n\nexports.default = Tabs;\nmodule.exports = exports['default'];\n\n//////////////////\n// WEBPACK FOOTER\n// ./src/scripts/tabs.js\n// module id = 43\n// module chunks = 1 2 3\n\n//# sourceURL=webpack:///./src/scripts/tabs.js?");

/***/ })

/******/ });