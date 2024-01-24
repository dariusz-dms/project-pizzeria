"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
var BaseWidget = /*#__PURE__*/function () {
  function BaseWidget(wrapperElement, initialValue) {
    _classCallCheck(this, BaseWidget);
    var thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.value = initialValue;
  }
  _createClass(BaseWidget, [{
    key: "setValue",
    value: function setValue(value) {
      var thisWidget = this;
      var newValue = parseInt(value);
      if (newValue !== thisWidget.value && thisWidget.isValid(newValue)) {
        thisWidget.value = newValue;
        thisWidget.announce();
        if (thisWidget.product && typeof thisWidget.product.processOrder === 'function') {
          thisWidget.product.processOrder();
        }
      }
      thisWidget.renderValue();
      thisWidget.dom.input.value = thisWidget.value;
    }
  }, {
    key: "parseValue",
    value: function parseValue(value) {
      return parseInt(value);
    }
  }, {
    key: "isValid",
    value: function isValid(value) {
      return !isNaN(value) && value >= 1 && value <= 10;
    }
  }, {
    key: "renderValue",
    value: function renderValue() {
      var thisWidget = this;
      thisWidget.dom.wrapper.innerHTML = thisWidget.value;
    }
  }, {
    key: "announce",
    value: function announce() {
      var thisWidget = this;
      var event = new Event('updated', {
        bubbles: true
      });
      thisWidget.dom.wrapper.dispatchEvent(event);
    }
  }]);
  return BaseWidget;
}();
var _default = exports["default"] = BaseWidget;