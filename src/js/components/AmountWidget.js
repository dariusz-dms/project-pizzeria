import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
    constructor(element, product) {
      super(element, settings.amountWidget.defaultValue);
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.initActions();
      thisWidget.product = product;
      thisWidget.correctValue = 1;
      thisWidget.value = thisWidget.correctValue;
      thisWidget.setValue(thisWidget.dom.input.value ? thisWidget.dom.input.value : settings.amountWidget.defaultValue);
    
      // console.log('AmountWidget:', thisWidget);
    
    }
  
  
    setValue(value) {
      const thisWidget = this;
  
      const newValue = parseInt(value);
  
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
  
    parseValue(value){
      return parseInt(value);

    }

    isValid(value){
      return !isNaN(value) && value >= 1 && value <= 10; 
    }
    
    renderValue(){
        const thisWidget = this;

        thisWidget.dom.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', () => {
        const value = thisWidget.dom.input.value !== '' ? thisWidget.dom.input.value : thisWidget.value;
        thisWidget.setValue(value);
    });
    
    thisWidget.dom.linkDecrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = thisWidget.dom.input.value !== '' ? thisWidget.dom.input.value - 1 : thisWidget.value - 1;
        thisWidget.setValue(newValue);
    });
    
    thisWidget.dom.linkIncrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = thisWidget.dom.input.value !== '' ? parseInt(thisWidget.dom.input.value) + 1 : thisWidget.value + 1;
        thisWidget.setValue(newValue);
    });
    }
  
    getElements() {
      const thisWidget = this;

      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.amountInput = thisWidget.dom.wrapper.querySelector('.amount');
    }
  
    }
  export default AmountWidget;