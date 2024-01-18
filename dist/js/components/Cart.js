import {settings, select, classNames, templates} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';
import menuProduct from './Product.js';

class Cart {
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.totalPrice = 0; // Dodaj inicjalizację totalPrice
    thisCart.subtotalPrice = 0; // Dodaj inicjalizację subtotalPrice
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
      if (menuProduct && menuProduct.id) {
        const generatedHTML = templates.cartProduct(menuProduct);
        const generatedDOM = utils.createDOMFromHTML(generatedHTML);
        thisCart.dom.productList.appendChild(generatedDOM);
        const cartProduct = new CartProduct(menuProduct, generatedDOM);
        cartProduct.product = thisCart;
        thisCart.products.push(cartProduct);
        thisCart.update();
      } else {
        console.error('Product is missing id:', menuProduct);
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
      
      thisCart.totalPrice = totalPrice;
      thisCart.dom.totalPrice.innerHTML = totalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
  
      let subtotalPrice = 0;
      thisCart.products.forEach((product) => {
        subtotalPrice += product.price;
      });

      thisCart.subtotalPrice = subtotalPrice;
  
      if (thisCart.products.length === 0) {
        thisCart.dom.deliveryFee.innerHTML = 0;
        thisCart.dom.totalPrice.innerHTML = 0;
        thisCart.dom.subtotalPrice.innerHTML = 0;
      } else {
        const totalDeliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.dom.deliveryFee.innerHTML = totalDeliveryFee;
  
        const totalCartPrice = thisCart.subtotalPrice + totalDeliveryFee;
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
  export default Cart;