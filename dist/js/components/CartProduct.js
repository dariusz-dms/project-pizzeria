import { select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct {
  constructor(menuProduct, element) {
    const thisCartProduct = this;

    if (menuProduct) {
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = { ...menuProduct.params }; // Używam spread operatora do klonowania obiektu

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
  }

  getData() {
    const thisCartProduct = this;

    const productData = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: { ...thisCartProduct.params }, // Używam spread operatora do klonowania obiektu
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
  }

  initAmountWidget() {
    const thisCartProduct = this;

    thisCartProduct.amountWidgetElem = thisCartProduct.dom.amountWidget;
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.amountWidgetElem);

    thisCartProduct.priceSingle = parseFloat(thisCartProduct.priceSingle);
    thisCartProduct.amount = parseInt(thisCartProduct.amount);

    thisCartProduct.amountWidgetElem.addEventListener('updated', () => {
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amountWidget.value;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
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

export default CartProduct;
