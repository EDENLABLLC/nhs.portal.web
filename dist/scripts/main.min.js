(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}],2:[function(require,module,exports){
/*
 * smoothscroll polyfill - v0.3.5
 * https://iamdustan.github.io/smoothscroll
 * 2016 (c) Dustan Kasten, Jeremias Menichelli - MIT License
 */

(function(w, d, undefined) {
  'use strict';

  /*
   * aliases
   * w: window global object
   * d: document
   * undefined: undefined
   */

  // polyfill
  function polyfill() {
    // return when scrollBehavior interface is supported
    if ('scrollBehavior' in d.documentElement.style) {
      return;
    }

    /*
     * globals
     */
    var Element = w.HTMLElement || w.Element;
    var SCROLL_TIME = 468;

    /*
     * object gathering original scroll methods
     */
    var original = {
      scroll: w.scroll || w.scrollTo,
      scrollBy: w.scrollBy,
      elScroll: Element.prototype.scroll || scrollElement,
      scrollIntoView: Element.prototype.scrollIntoView
    };

    /*
     * define timing method
     */
    var now = w.performance && w.performance.now
      ? w.performance.now.bind(w.performance) : Date.now;

    /**
     * changes scroll position inside an element
     * @method scrollElement
     * @param {Number} x
     * @param {Number} y
     */
    function scrollElement(x, y) {
      this.scrollLeft = x;
      this.scrollTop = y;
    }

    /**
     * returns result of applying ease math function to a number
     * @method ease
     * @param {Number} k
     * @returns {Number}
     */
    function ease(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    }

    /**
     * indicates if a smooth behavior should be applied
     * @method shouldBailOut
     * @param {Number|Object} x
     * @returns {Boolean}
     */
    function shouldBailOut(x) {
      if (typeof x !== 'object'
            || x === null
            || x.behavior === undefined
            || x.behavior === 'auto'
            || x.behavior === 'instant') {
        // first arg not an object/null
        // or behavior is auto, instant or undefined
        return true;
      }

      if (typeof x === 'object'
            && x.behavior === 'smooth') {
        // first argument is an object and behavior is smooth
        return false;
      }

      // throw error when behavior is not supported
      throw new TypeError('behavior not valid');
    }

    /**
     * finds scrollable parent of an element
     * @method findScrollableParent
     * @param {Node} el
     * @returns {Node} el
     */
    function findScrollableParent(el) {
      var isBody;
      var hasScrollableSpace;
      var hasVisibleOverflow;

      do {
        el = el.parentNode;

        // set condition variables
        isBody = el === d.body;
        hasScrollableSpace =
          el.clientHeight < el.scrollHeight ||
          el.clientWidth < el.scrollWidth;
        hasVisibleOverflow =
          w.getComputedStyle(el, null).overflow === 'visible';
      } while (!isBody && !(hasScrollableSpace && !hasVisibleOverflow));

      isBody = hasScrollableSpace = hasVisibleOverflow = null;

      return el;
    }

    /**
     * self invoked function that, given a context, steps through scrolling
     * @method step
     * @param {Object} context
     */
    function step(context) {
      var time = now();
      var value;
      var currentX;
      var currentY;
      var elapsed = (time - context.startTime) / SCROLL_TIME;

      // avoid elapsed times higher than one
      elapsed = elapsed > 1 ? 1 : elapsed;

      // apply easing to elapsed time
      value = ease(elapsed);

      currentX = context.startX + (context.x - context.startX) * value;
      currentY = context.startY + (context.y - context.startY) * value;

      context.method.call(context.scrollable, currentX, currentY);

      // scroll more if we have not reached our destination
      if (currentX !== context.x || currentY !== context.y) {
        w.requestAnimationFrame(step.bind(w, context));
      }
    }

    /**
     * scrolls window with a smooth behavior
     * @method smoothScroll
     * @param {Object|Node} el
     * @param {Number} x
     * @param {Number} y
     */
    function smoothScroll(el, x, y) {
      var scrollable;
      var startX;
      var startY;
      var method;
      var startTime = now();

      // define scroll context
      if (el === d.body) {
        scrollable = w;
        startX = w.scrollX || w.pageXOffset;
        startY = w.scrollY || w.pageYOffset;
        method = original.scroll;
      } else {
        scrollable = el;
        startX = el.scrollLeft;
        startY = el.scrollTop;
        method = scrollElement;
      }

      // scroll looping over a frame
      step({
        scrollable: scrollable,
        method: method,
        startTime: startTime,
        startX: startX,
        startY: startY,
        x: x,
        y: y
      });
    }

    /*
     * ORIGINAL METHODS OVERRIDES
     */

    // w.scroll and w.scrollTo
    w.scroll = w.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scroll.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left,
        ~~arguments[0].top
      );
    };

    // w.scrollBy
    w.scrollBy = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollBy.call(
          w,
          arguments[0].left || arguments[0],
          arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
        w,
        d.body,
        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
      );
    };

    // Element.prototype.scroll and Element.prototype.scrollTo
    Element.prototype.scroll = Element.prototype.scrollTo = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.elScroll.call(
            this,
            arguments[0].left || arguments[0],
            arguments[0].top || arguments[1]
        );
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      smoothScroll.call(
          this,
          this,
          arguments[0].left,
          arguments[0].top
      );
    };

    // Element.prototype.scrollBy
    Element.prototype.scrollBy = function() {
      var arg0 = arguments[0];

      if (typeof arg0 === 'object') {
        this.scroll({
          left: arg0.left + this.scrollLeft,
          top: arg0.top + this.scrollTop,
          behavior: arg0.behavior
        });
      } else {
        this.scroll(
          this.scrollLeft + arg0,
          this.scrollTop + arguments[1]
        );
      }
    };

    // Element.prototype.scrollIntoView
    Element.prototype.scrollIntoView = function() {
      // avoid smooth behavior if not required
      if (shouldBailOut(arguments[0])) {
        original.scrollIntoView.call(this, arguments[0] || true);
        return;
      }

      // LET THE SMOOTHNESS BEGIN!
      var scrollableParent = findScrollableParent(this);
      var parentRects = scrollableParent.getBoundingClientRect();
      var clientRects = this.getBoundingClientRect();

      if (scrollableParent !== d.body) {
        // reveal element inside parent
        smoothScroll.call(
          this,
          scrollableParent,
          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
          scrollableParent.scrollTop + clientRects.top - parentRects.top
        );
        // reveal parent in viewport
        w.scrollBy({
          left: parentRects.left,
          top: parentRects.top,
          behavior: 'smooth'
        });
      } else {
        // reveal element in viewport
        w.scrollBy({
          left: clientRects.left,
          top: clientRects.top,
          behavior: 'smooth'
        });
      }
    };
  }

  if (typeof exports === 'object') {
    // commonjs
    module.exports = { polyfill: polyfill };
  } else {
    // global
    polyfill();
  }
})(window, document);

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
'use strict';

var _promisePolyfill = require('promise-polyfill');

var _promisePolyfill2 = _interopRequireDefault(_promisePolyfill);

var _smoothscrollPolyfill = require('smoothscroll-polyfill');

var _smoothscrollPolyfill2 = _interopRequireDefault(_smoothscrollPolyfill);

var _dom = require('./dom');

var _utils = require('./utils');

var _nav = require('./nav');

var _nav2 = _interopRequireDefault(_nav);

var _tabs = require('./tabs');

var _tabs2 = _interopRequireDefault(_tabs);

var _slider = require('./slider');

var _slider2 = _interopRequireDefault(_slider);

var _map = require('./map');

var _map2 = _interopRequireDefault(_map);

var _statistic = require('./statistic');

var _statistic2 = _interopRequireDefault(_statistic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!window.Promise) {
  window.Promise = _promisePolyfill2.default;
}

_smoothscrollPolyfill2.default.polyfill();

(0, _dom.$)('.nav').forEach(function (node) {
  return new _nav2.default(node);
});
(0, _dom.$)('.tabs').forEach(function (node) {
  return new _tabs2.default(node);
});
(0, _dom.$)('.slider').forEach(function (node) {
  return new _slider2.default(node);
});

(0, _utils.fetchJSON)('data/stats.json').then(function (data) {
  (0, _dom.$)('.map').forEach(function (node) {
    return new _map2.default(node, data.slice());
  });
  (0, _dom.$)('.declarations').forEach(function (node) {
    return new _statistic2.default(node, data);
  });
});

},{"./dom":3,"./map":5,"./nav":6,"./slider":7,"./statistic":8,"./tabs":9,"./utils":10,"promise-polyfill":1,"smoothscroll-polyfill":2}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = require("./dom");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HOVER_DEBOUNCE_TIMEOUT = 200;

var REGION_POINT_MAP = {
  "Київ": { left: 453, top: 170 },
  "Луцьк": { left: 153, top: 100 },
  "Львов": { left: 83, top: 206 },
  "Ужгород": { left: 48, top: 312 },
  "Ивано-Франковск": { left: 153, top: 312 },
  "Черновцы": { left: 207, top: 329 },
  "Тернополь": { left: 188, top: 241 },
  "Ровно": { left: 241, top: 100 },
  "Хмельницкий": { left: 259, top: 206 },
  "Житомир": { left: 347, top: 153 },
  "Винница": { left: 365, top: 277 },
  "Черкассы": { left: 523, top: 241 },
  "Кировоград": { left: 541, top: 312 },
  "Полтава": { left: 646, top: 188 },
  "Чернигов": { left: 541, top: 65 },
  "Суммы": { left: 646, top: 100 },
  "Харьков": { left: 770, top: 205 },
  "Луганск": { left: 911, top: 259 },
  "Днепропетровск": { left: 682, top: 311 },
  "Донецк": { left: 840, top: 347 },
  "Запорожье": { left: 752, top: 417 },
  "Херсон": { left: 629, top: 452 },
  "Николаев": { left: 523, top: 399 },
  "Одесса": { left: 453, top: 435 },
  "Крым": { left: 664, top: 558 }
};

var createPoint = function createPoint(_ref) {
  var left = _ref.left,
      top = _ref.top;

  var node = document.createElement('div');

  node.classList.add('map__point');
  node.style.left = left + "px";
  node.style.top = top + "px";

  return node;
};

var Map = function (_BEM) {
  _inherits(Map, _BEM);

  function Map(node, data) {
    _classCallCheck(this, Map);

    var _this = _possibleConstructorReturn(this, (Map.__proto__ || Object.getPrototypeOf(Map)).call(this, 'map', node));

    _this.data = [];
    _this.timeout = null;


    _this.data = data;
    _this.$tooltip = _this.elem('tooltip');

    var fragment = document.createDocumentFragment();

    data.forEach(function (item, index) {
      var point = createPoint(REGION_POINT_MAP[item.region_name]);
      point.dataset.index = index;

      point.addEventListener('mouseover', _this, false);
      point.addEventListener('mouseout', _this, false);

      fragment.appendChild(point);
    });

    _this.$tooltip.addEventListener('mouseover', _this, false);
    _this.$tooltip.addEventListener('mouseout', _this, false);

    _this.elem('main').appendChild(fragment);
    return _this;
  }

  _createClass(Map, [{
    key: "handleEvent",
    value: function handleEvent(_ref2) {
      var _this2 = this;

      var target = _ref2.target,
          type = _ref2.type;

      if (type === 'mouseover' && target.dataset.index) {
        this.$tooltip.style.top = target.style.top;
        this.$tooltip.style.left = target.style.left;
      }

      clearTimeout(this.timeout);
      this.timeout = setTimeout(function () {
        switch (type) {
          case 'mouseout':
            _this2.delMod(_this2.$tooltip, 'tooltip', 'show');
            _this2.delMod(_this2.$active, 'point', 'active');
            break;
          case 'mouseover':
            var data = _this2.data[target.dataset.index];

            if (data) {
              var $tooltipData = _this2.$tooltip.querySelectorAll((0, _dom.buildClass)('map', 'tooltip-data') + " dt");

              _this2.$tooltip.style.top = target.style.top;
              _this2.$tooltip.style.left = target.style.left;

              _this2.$active && _this2.delMod(_this2.$active, 'point', 'active');
              _this2.setMod(_this2.$tooltip, 'tooltip', 'show');

              _this2.$tooltip.querySelector((0, _dom.buildClass)('map', 'tooltip-title')).textContent = data.region_name;
              _this2.$active = target;

              $tooltipData[0].textContent = data.medical_system_providers;
              $tooltipData[1].textContent = data.doctors;
              $tooltipData[2].textContent = data.declarations_signed;

              _this2.setMod(_this2.$active, 'point', 'active');
            }

            _this2.setMod(_this2.$tooltip, 'tooltip', 'show');
            break;
        }
      }, HOVER_DEBOUNCE_TIMEOUT);
    }
  }]);

  return Map;
}(_dom.BEM);

exports.default = Map;
module.exports = exports["default"];

},{"./dom":3}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Nav = function Nav(node) {
  _classCallCheck(this, Nav);

  node.addEventListener('click', function (e) {
    e.preventDefault();

    if (e.target.href === undefined) {
      return;
    }

    var to = e.target.href.split('#')[1];

    var _document$getElementB = document.getElementById(to).getBoundingClientRect(),
        top = _document$getElementB.top;

    window.scroll({ top: top + window.scrollY - 50, left: 0, behavior: 'smooth' });
  });
};

exports.default = Nav;
module.exports = exports['default'];

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = require('./dom');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var createMarker = function createMarker() {
  var active = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var node = document.createElement('li');

  node.classList.add((0, _dom.selector)('slider', 'marker'));
  active && node.classList.add((0, _dom.selector)('slider', 'marker', 'active'));

  return node;
};

var Slider = function (_BEM) {
  _inherits(Slider, _BEM);

  function Slider(node) {
    _classCallCheck(this, Slider);

    var _this = _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).call(this, 'slider', node));

    _this.currentIndex = 0;

    _this.$slides = _this.elems('slide');

    _this.$markers = [];

    _this.$control = document.createElement('ul');
    _this.$control.classList.add((0, _dom.selector)(_this.name, 'markers'));

    _this.$slides.forEach(function (node, index) {
      var marker = createMarker(index === _this.currentIndex);
      _this.$control.appendChild(marker);
      _this.$markers.push(marker);
    });

    _this.$control.addEventListener('click', function (_ref) {
      var target = _ref.target;

      if (!target.closest((0, _dom.buildClass)(_this.name, 'marker'))) {
        return;
      }

      var toIndex = _this.getIndexByElem(target);

      if (toIndex === _this.currentIndex) {
        return;
      }

      _this.delMod(_this.elem('marker', 'active'), 'marker', 'active');
      _this.setMod(target, 'marker', 'active');

      _this.slide(toIndex);
    }, false);

    _this.node.appendChild(_this.$control);
    return _this;
  }

  _createClass(Slider, [{
    key: 'slide',
    value: function slide(index) {
      var isNext = this.currentIndex < index;

      this.$slides[this.currentIndex].animate([{ transform: 'translateX(0)' }, { transform: 'translateX(' + (isNext ? '-' : '') + '100%)' }], this.constructor.ANIMATION_OPTIONS);

      this.$slides[index].animate([{ transform: 'translateX(' + (isNext ? '' : '-') + '100%)' }, { transform: 'translateX(0)' }], this.constructor.ANIMATION_OPTIONS);

      this.currentIndex = index;
    }
  }, {
    key: 'getIndexByElem',
    value: function getIndexByElem(elem) {
      var index = -1;

      this.$markers.some(function (node, i) {
        if (node === elem) {
          index = i;
          return true;
        }
      });

      return index;
    }
  }]);

  return Slider;
}(_dom.BEM);

Slider.ANIMATION_OPTIONS = {
  duration: 300,
  fill: 'forwards',
  easing: 'ease-in-out'
};
exports.default = Slider;
module.exports = exports['default'];

},{"./dom":3}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dom = require('./dom');

var _utils = require('./utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var COLORS_MAP = ['#90c8e6', '#b097c6', '#dfb0d0', '#e3aab8', '#afd5e7', '#c7b2d5', '#e9c7df', '#ecc7cf', '#f1eec9', '#ced8e2', '#5da892', '#5296cd', '#a3d7f2', '#f3f1a0', '#bcdad5', '#71b7a8', '#5ca9dc', '#dc91a3', '#d8816f', '#e2a394', '#7566aa', '#cadfeb', '#ddd2df', '#f4d9b5', '#d381b2'];

var createListItemNode = function createListItemNode(title, value, color) {
  var $li = document.createElement('li');
  var $span = document.createElement('span');
  var $value = document.createElement('div');

  $li.classList.add((0, _dom.selector)('declarations', 'list-item'));
  $li.textContent = title;

  $span.style.backgroundColor = color;

  $value.classList.add((0, _dom.selector)('declarations', 'list-item-value'));
  $value.textContent = (0, _utils.numberFormatting)(value);

  $li.prepend($span);
  $li.append($value);

  return $li;
};

var Statistic = function (_BEM) {
  _inherits(Statistic, _BEM);

  function Statistic(node, data) {
    _classCallCheck(this, Statistic);

    var _this = _possibleConstructorReturn(this, (Statistic.__proto__ || Object.getPrototypeOf(Statistic)).call(this, 'declarations', node));

    var fragment = document.createDocumentFragment();

    _this.$canvas = _this.elem('graph-canvas');
    _this.context = _this.$canvas.getContext('2d');

    var total = data.reduce(function (target, _ref) {
      var declarations = _ref.declarations;
      return target + declarations;
    }, 0);

    data.sort(function (a, b) {
      return a.declarations < b.declarations ? 1 : -1;
    });

    var x = 490,
        y = 490,
        r = 480,
        s = 0;


    data.forEach(function (item, index) {
      var $item = createListItemNode(item.region_name, item.declarations, COLORS_MAP[index]);

      fragment.appendChild($item);

      var radians = item.declarations / data[0].declarations * 360 * (Math.PI / 360);

      _this.context.beginPath();
      _this.context.lineWidth = 6;
      _this.context.strokeStyle = COLORS_MAP[index];
      _this.context.arc(x, y, r - 20 * index, s, radians, false);
      _this.context.stroke();
    });

    _this.elem('list').appendChild(fragment);
    _this.elem('total-value').textContent = (0, _utils.numberFormatting)(total);
    return _this;
  }

  return Statistic;
}(_dom.BEM);

exports.default = Statistic;
module.exports = exports['default'];

},{"./dom":3,"./utils":10}],9:[function(require,module,exports){
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
    _classCallCheck(this, Tabs);

    var _this = _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).call(this, 'tabs', node));

    _this.$controls = _this.elems('nav-item');
    _this.$slides = _this.elems('slide');

    _this.$marker = document.createElement('div');
    _this.$marker.classList.add((0, _dom.selector)(_this.name, 'marker'));
    _this.elem('header').appendChild(_this.$marker);

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

},{"./dom":3}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var objectToQuery = function objectToQuery(target) {
  return '?' + Object.keys(target).reduce(function (arr, key) {
    return arr.push(key + '=' + target[key]) && arr;
  }, []).join('&');
};

var numberFormatting = exports.numberFormatting = function numberFormatting(number) {
  return number.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1 ').split('.')[0];
};

var fetchJSON = exports.fetchJSON = function fetchJSON(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { method: 'GET' };
  return new Promise(function (resolve, reject) {
    var request = new XMLHttpRequest();

    if (options.body && options.method === 'GET') {
      url += objectToQuery(options.body);
    }

    request.onreadystatechange = function () {
      if (request.readyState !== 4) {
        return;
      }

      resolve(JSON.parse(request.responseText));
    };

    request.onerror = reject;
    request.open(options.method || 'GET', url);
    request.send(options.body ? JSON.stringify(options.body) : null);
  });
};

},{}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcHJvbWlzZS1wb2x5ZmlsbC9wcm9taXNlLmpzIiwibm9kZV9tb2R1bGVzL3Ntb290aHNjcm9sbC1wb2x5ZmlsbC9kaXN0L3Ntb290aHNjcm9sbC5qcyIsInNyYy9zY3JpcHRzL2RvbS5qcyIsInNyYy9zY3JpcHRzL21haW4uanMiLCJzcmMvc2NyaXB0cy9tYXAuanMiLCJzcmMvc2NyaXB0cy9uYXYuanMiLCJzcmMvc2NyaXB0cy9zbGlkZXIuanMiLCJzcmMvc2NyaXB0cy9zdGF0aXN0aWMuanMiLCJzcmMvc2NyaXB0cy90YWJzLmpzIiwic3JjL3NjcmlwdHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDRDs7QUFFRCxjQUFRLEtBQUssS0FBTCxDQUFXLFFBQVEsWUFBbkIsQ0FBUjtBQUNELEtBTkQ7O0FBUUEsWUFBUSxPQUFSLEdBQWtCLE1BQWxCO0FBQ0EsWUFBUSxJQUFSLENBQWEsUUFBUSxNQUFSLElBQWtCLEtBQS9CLEVBQXNDLEdBQXRDO0FBQ0EsWUFBUSxJQUFSLENBQWEsUUFBUSxJQUFSLEdBQWUsS0FBSyxTQUFMLENBQWUsUUFBUSxJQUF2QixDQUFmLEdBQThDLElBQTNEO0FBQ0QsR0FsQjhELENBQXRDO0FBQUEsQ0FBbEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChyb290KSB7XG5cbiAgLy8gU3RvcmUgc2V0VGltZW91dCByZWZlcmVuY2Ugc28gcHJvbWlzZS1wb2x5ZmlsbCB3aWxsIGJlIHVuYWZmZWN0ZWQgYnlcbiAgLy8gb3RoZXIgY29kZSBtb2RpZnlpbmcgc2V0VGltZW91dCAobGlrZSBzaW5vbi51c2VGYWtlVGltZXJzKCkpXG4gIHZhciBzZXRUaW1lb3V0RnVuYyA9IHNldFRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gIFxuICAvLyBQb2x5ZmlsbCBmb3IgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmRcbiAgZnVuY3Rpb24gYmluZChmbiwgdGhpc0FyZykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBmbi5hcHBseSh0aGlzQXJnLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBQcm9taXNlKGZuKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3Jyk7XG4gICAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKTtcbiAgICB0aGlzLl9zdGF0ZSA9IDA7XG4gICAgdGhpcy5faGFuZGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3ZhbHVlID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuX2RlZmVycmVkcyA9IFtdO1xuXG4gICAgZG9SZXNvbHZlKGZuLCB0aGlzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZShzZWxmLCBkZWZlcnJlZCkge1xuICAgIHdoaWxlIChzZWxmLl9zdGF0ZSA9PT0gMykge1xuICAgICAgc2VsZiA9IHNlbGYuX3ZhbHVlO1xuICAgIH1cbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDApIHtcbiAgICAgIHNlbGYuX2RlZmVycmVkcy5wdXNoKGRlZmVycmVkKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2VsZi5faGFuZGxlZCA9IHRydWU7XG4gICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNiID0gc2VsZi5fc3RhdGUgPT09IDEgPyBkZWZlcnJlZC5vbkZ1bGZpbGxlZCA6IGRlZmVycmVkLm9uUmVqZWN0ZWQ7XG4gICAgICBpZiAoY2IgPT09IG51bGwpIHtcbiAgICAgICAgKHNlbGYuX3N0YXRlID09PSAxID8gcmVzb2x2ZSA6IHJlamVjdCkoZGVmZXJyZWQucHJvbWlzZSwgc2VsZi5fdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgcmV0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0ID0gY2Ioc2VsZi5fdmFsdWUpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZWplY3QoZGVmZXJyZWQucHJvbWlzZSwgZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJlc29sdmUoZGVmZXJyZWQucHJvbWlzZSwgcmV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUoc2VsZiwgbmV3VmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgLy8gUHJvbWlzZSBSZXNvbHV0aW9uIFByb2NlZHVyZTogaHR0cHM6Ly9naXRodWIuY29tL3Byb21pc2VzLWFwbHVzL3Byb21pc2VzLXNwZWMjdGhlLXByb21pc2UtcmVzb2x1dGlvbi1wcm9jZWR1cmVcbiAgICAgIGlmIChuZXdWYWx1ZSA9PT0gc2VsZikgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBwcm9taXNlIGNhbm5vdCBiZSByZXNvbHZlZCB3aXRoIGl0c2VsZi4nKTtcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlbjtcbiAgICAgICAgaWYgKG5ld1ZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICAgIHNlbGYuX3N0YXRlID0gMztcbiAgICAgICAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICAgIGZpbmFsZShzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkb1Jlc29sdmUoYmluZCh0aGVuLCBuZXdWYWx1ZSksIHNlbGYpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2VsZi5fc3RhdGUgPSAxO1xuICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgIGZpbmFsZShzZWxmKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZWplY3Qoc2VsZiwgZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0KHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgc2VsZi5fc3RhdGUgPSAyO1xuICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgZmluYWxlKHNlbGYpO1xuICB9XG5cbiAgZnVuY3Rpb24gZmluYWxlKHNlbGYpIHtcbiAgICBpZiAoc2VsZi5fc3RhdGUgPT09IDIgJiYgc2VsZi5fZGVmZXJyZWRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgUHJvbWlzZS5faW1tZWRpYXRlRm4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghc2VsZi5faGFuZGxlZCkge1xuICAgICAgICAgIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuKHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNlbGYuX2RlZmVycmVkcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaGFuZGxlKHNlbGYsIHNlbGYuX2RlZmVycmVkc1tpXSk7XG4gICAgfVxuICAgIHNlbGYuX2RlZmVycmVkcyA9IG51bGw7XG4gIH1cblxuICBmdW5jdGlvbiBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9taXNlKSB7XG4gICAgdGhpcy5vbkZ1bGZpbGxlZCA9IHR5cGVvZiBvbkZ1bGZpbGxlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogbnVsbDtcbiAgICB0aGlzLm9uUmVqZWN0ZWQgPSB0eXBlb2Ygb25SZWplY3RlZCA9PT0gJ2Z1bmN0aW9uJyA/IG9uUmVqZWN0ZWQgOiBudWxsO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAgICogb25GdWxmaWxsZWQgYW5kIG9uUmVqZWN0ZWQgYXJlIG9ubHkgY2FsbGVkIG9uY2UuXG4gICAqXG4gICAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAgICovXG4gIGZ1bmN0aW9uIGRvUmVzb2x2ZShmbiwgc2VsZikge1xuICAgIHZhciBkb25lID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVzb2x2ZShzZWxmLCB2YWx1ZSk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIGlmIChkb25lKSByZXR1cm47XG4gICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICByZWplY3Qoc2VsZiwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgZG9uZSA9IHRydWU7XG4gICAgICByZWplY3Qoc2VsZiwgZXgpO1xuICAgIH1cbiAgfVxuXG4gIFByb21pc2UucHJvdG90eXBlWydjYXRjaCddID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xuICB9O1xuXG4gIFByb21pc2UucHJvdG90eXBlLnRoZW4gPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICB2YXIgcHJvbSA9IG5ldyAodGhpcy5jb25zdHJ1Y3Rvcikobm9vcCk7XG5cbiAgICBoYW5kbGUodGhpcywgbmV3IEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHByb20pKTtcbiAgICByZXR1cm4gcHJvbTtcbiAgfTtcblxuICBQcm9taXNlLmFsbCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFycik7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSk7XG4gICAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIHJlcyhpLCB2YWwpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgICAgdmFyIHRoZW4gPSB2YWwudGhlbjtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICB0aGVuLmNhbGwodmFsLCBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgICAgICAgICAgcmVzKGksIHZhbCk7XG4gICAgICAgICAgICAgIH0sIHJlamVjdCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYXJnc1tpXSA9IHZhbDtcbiAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgICAgIHJlc29sdmUoYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJlcyhpLCBhcmdzW2ldKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gUHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVqZWN0KHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICBQcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB2YWx1ZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgdmFsdWVzW2ldLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAvLyBVc2UgcG9seWZpbGwgZm9yIHNldEltbWVkaWF0ZSBmb3IgcGVyZm9ybWFuY2UgZ2FpbnNcbiAgUHJvbWlzZS5faW1tZWRpYXRlRm4gPSAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBmdW5jdGlvbiAoZm4pIHsgc2V0SW1tZWRpYXRlKGZuKTsgfSkgfHxcbiAgICBmdW5jdGlvbiAoZm4pIHtcbiAgICAgIHNldFRpbWVvdXRGdW5jKGZuLCAwKTtcbiAgICB9O1xuXG4gIFByb21pc2UuX3VuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3VuaGFuZGxlZFJlamVjdGlvbkZuKGVycikge1xuICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgY29uc29sZSkge1xuICAgICAgY29uc29sZS53YXJuKCdQb3NzaWJsZSBVbmhhbmRsZWQgUHJvbWlzZSBSZWplY3Rpb246JywgZXJyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGltbWVkaWF0ZSBmdW5jdGlvbiB0byBleGVjdXRlIGNhbGxiYWNrc1xuICAgKiBAcGFyYW0gZm4ge2Z1bmN0aW9ufSBGdW5jdGlvbiB0byBleGVjdXRlXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBQcm9taXNlLl9zZXRJbW1lZGlhdGVGbiA9IGZ1bmN0aW9uIF9zZXRJbW1lZGlhdGVGbihmbikge1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gZm47XG4gIH07XG5cbiAgLyoqXG4gICAqIENoYW5nZSB0aGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBvbiB1bmhhbmRsZWQgcmVqZWN0aW9uXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGZuIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmdW5jdGlvbiBfc2V0VW5oYW5kbGVkUmVqZWN0aW9uRm4oZm4pIHtcbiAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZuO1xuICB9O1xuICBcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuICB9IGVsc2UgaWYgKCFyb290LlByb21pc2UpIHtcbiAgICByb290LlByb21pc2UgPSBQcm9taXNlO1xuICB9XG5cbn0pKHRoaXMpO1xuIiwiLypcbiAqIHNtb290aHNjcm9sbCBwb2x5ZmlsbCAtIHYwLjMuNVxuICogaHR0cHM6Ly9pYW1kdXN0YW4uZ2l0aHViLmlvL3Ntb290aHNjcm9sbFxuICogMjAxNiAoYykgRHVzdGFuIEthc3RlbiwgSmVyZW1pYXMgTWVuaWNoZWxsaSAtIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKHcsIGQsIHVuZGVmaW5lZCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLypcbiAgICogYWxpYXNlc1xuICAgKiB3OiB3aW5kb3cgZ2xvYmFsIG9iamVjdFxuICAgKiBkOiBkb2N1bWVudFxuICAgKiB1bmRlZmluZWQ6IHVuZGVmaW5lZFxuICAgKi9cblxuICAvLyBwb2x5ZmlsbFxuICBmdW5jdGlvbiBwb2x5ZmlsbCgpIHtcbiAgICAvLyByZXR1cm4gd2hlbiBzY3JvbGxCZWhhdmlvciBpbnRlcmZhY2UgaXMgc3VwcG9ydGVkXG4gICAgaWYgKCdzY3JvbGxCZWhhdmlvcicgaW4gZC5kb2N1bWVudEVsZW1lbnQuc3R5bGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIGdsb2JhbHNcbiAgICAgKi9cbiAgICB2YXIgRWxlbWVudCA9IHcuSFRNTEVsZW1lbnQgfHwgdy5FbGVtZW50O1xuICAgIHZhciBTQ1JPTExfVElNRSA9IDQ2ODtcblxuICAgIC8qXG4gICAgICogb2JqZWN0IGdhdGhlcmluZyBvcmlnaW5hbCBzY3JvbGwgbWV0aG9kc1xuICAgICAqL1xuICAgIHZhciBvcmlnaW5hbCA9IHtcbiAgICAgIHNjcm9sbDogdy5zY3JvbGwgfHwgdy5zY3JvbGxUbyxcbiAgICAgIHNjcm9sbEJ5OiB3LnNjcm9sbEJ5LFxuICAgICAgZWxTY3JvbGw6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCB8fCBzY3JvbGxFbGVtZW50LFxuICAgICAgc2Nyb2xsSW50b1ZpZXc6IEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3XG4gICAgfTtcblxuICAgIC8qXG4gICAgICogZGVmaW5lIHRpbWluZyBtZXRob2RcbiAgICAgKi9cbiAgICB2YXIgbm93ID0gdy5wZXJmb3JtYW5jZSAmJiB3LnBlcmZvcm1hbmNlLm5vd1xuICAgICAgPyB3LnBlcmZvcm1hbmNlLm5vdy5iaW5kKHcucGVyZm9ybWFuY2UpIDogRGF0ZS5ub3c7XG5cbiAgICAvKipcbiAgICAgKiBjaGFuZ2VzIHNjcm9sbCBwb3NpdGlvbiBpbnNpZGUgYW4gZWxlbWVudFxuICAgICAqIEBtZXRob2Qgc2Nyb2xsRWxlbWVudFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzY3JvbGxFbGVtZW50KHgsIHkpIHtcbiAgICAgIHRoaXMuc2Nyb2xsTGVmdCA9IHg7XG4gICAgICB0aGlzLnNjcm9sbFRvcCA9IHk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyByZXN1bHQgb2YgYXBwbHlpbmcgZWFzZSBtYXRoIGZ1bmN0aW9uIHRvIGEgbnVtYmVyXG4gICAgICogQG1ldGhvZCBlYXNlXG4gICAgICogQHBhcmFtIHtOdW1iZXJ9IGtcbiAgICAgKiBAcmV0dXJucyB7TnVtYmVyfVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGVhc2Uoaykge1xuICAgICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoTWF0aC5QSSAqIGspKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbmRpY2F0ZXMgaWYgYSBzbW9vdGggYmVoYXZpb3Igc2hvdWxkIGJlIGFwcGxpZWRcbiAgICAgKiBAbWV0aG9kIHNob3VsZEJhaWxPdXRcbiAgICAgKiBAcGFyYW0ge051bWJlcnxPYmplY3R9IHhcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzaG91bGRCYWlsT3V0KHgpIHtcbiAgICAgIGlmICh0eXBlb2YgeCAhPT0gJ29iamVjdCdcbiAgICAgICAgICAgIHx8IHggPT09IG51bGxcbiAgICAgICAgICAgIHx8IHguYmVoYXZpb3IgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgfHwgeC5iZWhhdmlvciA9PT0gJ2F1dG8nXG4gICAgICAgICAgICB8fCB4LmJlaGF2aW9yID09PSAnaW5zdGFudCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJnIG5vdCBhbiBvYmplY3QvbnVsbFxuICAgICAgICAvLyBvciBiZWhhdmlvciBpcyBhdXRvLCBpbnN0YW50IG9yIHVuZGVmaW5lZFxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB4ID09PSAnb2JqZWN0J1xuICAgICAgICAgICAgJiYgeC5iZWhhdmlvciA9PT0gJ3Ntb290aCcpIHtcbiAgICAgICAgLy8gZmlyc3QgYXJndW1lbnQgaXMgYW4gb2JqZWN0IGFuZCBiZWhhdmlvciBpcyBzbW9vdGhcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyB0aHJvdyBlcnJvciB3aGVuIGJlaGF2aW9yIGlzIG5vdCBzdXBwb3J0ZWRcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2JlaGF2aW9yIG5vdCB2YWxpZCcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGZpbmRzIHNjcm9sbGFibGUgcGFyZW50IG9mIGFuIGVsZW1lbnRcbiAgICAgKiBAbWV0aG9kIGZpbmRTY3JvbGxhYmxlUGFyZW50XG4gICAgICogQHBhcmFtIHtOb2RlfSBlbFxuICAgICAqIEByZXR1cm5zIHtOb2RlfSBlbFxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbmRTY3JvbGxhYmxlUGFyZW50KGVsKSB7XG4gICAgICB2YXIgaXNCb2R5O1xuICAgICAgdmFyIGhhc1Njcm9sbGFibGVTcGFjZTtcbiAgICAgIHZhciBoYXNWaXNpYmxlT3ZlcmZsb3c7XG5cbiAgICAgIGRvIHtcbiAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlO1xuXG4gICAgICAgIC8vIHNldCBjb25kaXRpb24gdmFyaWFibGVzXG4gICAgICAgIGlzQm9keSA9IGVsID09PSBkLmJvZHk7XG4gICAgICAgIGhhc1Njcm9sbGFibGVTcGFjZSA9XG4gICAgICAgICAgZWwuY2xpZW50SGVpZ2h0IDwgZWwuc2Nyb2xsSGVpZ2h0IHx8XG4gICAgICAgICAgZWwuY2xpZW50V2lkdGggPCBlbC5zY3JvbGxXaWR0aDtcbiAgICAgICAgaGFzVmlzaWJsZU92ZXJmbG93ID1cbiAgICAgICAgICB3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLm92ZXJmbG93ID09PSAndmlzaWJsZSc7XG4gICAgICB9IHdoaWxlICghaXNCb2R5ICYmICEoaGFzU2Nyb2xsYWJsZVNwYWNlICYmICFoYXNWaXNpYmxlT3ZlcmZsb3cpKTtcblxuICAgICAgaXNCb2R5ID0gaGFzU2Nyb2xsYWJsZVNwYWNlID0gaGFzVmlzaWJsZU92ZXJmbG93ID0gbnVsbDtcblxuICAgICAgcmV0dXJuIGVsO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNlbGYgaW52b2tlZCBmdW5jdGlvbiB0aGF0LCBnaXZlbiBhIGNvbnRleHQsIHN0ZXBzIHRocm91Z2ggc2Nyb2xsaW5nXG4gICAgICogQG1ldGhvZCBzdGVwXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBzdGVwKGNvbnRleHQpIHtcbiAgICAgIHZhciB0aW1lID0gbm93KCk7XG4gICAgICB2YXIgdmFsdWU7XG4gICAgICB2YXIgY3VycmVudFg7XG4gICAgICB2YXIgY3VycmVudFk7XG4gICAgICB2YXIgZWxhcHNlZCA9ICh0aW1lIC0gY29udGV4dC5zdGFydFRpbWUpIC8gU0NST0xMX1RJTUU7XG5cbiAgICAgIC8vIGF2b2lkIGVsYXBzZWQgdGltZXMgaGlnaGVyIHRoYW4gb25lXG4gICAgICBlbGFwc2VkID0gZWxhcHNlZCA+IDEgPyAxIDogZWxhcHNlZDtcblxuICAgICAgLy8gYXBwbHkgZWFzaW5nIHRvIGVsYXBzZWQgdGltZVxuICAgICAgdmFsdWUgPSBlYXNlKGVsYXBzZWQpO1xuXG4gICAgICBjdXJyZW50WCA9IGNvbnRleHQuc3RhcnRYICsgKGNvbnRleHQueCAtIGNvbnRleHQuc3RhcnRYKSAqIHZhbHVlO1xuICAgICAgY3VycmVudFkgPSBjb250ZXh0LnN0YXJ0WSArIChjb250ZXh0LnkgLSBjb250ZXh0LnN0YXJ0WSkgKiB2YWx1ZTtcblxuICAgICAgY29udGV4dC5tZXRob2QuY2FsbChjb250ZXh0LnNjcm9sbGFibGUsIGN1cnJlbnRYLCBjdXJyZW50WSk7XG5cbiAgICAgIC8vIHNjcm9sbCBtb3JlIGlmIHdlIGhhdmUgbm90IHJlYWNoZWQgb3VyIGRlc3RpbmF0aW9uXG4gICAgICBpZiAoY3VycmVudFggIT09IGNvbnRleHQueCB8fCBjdXJyZW50WSAhPT0gY29udGV4dC55KSB7XG4gICAgICAgIHcucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXAuYmluZCh3LCBjb250ZXh0KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2Nyb2xscyB3aW5kb3cgd2l0aCBhIHNtb290aCBiZWhhdmlvclxuICAgICAqIEBtZXRob2Qgc21vb3RoU2Nyb2xsXG4gICAgICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gZWxcbiAgICAgKiBAcGFyYW0ge051bWJlcn0geFxuICAgICAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gICAgICovXG4gICAgZnVuY3Rpb24gc21vb3RoU2Nyb2xsKGVsLCB4LCB5KSB7XG4gICAgICB2YXIgc2Nyb2xsYWJsZTtcbiAgICAgIHZhciBzdGFydFg7XG4gICAgICB2YXIgc3RhcnRZO1xuICAgICAgdmFyIG1ldGhvZDtcbiAgICAgIHZhciBzdGFydFRpbWUgPSBub3coKTtcblxuICAgICAgLy8gZGVmaW5lIHNjcm9sbCBjb250ZXh0XG4gICAgICBpZiAoZWwgPT09IGQuYm9keSkge1xuICAgICAgICBzY3JvbGxhYmxlID0gdztcbiAgICAgICAgc3RhcnRYID0gdy5zY3JvbGxYIHx8IHcucGFnZVhPZmZzZXQ7XG4gICAgICAgIHN0YXJ0WSA9IHcuc2Nyb2xsWSB8fCB3LnBhZ2VZT2Zmc2V0O1xuICAgICAgICBtZXRob2QgPSBvcmlnaW5hbC5zY3JvbGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzY3JvbGxhYmxlID0gZWw7XG4gICAgICAgIHN0YXJ0WCA9IGVsLnNjcm9sbExlZnQ7XG4gICAgICAgIHN0YXJ0WSA9IGVsLnNjcm9sbFRvcDtcbiAgICAgICAgbWV0aG9kID0gc2Nyb2xsRWxlbWVudDtcbiAgICAgIH1cblxuICAgICAgLy8gc2Nyb2xsIGxvb3Bpbmcgb3ZlciBhIGZyYW1lXG4gICAgICBzdGVwKHtcbiAgICAgICAgc2Nyb2xsYWJsZTogc2Nyb2xsYWJsZSxcbiAgICAgICAgbWV0aG9kOiBtZXRob2QsXG4gICAgICAgIHN0YXJ0VGltZTogc3RhcnRUaW1lLFxuICAgICAgICBzdGFydFg6IHN0YXJ0WCxcbiAgICAgICAgc3RhcnRZOiBzdGFydFksXG4gICAgICAgIHg6IHgsXG4gICAgICAgIHk6IHlcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogT1JJR0lOQUwgTUVUSE9EUyBPVkVSUklERVNcbiAgICAgKi9cblxuICAgIC8vIHcuc2Nyb2xsIGFuZCB3LnNjcm9sbFRvXG4gICAgdy5zY3JvbGwgPSB3LnNjcm9sbFRvID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbC5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0udG9wXG4gICAgICApO1xuICAgIH07XG5cbiAgICAvLyB3LnNjcm9sbEJ5XG4gICAgdy5zY3JvbGxCeSA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5zY3JvbGxCeS5jYWxsKFxuICAgICAgICAgIHcsXG4gICAgICAgICAgYXJndW1lbnRzWzBdLmxlZnQgfHwgYXJndW1lbnRzWzBdLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgIHcsXG4gICAgICAgIGQuYm9keSxcbiAgICAgICAgfn5hcmd1bWVudHNbMF0ubGVmdCArICh3LnNjcm9sbFggfHwgdy5wYWdlWE9mZnNldCksXG4gICAgICAgIH5+YXJndW1lbnRzWzBdLnRvcCArICh3LnNjcm9sbFkgfHwgdy5wYWdlWU9mZnNldClcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbCBhbmQgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsVG9cbiAgICBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGwgPSBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxUbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgc21vb3RoIGJlaGF2aW9yIGlmIG5vdCByZXF1aXJlZFxuICAgICAgaWYgKHNob3VsZEJhaWxPdXQoYXJndW1lbnRzWzBdKSkge1xuICAgICAgICBvcmlnaW5hbC5lbFNjcm9sbC5jYWxsKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0IHx8IGFyZ3VtZW50c1swXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1swXS50b3AgfHwgYXJndW1lbnRzWzFdXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTEVUIFRIRSBTTU9PVEhORVNTIEJFR0lOIVxuICAgICAgc21vb3RoU2Nyb2xsLmNhbGwoXG4gICAgICAgICAgdGhpcyxcbiAgICAgICAgICB0aGlzLFxuICAgICAgICAgIGFyZ3VtZW50c1swXS5sZWZ0LFxuICAgICAgICAgIGFyZ3VtZW50c1swXS50b3BcbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8vIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEJ5XG4gICAgRWxlbWVudC5wcm90b3R5cGUuc2Nyb2xsQnkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmcwID0gYXJndW1lbnRzWzBdO1xuXG4gICAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsKHtcbiAgICAgICAgICBsZWZ0OiBhcmcwLmxlZnQgKyB0aGlzLnNjcm9sbExlZnQsXG4gICAgICAgICAgdG9wOiBhcmcwLnRvcCArIHRoaXMuc2Nyb2xsVG9wLFxuICAgICAgICAgIGJlaGF2aW9yOiBhcmcwLmJlaGF2aW9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zY3JvbGwoXG4gICAgICAgICAgdGhpcy5zY3JvbGxMZWZ0ICsgYXJnMCxcbiAgICAgICAgICB0aGlzLnNjcm9sbFRvcCArIGFyZ3VtZW50c1sxXVxuICAgICAgICApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBFbGVtZW50LnByb3RvdHlwZS5zY3JvbGxJbnRvVmlld1xuICAgIEVsZW1lbnQucHJvdG90eXBlLnNjcm9sbEludG9WaWV3ID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBhdm9pZCBzbW9vdGggYmVoYXZpb3IgaWYgbm90IHJlcXVpcmVkXG4gICAgICBpZiAoc2hvdWxkQmFpbE91dChhcmd1bWVudHNbMF0pKSB7XG4gICAgICAgIG9yaWdpbmFsLnNjcm9sbEludG9WaWV3LmNhbGwodGhpcywgYXJndW1lbnRzWzBdIHx8IHRydWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIExFVCBUSEUgU01PT1RITkVTUyBCRUdJTiFcbiAgICAgIHZhciBzY3JvbGxhYmxlUGFyZW50ID0gZmluZFNjcm9sbGFibGVQYXJlbnQodGhpcyk7XG4gICAgICB2YXIgcGFyZW50UmVjdHMgPSBzY3JvbGxhYmxlUGFyZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgdmFyIGNsaWVudFJlY3RzID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgaWYgKHNjcm9sbGFibGVQYXJlbnQgIT09IGQuYm9keSkge1xuICAgICAgICAvLyByZXZlYWwgZWxlbWVudCBpbnNpZGUgcGFyZW50XG4gICAgICAgIHNtb290aFNjcm9sbC5jYWxsKFxuICAgICAgICAgIHRoaXMsXG4gICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbExlZnQgKyBjbGllbnRSZWN0cy5sZWZ0IC0gcGFyZW50UmVjdHMubGVmdCxcbiAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50LnNjcm9sbFRvcCArIGNsaWVudFJlY3RzLnRvcCAtIHBhcmVudFJlY3RzLnRvcFxuICAgICAgICApO1xuICAgICAgICAvLyByZXZlYWwgcGFyZW50IGluIHZpZXdwb3J0XG4gICAgICAgIHcuc2Nyb2xsQnkoe1xuICAgICAgICAgIGxlZnQ6IHBhcmVudFJlY3RzLmxlZnQsXG4gICAgICAgICAgdG9wOiBwYXJlbnRSZWN0cy50b3AsXG4gICAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gcmV2ZWFsIGVsZW1lbnQgaW4gdmlld3BvcnRcbiAgICAgICAgdy5zY3JvbGxCeSh7XG4gICAgICAgICAgbGVmdDogY2xpZW50UmVjdHMubGVmdCxcbiAgICAgICAgICB0b3A6IGNsaWVudFJlY3RzLnRvcCxcbiAgICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCdcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBjb21tb25qc1xuICAgIG1vZHVsZS5leHBvcnRzID0geyBwb2x5ZmlsbDogcG9seWZpbGwgfTtcbiAgfSBlbHNlIHtcbiAgICAvLyBnbG9iYWxcbiAgICBwb2x5ZmlsbCgpO1xuICB9XG59KSh3aW5kb3csIGRvY3VtZW50KTtcbiIsImV4cG9ydCBjb25zdCB0b0FycmF5ID0gYXJyYXlMaWtlID0+IHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyYXlMaWtlKSkge1xuICAgIHJldHVybiBhcnJheUxpa2U7XG4gIH1cblxuICBpZiAoYXJyYXlMaWtlIGluc3RhbmNlb2YgTm9kZSkge1xuICAgIHJldHVybiBbYXJyYXlMaWtlXTtcbiAgfVxuXG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnJheUxpa2UpO1xufTtcblxuZXhwb3J0IGNvbnN0ICQgPSAoc2VsZWN0b3IsIGNvbnRleHQgPSBkb2N1bWVudCkgPT4gKFxuICB0b0FycmF5KGNvbnRleHQucXVlcnlTZWxlY3RvckFsbC5jYWxsKGNvbnRleHQsIHNlbGVjdG9yKSlcbik7XG5cbmV4cG9ydCBjb25zdCBzZWxlY3RvciA9IChibG9jaywgZWxlbSwgbW9kTmFtZSwgbW9kVmFsKSA9PiAoXG4gIGAke2Jsb2NrfV9fJHtlbGVtfSR7bW9kTmFtZSA/IChtb2RWYWwgPyBgXyR7bW9kTmFtZX1fJHttb2RWYWx9YCA6IGBfJHttb2ROYW1lfWApIDogJyd9YFxuKTtcblxuZXhwb3J0IGNvbnN0IGJ1aWxkQ2xhc3MgPSAoLi4uYXJncykgPT4gYC4ke3NlbGVjdG9yKC4uLmFyZ3MpfWA7XG5cbmV4cG9ydCBjbGFzcyBCRU0gZXh0ZW5kcyBudWxsIHtcbiAgY29uc3RydWN0b3IobmFtZSwgbm9kZSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICB9XG5cbiAgZWxlbShuYW1lLCBtb2ROYW1lLCBtb2RWYWwpIHtcbiAgICByZXR1cm4gdGhpcy5ub2RlLnF1ZXJ5U2VsZWN0b3IoYnVpbGRDbGFzcyh0aGlzLm5hbWUsIG5hbWUsIG1vZE5hbWUsIG1vZFZhbCkpO1xuICB9XG5cbiAgZWxlbXMobmFtZSwgbW9kTmFtZSwgbW9kVmFsKSB7XG4gICAgcmV0dXJuICQoYnVpbGRDbGFzcyh0aGlzLm5hbWUsIG5hbWUsIG1vZE5hbWUsIG1vZFZhbCksIHRoaXMubm9kZSk7XG4gIH1cblxuICBzZXRNb2QoZWxlbSwgZWxlbU5hbWUsIG1vZE5hbWUsIG1vZFZhbHVlKSB7XG4gICAgdG9BcnJheShlbGVtKS5mb3JFYWNoKG5vZGUgPT4gKFxuICAgICAgbm9kZS5jbGFzc0xpc3QuYWRkKHNlbGVjdG9yKHRoaXMubmFtZSwgZWxlbU5hbWUsIG1vZE5hbWUsIG1vZFZhbHVlKSlcbiAgICApKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVsTW9kKGVsZW0sIGVsZW1OYW1lLCBtb2ROYW1lKSB7XG4gICAgdG9BcnJheShlbGVtKS5mb3JFYWNoKG5vZGUgPT4gKFxuICAgICAgbm9kZS5jbGFzc0xpc3QucmVtb3ZlKHNlbGVjdG9yKHRoaXMubmFtZSwgZWxlbU5hbWUsIG1vZE5hbWUpKVxuICAgICkpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn0iLCJpbXBvcnQgUHJvbWlzZSBmcm9tICdwcm9taXNlLXBvbHlmaWxsJztcbmltcG9ydCBTbW9vdGhTY3JvbGwgZnJvbSAnc21vb3Roc2Nyb2xsLXBvbHlmaWxsJztcblxuaW1wb3J0IHsgJCB9IGZyb20gJy4vZG9tJztcbmltcG9ydCB7IGZldGNoSlNPTiB9IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQgTmF2IGZyb20gJy4vbmF2JztcbmltcG9ydCBUYWJzIGZyb20gJy4vdGFicyc7XG5pbXBvcnQgU2xpZGVyIGZyb20gJy4vc2xpZGVyJztcbmltcG9ydCBNYXAgZnJvbSAnLi9tYXAnO1xuaW1wb3J0IFN0YXRpc3RpYyBmcm9tICcuL3N0YXRpc3RpYyc7XG5cbmlmICghd2luZG93LlByb21pc2UpIHtcbiAgd2luZG93LlByb21pc2UgPSBQcm9taXNlO1xufVxuXG5TbW9vdGhTY3JvbGwucG9seWZpbGwoKTtcblxuJCgnLm5hdicpLmZvckVhY2gobm9kZSA9PiBuZXcgTmF2KG5vZGUpKTtcbiQoJy50YWJzJykuZm9yRWFjaChub2RlID0+IG5ldyBUYWJzKG5vZGUpKTtcbiQoJy5zbGlkZXInKS5mb3JFYWNoKG5vZGUgPT4gbmV3IFNsaWRlcihub2RlKSk7XG5cbmZldGNoSlNPTignZGF0YS9zdGF0cy5qc29uJykudGhlbihkYXRhID0+IHtcbiAgJCgnLm1hcCcpLmZvckVhY2gobm9kZSA9PiBuZXcgTWFwKG5vZGUsIGRhdGEuc2xpY2UoKSkpO1xuICAkKCcuZGVjbGFyYXRpb25zJykuZm9yRWFjaChub2RlID0+IG5ldyBTdGF0aXN0aWMobm9kZSwgZGF0YSkpO1xufSk7XG4iLCJpbXBvcnQgeyBCRU0sIGJ1aWxkQ2xhc3MgfSBmcm9tICcuL2RvbSc7XG5cbmNvbnN0IEhPVkVSX0RFQk9VTkNFX1RJTUVPVVQgPSAyMDA7XG5cbmNvbnN0IFJFR0lPTl9QT0lOVF9NQVAgPSB7XG4gIFwi0JrQuNGX0LJcIjogeyBsZWZ0OiA0NTMsIHRvcDogMTcwIH0sXG4gIFwi0JvRg9GG0YzQulwiOiB7IGxlZnQ6IDE1MywgdG9wOiAxMDAgfSxcbiAgXCLQm9GM0LLQvtCyXCI6IHsgbGVmdDogODMsIHRvcDogMjA2IH0sXG4gIFwi0KPQttCz0L7RgNC+0LRcIjogeyBsZWZ0OiA0OCwgdG9wOiAzMTIgfSxcbiAgXCLQmNCy0LDQvdC+LdCk0YDQsNC90LrQvtCy0YHQulwiOiB7IGxlZnQ6IDE1MywgdG9wOiAzMTIgfSxcbiAgXCLQp9C10YDQvdC+0LLRhtGLXCI6IHsgbGVmdDogMjA3LCB0b3A6IDMyOSB9LFxuICBcItCi0LXRgNC90L7Qv9C+0LvRjFwiOiB7IGxlZnQ6IDE4OCwgdG9wOiAyNDEgfSxcbiAgXCLQoNC+0LLQvdC+XCI6IHsgbGVmdDogMjQxLCB0b3A6IDEwMCB9LFxuICBcItCl0LzQtdC70YzQvdC40YbQutC40LlcIjogeyBsZWZ0OiAyNTksIHRvcDogMjA2IH0sXG4gIFwi0JbQuNGC0L7QvNC40YBcIjogeyBsZWZ0OiAzNDcsIHRvcDogMTUzIH0sXG4gIFwi0JLQuNC90L3QuNGG0LBcIjogeyBsZWZ0OiAzNjUsIHRvcDogMjc3IH0sXG4gIFwi0KfQtdGA0LrQsNGB0YHRi1wiOiB7IGxlZnQ6IDUyMywgdG9wOiAyNDEgfSxcbiAgXCLQmtC40YDQvtCy0L7Qs9GA0LDQtFwiOiB7IGxlZnQ6IDU0MSwgdG9wOiAzMTIgfSxcbiAgXCLQn9C+0LvRgtCw0LLQsFwiOiB7IGxlZnQ6IDY0NiwgdG9wOiAxODggfSxcbiAgXCLQp9C10YDQvdC40LPQvtCyXCI6IHsgbGVmdDogNTQxLCB0b3A6IDY1IH0sXG4gIFwi0KHRg9C80LzRi1wiOiB7IGxlZnQ6IDY0NiwgdG9wOiAxMDAgfSxcbiAgXCLQpdCw0YDRjNC60L7QslwiOiB7IGxlZnQ6IDc3MCwgdG9wOiAyMDUgfSxcbiAgXCLQm9GD0LPQsNC90YHQulwiOiB7IGxlZnQ6IDkxMSwgdG9wOiAyNTkgfSxcbiAgXCLQlNC90LXQv9GA0L7Qv9C10YLRgNC+0LLRgdC6XCI6IHsgbGVmdDogNjgyLCB0b3A6IDMxMSB9LFxuICBcItCU0L7QvdC10YbQulwiOiB7IGxlZnQ6IDg0MCwgdG9wOiAzNDcgfSxcbiAgXCLQl9Cw0L/QvtGA0L7QttGM0LVcIjogeyBsZWZ0OiA3NTIsIHRvcDogNDE3IH0sXG4gIFwi0KXQtdGA0YHQvtC9XCI6IHsgbGVmdDogNjI5LCB0b3A6IDQ1MiB9LFxuICBcItCd0LjQutC+0LvQsNC10LJcIjogeyBsZWZ0OiA1MjMsIHRvcDogMzk5IH0sXG4gIFwi0J7QtNC10YHRgdCwXCI6IHsgbGVmdDogNDUzLCB0b3A6IDQzNSB9LFxuICBcItCa0YDRi9C8XCI6IHsgbGVmdDogNjY0LCB0b3A6IDU1OCB9XG59O1xuXG5jb25zdCBjcmVhdGVQb2ludCA9ICh7IGxlZnQsIHRvcCB9KSA9PiB7XG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBub2RlLmNsYXNzTGlzdC5hZGQoJ21hcF9fcG9pbnQnKTtcbiAgbm9kZS5zdHlsZS5sZWZ0ID0gYCR7bGVmdH1weGA7XG4gIG5vZGUuc3R5bGUudG9wID0gYCR7dG9wfXB4YDtcblxuICByZXR1cm4gbm9kZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcCBleHRlbmRzIEJFTSB7XG4gIGRhdGEgPSBbXTtcbiAgdGltZW91dCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3Iobm9kZSwgZGF0YSkge1xuICAgIHN1cGVyKCdtYXAnLCBub2RlKTtcblxuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy4kdG9vbHRpcCA9IHRoaXMuZWxlbSgndG9vbHRpcCcpO1xuXG4gICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICBkYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCBwb2ludCA9IGNyZWF0ZVBvaW50KFJFR0lPTl9QT0lOVF9NQVBbaXRlbS5yZWdpb25fbmFtZV0pO1xuICAgICAgcG9pbnQuZGF0YXNldC5pbmRleCA9IGluZGV4O1xuXG4gICAgICBwb2ludC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLCBmYWxzZSk7XG4gICAgICBwb2ludC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMsIGZhbHNlKTtcblxuICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQocG9pbnQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy4kdG9vbHRpcC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW92ZXInLCB0aGlzLCBmYWxzZSk7XG4gICAgdGhpcy4kdG9vbHRpcC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW91dCcsIHRoaXMsIGZhbHNlKTtcblxuICAgIHRoaXMuZWxlbSgnbWFpbicpLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgfVxuXG4gIGhhbmRsZUV2ZW50KHsgdGFyZ2V0LCB0eXBlIH0pIHtcbiAgICBpZiAodHlwZSA9PT0gJ21vdXNlb3ZlcicgJiYgdGFyZ2V0LmRhdGFzZXQuaW5kZXgpIHtcbiAgICAgIHRoaXMuJHRvb2x0aXAuc3R5bGUudG9wID0gdGFyZ2V0LnN0eWxlLnRvcDtcbiAgICAgIHRoaXMuJHRvb2x0aXAuc3R5bGUubGVmdCA9IHRhcmdldC5zdHlsZS5sZWZ0O1xuICAgIH1cblxuICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpO1xuICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgIGNhc2UgJ21vdXNlb3V0JzpcbiAgICAgICAgICB0aGlzLmRlbE1vZCh0aGlzLiR0b29sdGlwLCAndG9vbHRpcCcsICdzaG93Jyk7XG4gICAgICAgICAgdGhpcy5kZWxNb2QodGhpcy4kYWN0aXZlLCAncG9pbnQnLCAnYWN0aXZlJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ21vdXNlb3Zlcic6XG4gICAgICAgICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YVt0YXJnZXQuZGF0YXNldC5pbmRleF07XG5cbiAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgJHRvb2x0aXBEYXRhID0gdGhpcy4kdG9vbHRpcC5xdWVyeVNlbGVjdG9yQWxsKGAke2J1aWxkQ2xhc3MoJ21hcCcsICd0b29sdGlwLWRhdGEnKX0gZHRgKTtcblxuICAgICAgICAgICAgdGhpcy4kdG9vbHRpcC5zdHlsZS50b3AgPSB0YXJnZXQuc3R5bGUudG9wO1xuICAgICAgICAgICAgdGhpcy4kdG9vbHRpcC5zdHlsZS5sZWZ0ID0gdGFyZ2V0LnN0eWxlLmxlZnQ7XG5cbiAgICAgICAgICAgIHRoaXMuJGFjdGl2ZSAmJiB0aGlzLmRlbE1vZCh0aGlzLiRhY3RpdmUsICdwb2ludCcsICdhY3RpdmUnKTtcbiAgICAgICAgICAgIHRoaXMuc2V0TW9kKHRoaXMuJHRvb2x0aXAsICd0b29sdGlwJywgJ3Nob3cnKTtcblxuICAgICAgICAgICAgdGhpcy4kdG9vbHRpcC5xdWVyeVNlbGVjdG9yKGJ1aWxkQ2xhc3MoJ21hcCcsICd0b29sdGlwLXRpdGxlJykpLnRleHRDb250ZW50ID0gZGF0YS5yZWdpb25fbmFtZTtcbiAgICAgICAgICAgIHRoaXMuJGFjdGl2ZSA9IHRhcmdldDtcblxuICAgICAgICAgICAgJHRvb2x0aXBEYXRhWzBdLnRleHRDb250ZW50ID0gZGF0YS5tZWRpY2FsX3N5c3RlbV9wcm92aWRlcnM7XG4gICAgICAgICAgICAkdG9vbHRpcERhdGFbMV0udGV4dENvbnRlbnQgPSBkYXRhLmRvY3RvcnM7XG4gICAgICAgICAgICAkdG9vbHRpcERhdGFbMl0udGV4dENvbnRlbnQgPSBkYXRhLmRlY2xhcmF0aW9uc19zaWduZWQ7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0TW9kKHRoaXMuJGFjdGl2ZSwgJ3BvaW50JywgJ2FjdGl2ZScpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRoaXMuc2V0TW9kKHRoaXMuJHRvb2x0aXAsICd0b29sdGlwJywgJ3Nob3cnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9LCBIT1ZFUl9ERUJPVU5DRV9USU1FT1VUKTtcbiAgfVxufSIsImV4cG9ydCBkZWZhdWx0IGNsYXNzIE5hdiB7XG4gIGNvbnN0cnVjdG9yKG5vZGUpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIGlmIChlLnRhcmdldC5ocmVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0byA9IGUudGFyZ2V0LmhyZWYuc3BsaXQoJyMnKVsxXTtcbiAgICAgIGNvbnN0IHsgdG9wIH0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0bykuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cbiAgICAgIHdpbmRvdy5zY3JvbGwoeyB0b3A6ICh0b3AgKyB3aW5kb3cuc2Nyb2xsWSkgLSA1MCwgbGVmdDogMCwgYmVoYXZpb3I6ICdzbW9vdGgnIH0pO1xuICAgIH0pXG4gIH1cbn0iLCJpbXBvcnQgeyBCRU0sIGJ1aWxkQ2xhc3MsIHNlbGVjdG9yIH0gZnJvbSAnLi9kb20nO1xuXG5jb25zdCBjcmVhdGVNYXJrZXIgPSAoYWN0aXZlID0gZmFsc2UpID0+IHtcbiAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG5cbiAgbm9kZS5jbGFzc0xpc3QuYWRkKHNlbGVjdG9yKCdzbGlkZXInLCAnbWFya2VyJykpO1xuICBhY3RpdmUgJiYgbm9kZS5jbGFzc0xpc3QuYWRkKHNlbGVjdG9yKCdzbGlkZXInLCAnbWFya2VyJywgJ2FjdGl2ZScpKTtcblxuICByZXR1cm4gbm9kZTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNsaWRlciBleHRlbmRzIEJFTSB7XG4gIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgY29uc3RydWN0b3Iobm9kZSkge1xuICAgIHN1cGVyKCdzbGlkZXInLCBub2RlKTtcbiAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLmVsZW1zKCdzbGlkZScpO1xuXG4gICAgdGhpcy4kbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy4kY29udHJvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgdGhpcy4kY29udHJvbC5jbGFzc0xpc3QuYWRkKHNlbGVjdG9yKHRoaXMubmFtZSwgJ21hcmtlcnMnKSk7XG5cbiAgICB0aGlzLiRzbGlkZXMuZm9yRWFjaCgobm9kZSwgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IG1hcmtlciA9IGNyZWF0ZU1hcmtlcihpbmRleCA9PT0gdGhpcy5jdXJyZW50SW5kZXgpO1xuICAgICAgdGhpcy4kY29udHJvbC5hcHBlbmRDaGlsZChtYXJrZXIpO1xuICAgICAgdGhpcy4kbWFya2Vycy5wdXNoKG1hcmtlcik7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRjb250cm9sLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKHsgdGFyZ2V0IH0pID0+IHtcbiAgICAgIGlmICghdGFyZ2V0LmNsb3Nlc3QoYnVpbGRDbGFzcyh0aGlzLm5hbWUsICdtYXJrZXInKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0b0luZGV4ID0gdGhpcy5nZXRJbmRleEJ5RWxlbSh0YXJnZXQpO1xuXG4gICAgICBpZiAodG9JbmRleCA9PT0gdGhpcy5jdXJyZW50SW5kZXgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmRlbE1vZCh0aGlzLmVsZW0oJ21hcmtlcicsICdhY3RpdmUnKSwgJ21hcmtlcicsICdhY3RpdmUnKTtcbiAgICAgIHRoaXMuc2V0TW9kKHRhcmdldCwgJ21hcmtlcicsICdhY3RpdmUnKTtcblxuICAgICAgdGhpcy5zbGlkZSh0b0luZGV4KTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB0aGlzLm5vZGUuYXBwZW5kQ2hpbGQodGhpcy4kY29udHJvbCk7XG4gIH1cblxuICBzbGlkZShpbmRleCkge1xuICAgIGNvbnN0IGlzTmV4dCA9IHRoaXMuY3VycmVudEluZGV4IDwgaW5kZXg7XG5cbiAgICB0aGlzLiRzbGlkZXNbdGhpcy5jdXJyZW50SW5kZXhdLmFuaW1hdGUoW1xuICAgICAgeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDApJyB9LFxuICAgICAgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGVYKCR7aXNOZXh0ID8gJy0nIDogJyd9MTAwJSlgIH1cbiAgICBdLCB0aGlzLmNvbnN0cnVjdG9yLkFOSU1BVElPTl9PUFRJT05TKTtcblxuICAgIHRoaXMuJHNsaWRlc1tpbmRleF0uYW5pbWF0ZShbXG4gICAgICB7IHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtpc05leHQgPyAnJyA6ICctJ30xMDAlKWAgfSxcbiAgICAgIHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwKScgfVxuICAgIF0sIHRoaXMuY29uc3RydWN0b3IuQU5JTUFUSU9OX09QVElPTlMpO1xuXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSBpbmRleDtcbiAgfVxuXG4gIGdldEluZGV4QnlFbGVtKGVsZW0pIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcblxuICAgIHRoaXMuJG1hcmtlcnMuc29tZSgobm9kZSwgaSkgPT4ge1xuICAgICAgaWYgKG5vZGUgPT09IGVsZW0pIHtcbiAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBpbmRleDtcbiAgfVxuXG4gIHN0YXRpYyBBTklNQVRJT05fT1BUSU9OUyA9IHtcbiAgICBkdXJhdGlvbjogMzAwLFxuICAgIGZpbGw6ICdmb3J3YXJkcycsXG4gICAgZWFzaW5nOiAnZWFzZS1pbi1vdXQnXG4gIH1cbn0iLCJpbXBvcnQgeyBCRU0sIHNlbGVjdG9yIH0gZnJvbSAnLi9kb20nO1xuaW1wb3J0IHsgbnVtYmVyRm9ybWF0dGluZyB9IGZyb20gJy4vdXRpbHMnO1xuXG5jb25zdCBDT0xPUlNfTUFQID0gW1xuICAnIzkwYzhlNicsICcjYjA5N2M2JywgJyNkZmIwZDAnLFxuICAnI2UzYWFiOCcsICcjYWZkNWU3JywgJyNjN2IyZDUnLFxuICAnI2U5YzdkZicsICcjZWNjN2NmJywgJyNmMWVlYzknLFxuICAnI2NlZDhlMicsICcjNWRhODkyJywgJyM1Mjk2Y2QnLFxuICAnI2EzZDdmMicsICcjZjNmMWEwJywgJyNiY2RhZDUnLFxuICAnIzcxYjdhOCcsICcjNWNhOWRjJywgJyNkYzkxYTMnLFxuICAnI2Q4ODE2ZicsICcjZTJhMzk0JywgJyM3NTY2YWEnLFxuICAnI2NhZGZlYicsICcjZGRkMmRmJywgJyNmNGQ5YjUnLFxuICAnI2QzODFiMidcbl07XG5cbmNvbnN0IGNyZWF0ZUxpc3RJdGVtTm9kZSA9ICh0aXRsZSwgdmFsdWUsIGNvbG9yKSA9PiB7XG4gIGNvbnN0ICRsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gIGNvbnN0ICRzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICBjb25zdCAkdmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAkbGkuY2xhc3NMaXN0LmFkZChzZWxlY3RvcignZGVjbGFyYXRpb25zJywgJ2xpc3QtaXRlbScpKTtcbiAgJGxpLnRleHRDb250ZW50ID0gdGl0bGU7XG5cbiAgJHNwYW4uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY29sb3I7XG5cbiAgJHZhbHVlLmNsYXNzTGlzdC5hZGQoc2VsZWN0b3IoJ2RlY2xhcmF0aW9ucycsICdsaXN0LWl0ZW0tdmFsdWUnKSk7XG4gICR2YWx1ZS50ZXh0Q29udGVudCA9IG51bWJlckZvcm1hdHRpbmcodmFsdWUpO1xuXG4gICRsaS5wcmVwZW5kKCRzcGFuKTtcbiAgJGxpLmFwcGVuZCgkdmFsdWUpO1xuXG4gIHJldHVybiAkbGk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0aXN0aWMgZXh0ZW5kcyBCRU0ge1xuICBjb25zdHJ1Y3Rvcihub2RlLCBkYXRhKSB7XG4gICAgc3VwZXIoJ2RlY2xhcmF0aW9ucycsIG5vZGUpO1xuXG4gICAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG5cbiAgICB0aGlzLiRjYW52YXMgPSB0aGlzLmVsZW0oJ2dyYXBoLWNhbnZhcycpO1xuICAgIHRoaXMuY29udGV4dCA9IHRoaXMuJGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgY29uc3QgdG90YWwgPSBkYXRhLnJlZHVjZSgodGFyZ2V0LCB7IGRlY2xhcmF0aW9ucyB9KSA9PiB0YXJnZXQgKyBkZWNsYXJhdGlvbnMsIDApO1xuXG4gICAgZGF0YS5zb3J0KChhLCBiKSA9PiBhLmRlY2xhcmF0aW9ucyA8IGIuZGVjbGFyYXRpb25zID8gMSA6IC0xKTtcblxuICAgIGxldCBbeCwgeSwgciwgc10gPSBbNDkwLCA0OTAsIDQ4MCwgMF07XG5cbiAgICBkYXRhLmZvckVhY2goKGl0ZW0sIGluZGV4KSA9PiB7XG4gICAgICBjb25zdCAkaXRlbSA9IGNyZWF0ZUxpc3RJdGVtTm9kZShcbiAgICAgICAgaXRlbS5yZWdpb25fbmFtZSxcbiAgICAgICAgaXRlbS5kZWNsYXJhdGlvbnMsXG4gICAgICAgIENPTE9SU19NQVBbaW5kZXhdXG4gICAgICApO1xuXG4gICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCgkaXRlbSk7XG5cbiAgICAgIGxldCByYWRpYW5zID0gKChpdGVtLmRlY2xhcmF0aW9ucyAvIGRhdGFbMF0uZGVjbGFyYXRpb25zKSAqIDM2MCkgKiAoTWF0aC5QSSAvIDM2MCk7XG5cbiAgICAgIHRoaXMuY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIHRoaXMuY29udGV4dC5saW5lV2lkdGggPSA2O1xuICAgICAgdGhpcy5jb250ZXh0LnN0cm9rZVN0eWxlID0gQ09MT1JTX01BUFtpbmRleF07XG4gICAgICB0aGlzLmNvbnRleHQuYXJjKHgsIHksIHIgLSAoMjAgKiBpbmRleCksIHMsIHJhZGlhbnMsIGZhbHNlKTtcbiAgICAgIHRoaXMuY29udGV4dC5zdHJva2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuZWxlbSgnbGlzdCcpLmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB0aGlzLmVsZW0oJ3RvdGFsLXZhbHVlJykudGV4dENvbnRlbnQgPSBudW1iZXJGb3JtYXR0aW5nKHRvdGFsKTtcbiAgfVxufSIsImltcG9ydCB7ICQsIEJFTSwgYnVpbGRDbGFzcywgc2VsZWN0b3IgfSBmcm9tICcuL2RvbSc7XG5cbmNvbnN0IFBBTkVMX0FOSU1BVElPTl9PUFRJT05TID0ge1xuICBkdXJhdGlvbjogMzAwLFxuICBmaWxsOiAnZm9yd2FyZHMnLFxuICBlYXNpbmc6ICdlYXNlLWluLW91dCdcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRhYnMgZXh0ZW5kcyBCRU0ge1xuICBjb25zdHJ1Y3Rvcihub2RlKSB7XG4gICAgc3VwZXIoJ3RhYnMnLCBub2RlKTtcblxuICAgIHRoaXMuJGNvbnRyb2xzID0gdGhpcy5lbGVtcygnbmF2LWl0ZW0nKTtcbiAgICB0aGlzLiRzbGlkZXMgPSB0aGlzLmVsZW1zKCdzbGlkZScpO1xuXG4gICAgdGhpcy4kbWFya2VyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy4kbWFya2VyLmNsYXNzTGlzdC5hZGQoc2VsZWN0b3IodGhpcy5uYW1lLCAnbWFya2VyJykpO1xuICAgIHRoaXMuZWxlbSgnaGVhZGVyJykuYXBwZW5kQ2hpbGQodGhpcy4kbWFya2VyKTtcblxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gdGhpcy5nZXRJbmRleEJ5RWxlbSh0aGlzLmVsZW0oJ25hdi1pdGVtJywgJ2FjdGl2ZScpKTtcblxuICAgIHRoaXMuZWxlbSgnbmF2JykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgaWYgKCFlLnRhcmdldC5jbG9zZXN0KGJ1aWxkQ2xhc3ModGhpcy5uYW1lLCAnbmF2LWl0ZW0nKSkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB0b0luZGV4ID0gdGhpcy5nZXRJbmRleEJ5RWxlbShlLnRhcmdldCk7XG5cbiAgICAgIGlmICh0b0luZGV4ID09PSB0aGlzLmN1cnJlbnRJbmRleCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZGVsTW9kKHRoaXMuZWxlbSgnbmF2LWl0ZW0nLCAnYWN0aXZlJyksICduYXYtaXRlbScsICdhY3RpdmUnKTtcbiAgICAgIHRoaXMuc2V0TW9kKGUudGFyZ2V0LCAnbmF2LWl0ZW0nLCAnYWN0aXZlJyk7XG5cbiAgICAgIHRoaXMuYW5pbWF0ZVBhbmVscyh0b0luZGV4KTtcbiAgICAgIHRoaXMuYW5pbWF0ZU1hcmtlcih0b0luZGV4KTtcblxuICAgICAgdGhpcy5jdXJyZW50SW5kZXggPSB0b0luZGV4O1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHRoaXMuc2V0TW9kKHRoaXMuZWxlbSgnbmF2LWl0ZW0nLCAnYWN0aXZlJyksICduYXYtaXRlbScsICdtYXJrZXInKTtcbiAgfVxuXG4gIGFuaW1hdGVQYW5lbHMoaW5kZXgpIHtcbiAgICBjb25zdCBjdXJyZW50ID0gdGhpcy5jdXJyZW50SW5kZXg7XG4gICAgY29uc3QgaXNOZXh0ID0gY3VycmVudCA8IGluZGV4O1xuXG4gICAgKGN1cnJlbnQgIT09IHVuZGVmaW5lZCkgJiYgdGhpcy4kc2xpZGVzW2N1cnJlbnRdLmFuaW1hdGUoW1xuICAgICAgeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDApJywgb3BhY2l0eTogMSB9LFxuICAgICAgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGVYKCR7aXNOZXh0ID8gJy0nIDogJyd9MTAwJSlgLCBvcGFjaXR5OiAwIH1cbiAgICBdLCBQQU5FTF9BTklNQVRJT05fT1BUSU9OUyk7XG5cbiAgICB0aGlzLiRzbGlkZXNbaW5kZXhdLmFuaW1hdGUoW1xuICAgICAgeyB0cmFuc2Zvcm06IGB0cmFuc2xhdGVYKCR7aXNOZXh0ID8gJycgOiAnLSd9MTAwJSlgLCBvcGFjaXR5OiAwIH0sXG4gICAgICB7IHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoMCknLCBvcGFjaXR5OiAxIH1cbiAgICBdLCBQQU5FTF9BTklNQVRJT05fT1BUSU9OUyk7XG4gIH1cblxuICBhbmltYXRlTWFya2VyKGluZGV4KSB7XG4gICAgY29uc3QgY3VycmVudCA9IHtcbiAgICAgIGxlZnQ6IHRoaXMuJGNvbnRyb2xzW3RoaXMuY3VycmVudEluZGV4XS5vZmZzZXRMZWZ0LFxuICAgICAgd2lkdGg6IHRoaXMuJGNvbnRyb2xzW3RoaXMuY3VycmVudEluZGV4XS5jbGllbnRXaWR0aFxuICAgIH07XG5cbiAgICBjb25zdCBsZWZ0ID0gdGhpcy4kY29udHJvbHNbaW5kZXhdLm9mZnNldExlZnQ7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLiRjb250cm9sc1tpbmRleF0uY2xpZW50V2lkdGg7XG5cbiAgICBjb25zdCBwbGF5ZXIgPSB0aGlzLiRtYXJrZXIuYW5pbWF0ZShbXG4gICAgICB7XG4gICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtjdXJyZW50LmxlZnR9cHgpYCxcbiAgICAgICAgd2lkdGg6IGAke2N1cnJlbnQud2lkdGh9cHhgXG4gICAgICB9LCB7XG4gICAgICAgIHRyYW5zZm9ybTogYHRyYW5zbGF0ZVgoJHtsZWZ0fXB4KWAsXG4gICAgICAgIHdpZHRoOiBgJHt3aWR0aH1weGBcbiAgICAgIH1cbiAgICBdLCB7Li4uUEFORUxfQU5JTUFUSU9OX09QVElPTlMsIGZpbGw6ICdub25lJ30pO1xuXG4gICAgcGxheWVyLm9uZmluaXNoID0gKCkgPT4ge1xuICAgICAgdGhpcy5zZXRNb2QodGhpcy4kY29udHJvbHNbaW5kZXhdLCAnbmF2LWl0ZW0nLCAnbWFya2VyJyk7XG4gICAgfTtcblxuICAgIHRoaXMuZGVsTW9kKHRoaXMuJGNvbnRyb2xzW3RoaXMuY3VycmVudEluZGV4XSwgJ25hdi1pdGVtJywgJ21hcmtlcicpXG4gIH1cblxuICBnZXRJbmRleEJ5RWxlbShlbGVtKSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG5cbiAgICB0aGlzLiRjb250cm9scy5zb21lKChub2RlLCBpKSA9PiB7XG4gICAgICBpZiAobm9kZSA9PT0gZWxlbSkge1xuICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG59IiwiY29uc3Qgb2JqZWN0VG9RdWVyeSA9ICh0YXJnZXQpID0+IChcbiAgJz8nICsgT2JqZWN0LmtleXModGFyZ2V0KS5yZWR1Y2UoKGFyciwga2V5KSA9PiAoXG4gICAgYXJyLnB1c2goYCR7a2V5fT0ke3RhcmdldFtrZXldfWApICYmIGFyclxuICApLCBbXSkuam9pbignJicpXG4pO1xuXG5leHBvcnQgY29uc3QgbnVtYmVyRm9ybWF0dGluZyA9IG51bWJlciA9PiAoXG4gIG51bWJlci50b0ZpeGVkKDIpLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrXFwuKS9nLCAnJDEgJykuc3BsaXQoJy4nKVswXVxuKTtcblxuZXhwb3J0IGNvbnN0IGZldGNoSlNPTiA9ICh1cmwsIG9wdGlvbnMgPSB7IG1ldGhvZDogJ0dFVCcgfSkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICBjb25zdCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgaWYgKG9wdGlvbnMuYm9keSAmJiBvcHRpb25zLm1ldGhvZCA9PT0gJ0dFVCcpIHtcbiAgICB1cmwgKz0gb2JqZWN0VG9RdWVyeShvcHRpb25zLmJvZHkpO1xuICB9XG5cbiAgcmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSAoKSA9PiB7XG4gICAgaWYgKHJlcXVlc3QucmVhZHlTdGF0ZSAhPT0gNCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlc29sdmUoSlNPTi5wYXJzZShyZXF1ZXN0LnJlc3BvbnNlVGV4dCkpO1xuICB9O1xuXG4gIHJlcXVlc3Qub25lcnJvciA9IHJlamVjdDtcbiAgcmVxdWVzdC5vcGVuKG9wdGlvbnMubWV0aG9kIHx8ICdHRVQnLCB1cmwpO1xuICByZXF1ZXN0LnNlbmQob3B0aW9ucy5ib2R5ID8gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5ib2R5KSA6IG51bGwpO1xufSk7Il19
