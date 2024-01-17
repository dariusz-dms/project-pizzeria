import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Booking from './components/Booking.js';
import Cart from './components/Cart.js';
import AmountWidget from './components/AmountWidget.js';
import CartProduct from './components/CartProduct.js';
import utils from './utils.js';

document.addEventListener('DOMContentLoaded', function () {
  const orderLink = document.querySelector('a[href="#order"]');
  const bookingLink = document.querySelector('a[href="#booking"]');
  const orderSection = document.getElementById('order');
  const bookingSection = document.getElementById('booking');

  orderLink.addEventListener('click', function () {
    orderSection.style.display = 'block';
    bookingSection.style.display = 'none';
  });

  bookingLink.addEventListener('click', function () {
    orderSection.style.display = 'none';
    bookingSection.style.display = 'block';
  });

});

  const app = {
    init() {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
      thisApp.initBooking();
    },
    initMenu() {
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for (const productId in thisApp.data.products) {
        const productData = thisApp.data.products[productId];
        new Product(productData.id, productData);
      }
    },
    initData() {
      const thisApp = this;

      thisApp.data = {};

      const url = `${settings.db.url}/${settings.db.products}`;

      fetch(url)
        .then((rawResponse) => rawResponse.json())
        .then((parsedResponse) => {
          console.log('parsedResponse', parsedResponse);

          thisApp.data.products = parsedResponse;

          thisApp.initMenu();

          console.log('thisApp.data', JSON.stringify(thisApp.data));
        });
    },
    initCart() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);
    
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    },

    initBooking() {
      const thisApp = this;
      const bookingContainer = document.querySelector(select.containerOf.booking);
      thisApp.booking = new Booking(bookingContainer);
    },
  };
  
  app.init();
