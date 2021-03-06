function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import React, { Component } from 'react';
import StyleKeeper from '../style-keeper';
import { withRadiumContexts } from '../context';

var StyleSheet =
/*#__PURE__*/
function (_Component) {
  _inherits(StyleSheet, _Component);

  // eslint-disable-next-line react/sort-comp
  function StyleSheet() {
    var _this;

    _classCallCheck(this, StyleSheet);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(StyleSheet).apply(this, arguments));
    _this.styleKeeper = void 0;
    _this._subscription = void 0;
    _this._root = void 0;
    _this._css = void 0;

    _this._onChange = function () {
      var nextCSS = _this.styleKeeper.getCSS();

      if (nextCSS !== _this._css) {
        if (_this._root) {
          _this._root.innerHTML = nextCSS;
        } else {
          throw new Error('No root style object found, even after StyleSheet mount.');
        }

        _this._css = nextCSS;
      }
    };

    if (!_this.props.styleKeeperContext) {
      throw new Error('StyleRoot is required to use StyleSheet');
    }

    _this.styleKeeper = _this.props.styleKeeperContext;
    _this._css = _this.styleKeeper.getCSS();
    return _this;
  }

  _createClass(StyleSheet, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      this._subscription = this.styleKeeper.subscribe(this._onChange);

      this._onChange();
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate() {
      return false;
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this._subscription) {
        this._subscription.remove();
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      return React.createElement("style", {
        dangerouslySetInnerHTML: {
          __html: this._css
        },
        ref: function ref(c) {
          _this2._root = c;
        }
      });
    }
  }]);

  return StyleSheet;
}(Component);

export default withRadiumContexts(StyleSheet);