import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DataPicker.js';
import HourPicker from './HourPicker.js'; 

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
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.bookingDate = thisBooking.dom.wrapper.querySelector(select.widgets.bookingDate);
    thisBooking.dom.bookingHour = thisBooking.dom.wrapper.querySelector(select.widgets.bookingHour);
    thisBooking.dom.bookingHourOutput = thisBooking.dom.wrapper.querySelector('[data-booking-hour-output]');
    thisBooking.hourSlider = thisBooking.dom.wrapper.querySelector('[data-hour-slider]');
  }
  
  initWidgets() {
    const thisBooking = this;

    console.log('initWidgets:', thisBooking);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.datePicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.dom.bookingDate.innerHTML = thisBooking.datePicker.value;
    thisBooking.dom.bookingHour.innerHTML = thisBooking.hourPicker.value;
  }
}

export default Booking;
