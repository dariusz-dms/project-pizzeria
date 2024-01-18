import {settings, select} from '../settings.js';

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
  export default AmountWidget;