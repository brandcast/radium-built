function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

export function isNestedStyle(value) {
  // Don't merge objects overriding toString, since they should be converted
  // to string values.
  return value && value.constructor === Object && value.toString === Object.prototype.toString;
} // Merge style objects. Deep merge plain object values.

export function mergeStyles(styles) {
  var result = {};
  styles.forEach(function (style) {
    if (!style || _typeof(style) !== 'object') {
      return;
    }

    if (Array.isArray(style)) {
      style = mergeStyles(style);
    }

    Object.keys(style).forEach(function (key) {
      // Simple case, nothing nested
      if (!isNestedStyle(style[key]) || !isNestedStyle(result[key])) {
        result[key] = style[key];
        return;
      } // If nested media, don't merge the nested styles, append a space to the
      // end (benign when converted to CSS). This way we don't end up merging
      // media queries that appear later in the chain with those that appear
      // earlier.


      if (key.indexOf('@media') === 0) {
        var newKey = key; // eslint-disable-next-line no-constant-condition

        while (true) {
          newKey += ' ';

          if (!result[newKey]) {
            result[newKey] = style[key];
            return;
          }
        }
      } // Merge all other nested styles recursively


      result[key] = mergeStyles([result[key], style[key]]);
    });
  });
  return result;
}