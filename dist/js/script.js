/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars
{
  'use strict';
const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
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
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
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
  };
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
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
  };
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  class Product{
    constructor(id, data){
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
    renderInMenu(){
      const thisProduct = this;
      /* generete HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }
    
    initAccordion() {
      const thisProduct = this;
    
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    
      /* START: add event listener to clickable trigger on event click */
      clickableTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
    
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
    
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct !== null && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
    
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm() {
      const thisProduct = this;
    
      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    
      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }
    
      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!option.default) {
              price += parseFloat(option.price);
            }
            // Show image if option is selected
            if (thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`)) {
              thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`).classList.add('active');
            }
          } 
            else {
            if (option.default) {
              price -= option.price;
            }
            // Hide image if option is not selected
            if (thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`)) {
              thisProduct.imageWrapper.querySelector(`.${paramId}-${optionId}`).classList.remove('active');
            }  
          }
        }
      }
     // multiply price by amount 
     thisProduct.priceSingle = price;
     price *= thisProduct.amountWidget.value 
     // update calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    initAmountWidget() {
      const thisProduct = this;
  
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, thisProduct);
      thisProduct.amountWidgetElem.addEventListener('updated', function () {
        thisProduct.processOrder();
      });
    }
    getElements() {
      const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    
    console.log('Form:', thisProduct.form);
    console.log('Form Inputs:', thisProduct.formInputs);
  }
    addToCart() {
      const thisProduct = this;
      const cartProductSummary = thisProduct.prepareCartProduct();
      app.cart.add(cartProductSummary);
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
    
      // for very category (param)
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        params[paramId] = {
          label: param.label,
          options: {}
        }
    
        // for every option in this category
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          if(optionSelected) {
            // option is selected!
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
          thisWidget.product.processOrder();
        }
      } else {
        thisWidget.input.value = thisWidget.value;
      }
    }
  
    initActions() {
      const thisWidget = this;
  
      thisWidget.input.addEventListener('change', function () {
        const value = thisWidget.input.value !== '' ? thisWidget.input.value : thisWidget.value;
        thisWidget.setValue(value);
      });
  
      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        const newValue = thisWidget.input.value !== '' ? thisWidget.input.value - 1 : thisWidget.value - 1;
        thisWidget.setValue(newValue);
      });
  
      thisWidget.linkIncrease.addEventListener('click', function (event) {
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
    }
  
    initActions() {
      const thisCart = this;
  
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
    }
  
    add(menuProduct) {
      const thisCart = this;
  
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
  
      thisCart.dom.productList.appendChild(generatedDOM);
  
      // Dodaj właściwy obiekt CartProduct do listy produktów w koszyku
      const cartProduct = new CartProduct(menuProduct, generatedDOM);
      thisCart.products.push(cartProduct);
  
      console.log('Adding product:', cartProduct);
  
      thisCart.update(); // Wywołaj metodę aktualizacji koszyka po dodaniu produktu
    }
  
    update() {
      const thisCart = this;
      let totalPrice = 0;
      let totalNumber = 0;
    
      thisCart.products.forEach(product => {
        totalPrice += product.price;
        totalNumber += product.amount;
      });
    
      const cartTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      const cartTotalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    
      cartTotalPrice.innerHTML = totalPrice;
      cartTotalNumber.innerHTML = totalNumber;
    
      // Obliczanie i aktualizacja sumy cen wszystkich produktów w koszyku
      let subtotalPrice = 0;
      thisCart.products.forEach(product => {
        subtotalPrice += product.price;
      });
    
      // Aktualizacja wyświetlania sumy cen wszystkich produktów w koszyku
      const cartSubtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      cartSubtotalPrice.innerHTML = subtotalPrice;
    
      // Obliczanie i aktualizacja całkowitej ceny (wraz z opłatą za dostawę)
      const cartTotalPriceWithDelivery = subtotalPrice + settings.cart.defaultDeliveryFee;
      const cartTotalPriceElements = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      cartTotalPriceElements.forEach(element => {
        element.innerHTML = cartTotalPriceWithDelivery;
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
      console.log('thisCartProduct:', thisCartProduct);
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
    }
      
    initAmountWidget() {
      const thisCartProduct = this;
  
      thisCartProduct.amountWidgetElem = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.amountWidgetElem, thisCartProduct);
  
      thisCartProduct.amountWidgetElem.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;
  
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  
        // Dodaj wywołanie metody update w klasie Cart po zmianie ilości produktów
        thisCartProduct.product.update();
      });
    }

    updatePrice() {
      const thisCartProduct = this;
  
      // Przelicz cenę produktu
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  
      // Dodaj wywołanie metody update w klasie Cart po aktualizacji ceny
      thisCartProduct.product.update();
    }
  }
  const app = {
    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
  
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
    initData: function () {
      const thisApp = this;
  
      thisApp.data = dataSource;
    },
  
    initMenu: function () {
      const thisApp = this;
  
      console.log('thisApp.data:', thisApp.data);
  
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
  
    initCart: function(){
      const thisApp = this;
  
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    }
  };
  app.init();
}