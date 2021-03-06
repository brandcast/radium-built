"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.camelCaseToDashCase = void 0;
var _camelCaseRegex = /([a-z])?([A-Z])/g;

var _camelCaseReplacer = function _camelCaseReplacer(match, p1, p2) {
  return (p1 || '') + '-' + p2.toLowerCase();
};

var camelCaseToDashCase = function camelCaseToDashCase(s) {
  return s.replace(_camelCaseRegex, _camelCaseReplacer);
};

exports.camelCaseToDashCase = camelCaseToDashCase;

var camelCasePropsToDashCase = function camelCasePropsToDashCase(prefixedStyle) {
  // Since prefix is expected to work on inline style objects, we must
  // translate the keys to dash case for rendering to CSS.
  return Object.keys(prefixedStyle).reduce(function (result, key) {
    var dashCaseKey = camelCaseToDashCase(key); // Fix IE vendor prefix

    if (/^ms-/.test(dashCaseKey)) {
      dashCaseKey = "-".concat(dashCaseKey);
    }

    result[dashCaseKey] = prefixedStyle[key];
    return result;
  }, {});
};

var _default = camelCasePropsToDashCase;
exports["default"] = _default;