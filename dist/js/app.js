"use strict";

var _settings = require("./settings.js");
var _Product = _interopRequireDefault(require("./components/Product.js"));
var _Booking = _interopRequireDefault(require("./components/Booking.js"));
var _Cart = _interopRequireDefault(require("./components/Cart.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
document.addEventListener('DOMContentLoaded', function () {
  var orderLink = document.querySelector('a[href="#order"]');
  var bookingLink = document.querySelector('a[href="#booking"]');
  var orderSection = document.getElementById('order');
  var bookingSection = document.getElementById('booking');
  orderLink.addEventListener('click', function () {
    orderSection.style.display = 'block';
    bookingSection.style.display = 'none';
  });
  bookingLink.addEventListener('click', function () {
    orderSection.style.display = 'none';
    bookingSection.style.display = 'block';
  });
});
var app = {
  init: function init() {
    var thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', _settings.classNames);
    console.log('settings:', _settings.settings);
    console.log('templates:', _settings.templates);
    thisApp.initData();
  },
  initData: function initData() {
    var thisApp = this;
    thisApp.data = {};
    var url = "".concat(_settings.settings.db.url, "/").concat(_settings.settings.db.products);
    fetch(url).then(function (rawResponse) {
      return rawResponse.json();
    }).then(function (parsedResponse) {
      console.log('parsedResponse', parsedResponse);
      thisApp.data.products = parsedResponse;
      thisApp.initMenu();
      thisApp.initCart();
      thisApp.initBooking();
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    });
  },
  initMenu: function initMenu() {
    var thisApp = this;
    console.log('thisApp.data:', thisApp.data);
    for (var productId in thisApp.data.products) {
      var productData = thisApp.data.products[productId];
      new _Product["default"](productData.id, productData);
    }
  },
  initCart: function initCart() {
    var thisApp = this;
    var cartElem = document.querySelector(_settings.select.containerOf.cart);
    thisApp.cart = new _Cart["default"](cartElem);
    thisApp.productList = document.querySelector(_settings.select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      thisApp.cart.add(event.detail.product);
    });
  },
  initBooking: function initBooking() {
    var thisApp = this;
    var bookingContainer = document.querySelector(_settings.select.containerOf.booking);
    thisApp.booking = new _Booking["default"](bookingContainer);
  }
};
app.init();