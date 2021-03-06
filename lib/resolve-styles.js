"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _appendImportantToEachValue = _interopRequireDefault(require("./append-important-to-each-value"));

var _cssRuleSetToString = _interopRequireDefault(require("./css-rule-set-to-string"));

var _getState = _interopRequireDefault(require("./get-state"));

var _getStateKey = _interopRequireDefault(require("./get-state-key"));

var _cleanStateKey = _interopRequireDefault(require("./clean-state-key"));

var _getRadiumStyleState = _interopRequireDefault(require("./get-radium-style-state"));

var _hash = _interopRequireDefault(require("./hash"));

var _mergeStyles = require("./merge-styles");

var _plugins = _interopRequireDefault(require("./plugins/"));

var _exenv = _interopRequireDefault(require("exenv"));

var _react = _interopRequireDefault(require("react"));

var _styleKeeper = _interopRequireDefault(require("./style-keeper"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var DEFAULT_CONFIG = {
  plugins: [_plugins["default"].mergeStyleArray, _plugins["default"].checkProps, _plugins["default"].resolveMediaQueries, _plugins["default"].resolveInteractionStyles, _plugins["default"].keyframes, _plugins["default"].visited, _plugins["default"].removeNestedStyles, _plugins["default"].prefix, _plugins["default"].checkProps]
}; // Gross

var globalState = {}; // Only for use by tests

var __isTestModeEnabled = false;
// Declare early for recursive helpers.
var _resolveStyles5 = null;

var _shouldResolveStyles = function _shouldResolveStyles(component) {
  return component.type && !component.type._isRadiumEnhanced;
};

var _resolveChildren = function _resolveChildren(_ref) {
  var children = _ref.children,
      component = _ref.component,
      config = _ref.config,
      existingKeyMap = _ref.existingKeyMap,
      extraStateKeyMap = _ref.extraStateKeyMap;

  if (!children) {
    return children;
  }

  var childrenType = _typeof(children);

  if (childrenType === 'string' || childrenType === 'number') {
    // Don't do anything with a single primitive child
    return children;
  }

  if (childrenType === 'function') {
    // Wrap the function, resolving styles on the result
    return function () {
      var result = children.apply(this, arguments);

      if (_react["default"].isValidElement(result)) {
        var _key = (0, _getStateKey["default"])(result);

        delete extraStateKeyMap[_key];

        var _resolveStyles = _resolveStyles5(component, result, config, existingKeyMap, true, extraStateKeyMap),
            element = _resolveStyles.element;

        return element;
      }

      return result;
    };
  }

  if (_react["default"].Children.count(children) === 1 && children.type) {
    // If a React Element is an only child, don't wrap it in an array for
    // React.Children.map() for React.Children.only() compatibility.
    var onlyChild = _react["default"].Children.only(children);

    var _key2 = (0, _getStateKey["default"])(onlyChild);

    delete extraStateKeyMap[_key2];

    var _resolveStyles2 = _resolveStyles5(component, onlyChild, config, existingKeyMap, true, extraStateKeyMap),
        element = _resolveStyles2.element;

    return element;
  }

  return _react["default"].Children.map(children, function (child) {
    if (_react["default"].isValidElement(child)) {
      var _key3 = (0, _getStateKey["default"])(child);

      delete extraStateKeyMap[_key3];

      var _resolveStyles3 = _resolveStyles5(component, child, config, existingKeyMap, true, extraStateKeyMap),
          _element = _resolveStyles3.element;

      return _element;
    }

    return child;
  });
}; // Recurse over props, just like children


var _resolveProps = function _resolveProps(_ref2) {
  var component = _ref2.component,
      config = _ref2.config,
      existingKeyMap = _ref2.existingKeyMap,
      props = _ref2.props,
      extraStateKeyMap = _ref2.extraStateKeyMap;
  var newProps = props;
  Object.keys(props).forEach(function (prop) {
    // We already recurse over children above
    if (prop === 'children') {
      return;
    }

    var propValue = props[prop];

    if (_react["default"].isValidElement(propValue)) {
      var _key4 = (0, _getStateKey["default"])(propValue);

      delete extraStateKeyMap[_key4];
      newProps = _objectSpread({}, newProps);

      var _resolveStyles4 = _resolveStyles5(component, propValue, config, existingKeyMap, true, extraStateKeyMap),
          element = _resolveStyles4.element;

      newProps[prop] = element;
    }
  });
  return newProps;
};

var _buildGetKey = function _buildGetKey(_ref3) {
  var componentName = _ref3.componentName,
      existingKeyMap = _ref3.existingKeyMap,
      renderedElement = _ref3.renderedElement;
  // We need a unique key to correlate state changes due to user interaction
  // with the rendered element, so we know to apply the proper interactive
  // styles.
  var originalKey = (0, _getStateKey["default"])(renderedElement);
  var key = (0, _cleanStateKey["default"])(originalKey);
  var alreadyGotKey = false;

  var getKey = function getKey() {
    if (alreadyGotKey) {
      return key;
    }

    alreadyGotKey = true;

    if (existingKeyMap[key]) {
      var elementName;

      if (typeof renderedElement.type === 'string') {
        elementName = renderedElement.type;
      } else if (renderedElement.type.constructor) {
        elementName = renderedElement.type.constructor.displayName || renderedElement.type.constructor.name;
      }

      throw new Error('Radium requires each element with interactive styles to have a unique ' + 'key, set using either the ref or key prop. ' + (originalKey ? 'Key "' + originalKey + '" is a duplicate.' : 'Multiple elements have no key specified.') + ' ' + 'Component: "' + componentName + '". ' + (elementName ? 'Element: "' + elementName + '".' : ''));
    }

    existingKeyMap[key] = true;
    return key;
  };

  return getKey;
};

var _setStyleState = function _setStyleState(component, key, stateKey, value) {
  if (!component._radiumIsMounted) {
    return;
  }

  var existing = (0, _getRadiumStyleState["default"])(component);
  var state = {
    _radiumStyleState: _objectSpread({}, existing)
  };
  state._radiumStyleState[key] = _objectSpread({}, state._radiumStyleState[key]);
  state._radiumStyleState[key][stateKey] = value;
  component._lastRadiumState = state._radiumStyleState;
  component.setState(state);
};

var _runPlugins = function _runPlugins(_ref4) {
  var component = _ref4.component,
      config = _ref4.config,
      existingKeyMap = _ref4.existingKeyMap,
      props = _ref4.props,
      renderedElement = _ref4.renderedElement;

  // Don't run plugins if renderedElement is not a simple ReactDOMElement or has
  // no style.
  if (!_react["default"].isValidElement(renderedElement) || typeof renderedElement.type !== 'string' || !props.style) {
    return props;
  }

  var newProps = props;
  var plugins = config.plugins || DEFAULT_CONFIG.plugins;
  var componentName = component.constructor.displayName || component.constructor.name;

  var getKey = _buildGetKey({
    renderedElement: renderedElement,
    existingKeyMap: existingKeyMap,
    componentName: componentName
  });

  var getComponentField = function getComponentField(key) {
    return component[key];
  };

  var getGlobalState = function getGlobalState(key) {
    return globalState[key];
  };

  var componentGetState = function componentGetState(stateKey, elementKey) {
    return (0, _getState["default"])(component.state, elementKey || getKey(), stateKey);
  };

  var setState = function setState(stateKey, value, elementKey) {
    return _setStyleState(component, elementKey || getKey(), stateKey, value);
  };

  var addCSS = function addCSS(css) {
    var styleKeeper = component._radiumStyleKeeper;

    if (!styleKeeper) {
      if (__isTestModeEnabled) {
        return {
          remove: function remove() {}
        };
      }

      throw new Error('To use plugins requiring `addCSS` (e.g. keyframes, media queries), ' + 'please wrap your application in the StyleRoot component. Component ' + 'name: `' + componentName + '`.');
    }

    return styleKeeper.addCSS(css);
  };

  var newStyle = props.style;
  plugins.forEach(function (plugin) {
    var result = plugin({
      ExecutionEnvironment: _exenv["default"],
      addCSS: addCSS,
      appendImportantToEachValue: _appendImportantToEachValue["default"],
      componentName: componentName,
      config: config,
      cssRuleSetToString: _cssRuleSetToString["default"],
      getComponentField: getComponentField,
      getGlobalState: getGlobalState,
      getState: componentGetState,
      hash: _hash["default"],
      mergeStyles: _mergeStyles.mergeStyles,
      props: newProps,
      setState: setState,
      isNestedStyle: _mergeStyles.isNestedStyle,
      style: newStyle
    }) || {};
    newStyle = result.style || newStyle;
    newProps = result.props && Object.keys(result.props).length ? _objectSpread({}, newProps, result.props) : newProps;
    var newComponentFields = result.componentFields || {};
    Object.keys(newComponentFields).forEach(function (fieldName) {
      component[fieldName] = newComponentFields[fieldName];
    });
    var newGlobalState = result.globalState || {};
    Object.keys(newGlobalState).forEach(function (key) {
      globalState[key] = newGlobalState[key];
    });
  });

  if (newStyle !== props.style) {
    newProps = _objectSpread({}, newProps, {
      style: newStyle
    });
  }

  return newProps;
}; // Wrapper around React.cloneElement. To avoid processing the same element
// twice, whenever we clone an element add a special prop to make sure we don't
// process this element again.


var _cloneElement = function _cloneElement(renderedElement, newProps, newChildren) {
  // Only add flag if this is a normal DOM element
  if (typeof renderedElement.type === 'string') {
    newProps = _objectSpread({}, newProps, {
      'data-radium': true
    });
  }

  return _react["default"].cloneElement(renderedElement, newProps, newChildren);
}; //
// The nucleus of Radium. resolveStyles is called on the rendered elements
// before they are returned in render. It iterates over the elements and
// children, rewriting props to add event handlers required to capture user
// interactions (e.g. mouse over). It also replaces the style prop because it
// adds in the various interaction styles (e.g. :hover).
//

/* eslint-disable max-params */


_resolveStyles5 = function resolveStyles(component, renderedElement) {
  var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DEFAULT_CONFIG;
  var existingKeyMap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var shouldCheckBeforeResolve = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  var extraStateKeyMap = arguments.length > 5 ? arguments[5] : undefined;

  // The extraStateKeyMap is for determining which keys should be erased from
  // the state (i.e. which child components are unmounted and should no longer
  // have a style state).
  if (!extraStateKeyMap) {
    var state = (0, _getRadiumStyleState["default"])(component);
    extraStateKeyMap = Object.keys(state).reduce(function (acc, key) {
      // 'main' is the auto-generated key when there is only one element with
      // interactive styles and if a custom key is not assigned. Because of
      // this, it is impossible to know which child is 'main', so we won't
      // count this key when generating our extraStateKeyMap.
      if (key !== 'main') {
        acc[key] = true;
      }

      return acc;
    }, {});
  }

  if (Array.isArray(renderedElement) && !renderedElement.props) {
    var elements = renderedElement.map(function (element) {
      // element is in-use, so remove from the extraStateKeyMap
      if (extraStateKeyMap) {
        var _key5 = (0, _getStateKey["default"])(element);

        delete extraStateKeyMap[_key5];
      } // this element is an array of elements,
      // so return an array of elements with resolved styles


      return _resolveStyles5(component, element, config, existingKeyMap, shouldCheckBeforeResolve, extraStateKeyMap).element;
    });
    return {
      extraStateKeyMap: extraStateKeyMap,
      element: elements
    };
  } // ReactElement


  if (!renderedElement || // Bail if we've already processed this element. This ensures that only the
  // owner of an element processes that element, since the owner's render
  // function will be called first (which will always be the case, since you
  // can't know what else to render until you render the parent component).
  renderedElement.props && renderedElement.props['data-radium'] || // Bail if this element is a radium enhanced element, because if it is,
  // then it will take care of resolving its own styles.
  shouldCheckBeforeResolve && !_shouldResolveStyles(renderedElement)) {
    return {
      extraStateKeyMap: extraStateKeyMap,
      element: renderedElement
    };
  }

  var children = renderedElement.props.children;

  var newChildren = _resolveChildren({
    children: children,
    component: component,
    config: config,
    existingKeyMap: existingKeyMap,
    extraStateKeyMap: extraStateKeyMap
  });

  var newProps = _resolveProps({
    component: component,
    config: config,
    existingKeyMap: existingKeyMap,
    extraStateKeyMap: extraStateKeyMap,
    props: renderedElement.props
  });

  newProps = _runPlugins({
    component: component,
    config: config,
    existingKeyMap: existingKeyMap,
    props: newProps,
    renderedElement: renderedElement
  }); // If nothing changed, don't bother cloning the element. Might be a bit
  // wasteful, as we add the sentinel to stop double-processing when we clone.
  // Assume benign double-processing is better than unneeded cloning.

  if (newChildren === children && newProps === renderedElement.props) {
    return {
      extraStateKeyMap: extraStateKeyMap,
      element: renderedElement
    };
  }

  var element = _cloneElement(renderedElement, newProps !== renderedElement.props ? newProps : {}, newChildren);

  return {
    extraStateKeyMap: extraStateKeyMap,
    element: element
  };
};
/* eslint-enable max-params */
// Only for use by tests


if (process.env.NODE_ENV !== 'production') {
  _resolveStyles5.__clearStateForTests = function () {
    globalState = {};
  };

  _resolveStyles5.__setTestMode = function (isEnabled) {
    __isTestModeEnabled = isEnabled;
  };
}

var _default = _resolveStyles5;
exports["default"] = _default;