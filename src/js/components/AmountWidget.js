import {settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
    constructor(element, product) {
      super(element, settings.amountWidget.defaultValue);
      const thisWidget = this;
      thisWidget.getElements();
      thisWidget.initActions();
      thisWidget.product = product;
      thisWidget.correctValue = 1;
      thisWidget.value = thisWidget.correctValue;
      thisWidget.setValue(this.Widget.dom.input.value ? this.Widget.dom.input.value : settings.amountWidget.defaultValue);
    
      console.log('AmountWidget:', thisWidget);
      //console.log('constructor arguments:' element)
    
    }
  
    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      if (newValue != thisWidget.value && thisWidget.isvalid(newValue));
          thisWidget.value = thisWidget.correctValue;
          thisWidget.announce();

          thisWidget.dom.input.value = thisWidget.value;
          if (thisWidget.product && typeof thisWidget.product.processOrder === 'function') {
            thisWidget.product.processOrder();
          }
        
    thisWidget.renderValue();
    }
  
    parseValue(value){
      return parseInt(value);

    }

    isValid(value){
      return !isNaN(value) >= 1 && value <= 10 
    }
    
    renderValue(){
        const thisWidget = this;

        thisWidget.dom.input.value = thisWidget.value;
    }

    initActions() {
      const thisWidget = this;
      this.Widget.dom.input.addEventListener('change', () => {
        const value = this.Widget.dom.input.value !== '' ? this.Widget.dom.input.value : thisWidget.value;
        thisWidget.setValue(value);
      });
      this.Widget.dom.linkDecrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = this.Widget.dom.input.value !== '' ? this.Widget.dom.input.value - 1 : thisWidget.value - 1;
        thisWidget.setValue(newValue);
      });
      this.Widget.dom.linkIncrease.addEventListener('click', (event) => {
        event.preventDefault();
        const newValue = this.Widget.dom.input.value !== '' ? parseInt(this.Widget.dom.input.value) + 1 : thisWidget.value + 1;
        thisWidget.setValue(newValue);
      });
    }
  
    getElements() {
      const thisWidget = this;

      this.Widget.dom.input = this.Widget.dom.wrapper.querySelector(select.widgets.amount.input);
      this.Widget.dom.linkDecrease = this.Widget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      this.Widget.dom.linkIncrease = this.Widget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
      thisWidget.amountInput = this.Widget.dom.wrapper.querySelector('.amount');
    }
  
    announce() {
      const thisWidget = this;
      const event = new Event('updated', {
        bubbles: true,
      });
      thisWidget.dom.wrapper.dispatchEvent(event);
    }
  }
  export default AmountWidget;