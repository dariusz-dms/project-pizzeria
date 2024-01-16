/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
      bookingWidget: '#template-booking-widget',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
      pages: '#pages',
      booking: '.booking-wrapper',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
      datePicker: {
        wrapper: '.date-picker',
        input: 'input[name="date"]',
      },
      hourPicker: {
        wrapper: '.hour-picker',
        input: 'input[type="range"]',
        output: '.output',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: '.cart__total-number',
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    booking: {
      peopleAmount: '.people-amount',
      hoursAmount: '.hours-amount',
      tables: '.floor-plan .table',
    },
    nav: {
      links: '.main-nav a',
    },
  };
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
    booking: {
      loading: 'loading',
      tableBooked: 'booked',
    },
    nav: {
      active: 'active',
    },
    pages: {
      active: 'active',
    },
  };
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
     hours: {
      open: 12,
      close: 24,
    },
    datePicker: {
      maxDaysInFuture: 14,
    },
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
      bookings: 'bookings',
      events: 'events',
      dateStartParamKey: 'date_gte',
      dateEndParamKey: 'date_lte',
      notRepeatParam: 'repeat=false',
      repeatParam: 'repeat_ne=false',
    },
    booking: {
      loading: 'loading',
      tableBooked: 'booked',
      tableIdAttribute: 'data-table',
    },
    nav: {
      active: 'active',
    },
    pages: {
      active: 'active',
    },
  };
  const templates = {
    menuProduct: null,
    cartProduct: null,
    bookingWidget: null,
  };

  const getTemplate = (templateSelector) => {
    const templateElement = document.querySelector(templateSelector);
    if (templateElement) {
      return Handlebars.compile(templateElement.innerHTML);
    } else {
      console.error(`Error: Template ${templateSelector} not found.`);
      return null;
    };}
  templates.menuProduct = getTemplate(select.templateOf.menuProduct);
  templates.cartProduct = getTemplate(select.templateOf.cartProduct);
  templates.bookingWidget = getTemplate(select.templateOf.bookingWidget);
  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.prepareCartProduct();
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);

      console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    initAccordion() {
      const thisProduct = this;
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      clickableTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }

    initOrderForm() {
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', (event) => {
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (const input of thisProduct.formInputs) {
        input.addEventListener('change', () => {
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', (event) => {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      let { price } = thisProduct.data;
      for (const paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        for (const optionId in param.options) {
          const option = param.options[optionId];
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!option.default) {
              price += parseFloat(option.price);
            }
          } else if (option.default) {
            price -= option.price;
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, thisProduct);
      thisProduct.amountWidgetElem.addEventListener('updated', () => {
        thisProduct.processOrder();
      });
    }

    getElements() {
      const thisProduct = this;
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    addToCart() {
      const thisProduct = this;
      const cartProductSummary = thisProduct.prepareCartProduct();
      app.cart.add(cartProductSummary);

      thisProduct.form.reset();
      thisProduct.amountWidget.setValue(settings.amountWidget.defaultValue);
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {};
      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      productSummary.params = thisProduct.prepareCartProductParams();
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
      for (const paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for (const optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          if (optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }
  class AmountWidget {
    constructor(element, product) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.product = product;
      thisWidget.correctValue = 1;
      thisWidget.value = thisWidget.correctValue;
      thisWidget.setValue(thisWidget.input.value ? thisWidget.input.value : settings.amountWidget.defaultValue);
    }

    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      if (!isNaN(newValue) && newValue >= 1 && newValue <= 10) {
        if (thisWidget.correctValue !== newValue) {
          thisWidget.correctValue = newValue;
          thisWidget.value = thisWidget.correctValue;
          thisWidget.announce();
          thisWidget.input.value = thisWidget.value;
          if (thisWidget.product && typeof thisWidget.product.processOrder === 'function') {
            thisWidget.product.processOrder();
          }
        }
      } else {
        thisWidget.input.value = thisWidget.value;
      }
    }

    initActions() {
      const thisWidget = this;
      thisWidget.input.addEventListener('change', () => {
        const value = thisWidget.input.value !== '' ? thisWidget.input.value : thisWidget.value;
        thisWidget.setValue(value);
      });
      thisWidget.linkDecrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = thisWidget.input.value !== '' ? thisWidget.input.value - 1 : thisWidget.value - 1;
        thisWidget.setValue(newValue);
      });
      thisWidget.linkIncrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = thisWidget.input.value !== '' ? parseInt(thisWidget.input.value) + 1 : thisWidget.value + 1;
        thisWidget.setValue(newValue);
      });
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.amountInput = thisWidget.element.querySelector('.amount');
    }

    announce() {
      const thisWidget = this;
      const event = new Event('updated', {
        bubbles: true,
      });
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', (event) => {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', () => {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', (event) => {
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', (event) => {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    validateForm() {
      const thisCart = this;
      let isFormValid = true;

      const phoneInput = thisCart.dom.form.querySelector(select.cart.phone);
      const phoneValue = phoneInput.value.trim();
      if (phoneValue.length < 9) {
        isFormValid = false;
        phoneInput.classList.add('error');
      } else {
        phoneInput.classList.remove('error');
      }

      const addressInput = thisCart.dom.form.querySelector(select.cart.address);
      const addressValue = addressInput.value.trim();
      if (addressValue.length === 0) {
        isFormValid = false;
        addressInput.classList.add('error');
      } else {
        addressInput.classList.remove('error');
      }

      if (thisCart.products.length === 0) {
        isFormValid = false;
      }

      return isFormValid;
    }

    remove(cartProduct) {
      const thisCart = this;
      const index = thisCart.products.indexOf(cartProduct);

      if (index !== -1) {
        thisCart.products.splice(index, 1);
        cartProduct.dom.wrapper.remove();
        thisCart.update();
      }
    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      const cartProduct = new CartProduct(menuProduct, generatedDOM);
      cartProduct.product = thisCart;
      thisCart.products.push(cartProduct);
      thisCart.update();
    }

    update() {
      const thisCart = this;
      let totalPrice = 0;
      let totalNumber = 0;

      thisCart.products.forEach((product) => {
        totalPrice += product.price;
        totalNumber += product.amount;
      });

      thisCart.dom.totalPrice.innerHTML = totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;

      let subtotalPrice = 0;
      thisCart.products.forEach((product) => {
        subtotalPrice += product.price;
      });

      if (thisCart.products.length === 0) {
        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.totalPrice.innerHTML = 0;
        thisCart.dom.subtotalPrice.innerHTML = 0;
      } else {
        const totalDeliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.dom.deliveryFee.innerHTML = totalDeliveryFee;

        const totalCartPrice = subtotalPrice + totalDeliveryFee;
        thisCart.dom.totalPrice.innerHTML = totalCartPrice;
        thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      }

      const subtotalElem = thisCart.dom.wrapper.querySelector('.cart__order-subtotal .cart__order-price-sum strong');
      const deliveryElem = thisCart.dom.wrapper.querySelector('.cart__order-delivery .cart__order-price-sum strong');
      const totalElem = thisCart.dom.wrapper.querySelector('.cart__order-total .cart__order-price-sum strong');

      subtotalElem.innerHTML = subtotalPrice;
      deliveryElem.innerHTML = thisCart.dom.deliveryFee.innerHTML;
      totalElem.innerHTML = thisCart.dom.totalPrice.innerHTML;

      thisCart.dom.wrapper.classList.add('updating');
      setTimeout(() => {
        thisCart.dom.wrapper.classList.remove('updating');
      }, 500);
    }

    sendOrder() {
      const thisCart = this;
      const url = `${settings.db.url}/${settings.db.orders}`;

      const payload = {
        products: [],
        totalNumber: thisCart.dom.totalNumber.innerHTML,
        totalPrice: thisCart.dom.totalPrice.innerHTML,
        subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
        deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      };

      for (const prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, fetchOptions)
        .then((response) => response.json())
        .then((parsedResponse) => {
          console.log('Order sent successfully:', parsedResponse);
        })
        .catch((error) => {
          console.error('Error while sending order:', error);
        });
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getData() {
      const thisCartProduct = this;

      const productData = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };

      return productData;
    }

    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      thisCartProduct.dom.deliveryFee = document.querySelector(select.cart.deliveryFee);
      thisCartProduct.dom.subtotalPrice = document.querySelector(select.cart.subtotalPrice);
      thisCartProduct.dom.totalPrice = document.querySelectorAll(select.cart.totalPrice);
      thisCartProduct.dom.totalNumber = document.querySelector(select.cart.totalNumber);

      thisCartProduct.product = null;
    }

    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.amountWidgetElem, thisCartProduct);

      thisCartProduct.amountWidgetElem.addEventListener('updated', () => {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        if (thisCartProduct.product) {
          thisCartProduct.product.update();
        }
      });
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', (event) => {
        event.preventDefault();
        console.log('Edit button clicked for product:', thisCartProduct);
      });

      thisCartProduct.dom.remove.addEventListener('click', (event) => {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });

      thisCartProduct.dom.wrapper.dispatchEvent(event);

      console.log('Product removed:', thisCartProduct);
    }
  }
 
  import AmountWidget from './AmountWidget.js';
  import { select } from './settings.js';

class Booking {
    constructor(container) {
        this.container = container;
        this.initWidgets();
        this.render();
    }

    initWidgets() {
        this.dom = {};
        this.dom.wrapper = this.container;
        this.dom.wrapper.innerHTML = '<div class="booking-widget">Booking Widget Content</div>';

        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);

        // Inicjalizacja AmountWidget dla "People amount"
        this.amountWidgetPeople = new AmountWidget(this.dom.peopleAmount);

        // Inicjalizacja AmountWidget dla "Hours amount"
        this.amountWidgetHours = new AmountWidget(this.dom.hoursAmount);

        // Tutaj możesz dodać dodatkowe logiki inicjacji widżetów

        // Przykładowe nasłuchiwacze, możesz dostosować je według potrzeb
        this.amountWidgetPeople.init();
        this.amountWidgetHours.init();

        // Możesz dodać inne logiki, jeśli są potrzebne
        console.log('Widgets initialized in Booking');
    }

    render() {
        // Tutaj możesz dodać kod obsługujący generowanie HTML i zmianę zawartości wrappera
        console.log('Booking rendered in container:', this.dom.wrapper);
    }
}

export default Booking;

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
    },
    initBooking: function() {
      const bookingContainerSelector = 'select.containerOf.booking';
      const bookingContainer = document.querySelector(bookingContainerSelector);

      if (bookingContainer) {
          const bookingInstance = new Booking(bookingContainer);
          // Możesz dodać dodatkowe logiki inicjacji lub manipulacji instancją Booking

          console.log('Booking instance initialized:', bookingInstance);
      } else {
          console.error('Booking container not found:', bookingContainerSelector);
      }
  },
  };
  app.init();
}