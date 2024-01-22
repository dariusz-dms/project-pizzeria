import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js'; 

class Booking {
  constructor(element) {
    const thisBooking = this;
  
    this.element = element;
    this.render();
    this.initWidgets();
    thisBooking.getDate();
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

    console.log('getDate params', params);

    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
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

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    if (bookings && bookings.data && Array.isArray(bookings.data)) {
    for (let item of bookings.data) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
  }
    
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }


      //console.log('thisBooking.booked', thisBooking.booked);
      thisBooking.updateDOM();
  }

  makeBooking(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      //console.log('loop', hourBlock);
    
      
      if(typeof thisBooking.booked[date] [hourBlock]== 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = true;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined',
      
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAtrribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
    }

    if(
      !allAvailable
      &&
      thisBooking.booked[thisBooking.date][this.Booking.hour].includes(tableId) > -1
    ){
      table.classList.add(classNames.booking.tableBooked);
    } else {
      table.classList.remove(classNames.booking.tableBooked);
      }
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
    
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }
  
  initWidgets() {
    const thisBooking = this;

    console.log('initWidgets:', thisBooking);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });
  }
}
export default Booking;
