"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = prefixPlugin;

var _prefixer = require("../prefixer");

function prefixPlugin(_ref) {
  var config = _ref.config,
      style = _ref.style;
  var newStyle = (0, _prefixer.getPrefixedStyle)(style, config.userAgent);
  return {
    style: newStyle
  };
}