class BaseWidget{
    constructor(wrapperElement, initialValue){
        const thisWidget = this

        thisWidget.dom = {};
        thisWidget.dom.wrapper = wrapperElement;

        thisWidget.value = initialValue;
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
      return !isNaN(value)
    }    

    renderValue(){
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