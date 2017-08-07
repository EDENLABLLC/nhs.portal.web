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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dom = require('./dom');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Feedback = function (_BEM) {
  _inherits(Feedback, _BEM);

  function Feedback(node) {
    _classCallCheck(this, Feedback);

    var _this = _possibleConstructorReturn(this, (Feedback.__proto__ || Object.getPrototypeOf(Feedback)).call(this, 'feedback', node));

    _this.$name = _this.elem('name');
    _this.$message = _this.elem('message');
    _this.$mailTo = _this.elem('mailto');

    node.onsubmit = function (e) {
      e.preventDefault();

      _this.$mailTo.href = 'mailto:info@nszu.gov.ua?subject=\u0417\u0432\u043E\u0440\u043E\u0442\u043D\u0456\u0439 \u0437\u0432\u2019\u044F\u0437\u043E\u043A \u0432\u0456\u0434 ' + _this.$name.value + '&body=' + _this.$message.value;
      _this.$mailTo.click();
      return false;
    };
    return _this;
  }

  return Feedback;
}(_dom.BEM);

exports.default = Feedback;
module.exports = exports['default'];

},{"./dom":3}],5:[function(require,module,exports){
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

var _feedback = require('./feedback');

var _feedback2 = _interopRequireDefault(_feedback);

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
(0, _dom.$)('.feedback').forEach(function (node) {
  return new _feedback2.default(node);
});

(0, _utils.fetchJSON)('data/stats.json').then(function (data) {
  (0, _dom.$)('.map').forEach(function (node) {
    return new _map2.default(node, data.slice());
  });
  (0, _dom.$)('.declarations').forEach(function (node) {
    return new _statistic2.default(node, data);
  });
});

},{"./dom":3,"./feedback":4,"./map":6,"./nav":7,"./slider":8,"./statistic":9,"./tabs":10,"./utils":11,"promise-polyfill":1,"smoothscroll-polyfill":2}],6:[function(require,module,exports){
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

},{"./dom":3}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{"./dom":3}],9:[function(require,module,exports){
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

},{"./dom":3,"./utils":11}],10:[function(require,module,exports){
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

},{"./dom":3}],11:[function(require,module,exports){
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

},{}]},{},[5]);
