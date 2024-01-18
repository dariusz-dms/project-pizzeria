import {select, templates} from '../settings.js' ;
import AmountWidget from './AmountWidget.js';

class Booking {
    constructor(element) {
      this.element = element;
      this.render();
      this.initWidgets();
    }
  
    render() {
      const thisBooking = this;
      console.log('render:', thisBooking);
      const generatedHTML = templates.bookingWidget();
      thisBooking.dom = {};
      thisBooking.dom.wrapper = thisBooking.element;
      thisBooking.dom.wrapper.innerHTML = generatedHTML;
      thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
      thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
      
    }
  
    initWidgets() {
      const thisBooking = this;
  
      console.log('initWidgets:', thisBooking);
  
      thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
      thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    }
  }

  export default Booking;