/* eslint-disable no-unused-vars */
import { select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DataPicker.js';
import HourPicker from './HourPicker.js'; 

class Booking {
  constructor(element) {
    const thisBooking = this;
  
    this.element = element;
    this.render();
    this.initWidgets();
    thisBooking.getData();
  }

  getDate(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    console.log('getData params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.booking
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.event
                                     + '?' + params.eventsRepeat.join('&'),
    };

    // console.log('getData urls' , urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
        .then(function(allResponses){
          const bookingsResponse = allResponses[0];
          const eventsCurrentResponse = allResponses[1];
          const eventsRepeatResponse = allResponses[2];
          return Promise.all([
            bookingsResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json(),
          ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          //console.log(bookings);
          //console.log(eventsCurrent);
         //console.log(eventsRepeat);
          thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.data, item.hour, item.duration, item.table);
    }

    console.log('thisBooking.booked', thisBooking.booked);
  }

  makeBooking(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    if(typeof thisBooking.booked[date] [startHour]== 'undefined'){
      thisBooking.booked[date][startHour] = [];
    }

    thisBooking.booked[date][hour][startHour].push(table);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock++){
      console.log('loop', hourBlock);
    }
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
