/* eslint-disable no-undef */

  export const select = {
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
      floorPlan: '.floor-plan',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    nav: {
      links: '.main-nav a',
    },
  };
  export const classNames = {
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
      tableSelected: 'selected',
    },
    nav: {
      active: 'active',
    },
    pages: {
      active: 'active',
    },
  };
  export const settings = {
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
  export const templates = {
    menuProduct: null,
    cartProduct: null,
    bookingWidget: null,
  };
  export const getTemplate = (templateSelector) => {
    const templateElement = document.querySelector(templateSelector);
    if (templateElement) {
      return Handlebars.compile(templateElement.innerHTML);
    } else {
      console.error(`Error: Template ${templateSelector} not found.`);
      return null;
    }
  };

   templates.menuProduct = getTemplate(select.templateOf.menuProduct);
   templates.cartProduct = getTemplate(select.templateOf.cartProduct);
   templates.bookingWidget = getTemplate(select.templateOf.bookingWidget);

   export default settings;