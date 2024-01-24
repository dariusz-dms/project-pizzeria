"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _settings = require("../settings.js");
var _BaseWidget2 = _interopRequireDefault(require("./BaseWidget.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : String(i); }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
var AmountWidget = /*#__PURE__*/function (_BaseWidget) {
  _inherits(AmountWidget, _BaseWidget);
  function AmountWidget(element, product) {
    var _this;
    _classCallCheck(this, AmountWidget);
    _this = _callSuper(this, AmountWidget, [element, _settings.settings.amountWidget.defaultValue]);
    var thisWidget = _assertThisInitialized(_this);
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.product = product;
    thisWidget.correctValue = 1;
    thisWidget.value = thisWidget.correctValue;
    thisWidget.setValue(thisWidget.dom.input.value ? thisWidget.dom.input.value : _settings.settings.amountWidget.defaultValue);

    // console.log('AmountWidget:', thisWidget);
    return _this;
  }
  _createClass(AmountWidget, [{
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
      thisWidget.dom.input.value = thisWidget.value;
    }
  }, {
    key: "initActions",
    value: function initActions() {
      var thisWidget = this;
      thisWidget.dom.input.addEventListener('change', function () {
        var value = thisWidget.dom.input.value !== '' ? thisWidget.dom.input.value : thisWidget.value;
        thisWidget.setValue(value);
      });
      thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        var newValue = thisWidget.dom.input.value !== '' ? thisWidget.dom.input.value - 1 : thisWidget.value - 1;
        thisWidget.setValue(newValue);
      });
      thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        var newValue = thisWidget.dom.input.value !== '' ? parseInt(thisWidget.dom.input.value) + 1 : thisWidget.value + 1;
        thisWidget.setValue(newValue);
      });
    }
  }, {
    key: "getElements",
    value: function getElements() {
      var thisWidget = this;
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(_settings.select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(_settings.select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(_settings.select.widgets.amount.linkIncrease);
      thisWidget.amountInput = thisWidget.dom.wrapper.querySelector('.amount');
    }
  }]);
  return AmountWidget;
}(_BaseWidget2["default"]);
var _default = exports["default"] = AmountWidget;