class BaseWidget {
    constructor(wrapperElement, initialValue) {
      const thisWidget = this;
  
      thisWidget.dom = {};
      thisWidget.dom.wrapper = wrapperElement;
  
      thisWidget.value = initialValue;
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
  
    parseValue(value) {
      return parseInt(value);
    }
  
    isValid(value){
        return !isNaN(value) && value >= 1 && value <= 10; 
      }
  
    renderValue() {
      const thisWidget = this;
  
      thisWidget.dom.wrapper.innerHTML = thisWidget.value;
    }
  
    announce() {
      const thisWidget = this;
      const event = new Event('updated', {
        bubbles: true,
      });
      thisWidget.dom.wrapper.dispatchEvent(event);
    }
  }
  
  export default BaseWidget;
  