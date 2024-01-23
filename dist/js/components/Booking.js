import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.element = element;
    thisBooking.render();
    thisBooking.initWidgets();
    thisBooking.getDate();
    thisBooking.initTables();
  }

  getDate() {
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
      booking: settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
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

    thisBooking.updateDOM();
    thisBooking.hourPicker.initPlugin();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] === 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;
  
    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);
  
    let allAvailable = true;
  
    if (thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour]) {
      allAvailable = false;
    }
  
    for (const table of thisBooking.dom.tables) {
      const tableId = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
  
      if (!allAvailable && thisBooking.booked[thisBooking.date] && thisBooking.booked[thisBooking.date][thisBooking.hour] && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
  
      const reservedInEvents = thisBooking.events.some(event =>
        event.table === tableId &&
        utils.dateToStr(event.date) === thisBooking.date &&
        utils.hourToNumber(event.hour) <= thisBooking.hour &&
        utils.hourToNumber(event.hour) + event.duration > thisBooking.hour
      );
  
      if (reservedInEvents) {
        table.classList.add(classNames.booking.tableBooked);
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

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);
    console.log('Floor plan element:', thisBooking.dom.floorPlan);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBooking = this;

    console.log('initWidgets:', thisBooking);

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.hourPicker.addEventListener('valueChanged', function () {
      thisBooking.updateDOM();
    });
  }

  initTables() {
    const thisBooking = this;

    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);

    if (thisBooking.dom.floorPlan) {
      thisBooking.dom.floorPlan.addEventListener('click', function (event) {
        thisBooking.handleTableClick(event);
      });
    } else {
      console.error('Floor plan element not found!');
    }
  }

  handleTableClick(event) {
    const thisBooking = this;

    console.log('handleTableClick is called!', event.target);

    const clickedElement = event.target;

    if (clickedElement.classList.contains(classNames.booking.table)) {
      const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        const tableIdNumber = parseInt(tableId);

        if (thisBooking.selectedTable === tableIdNumber) {
          thisBooking.selectedTable = null;
          clickedElement.classList.remove(classNames.booking.tableSelected);
        } else {
          thisBooking.removeSelected();
          thisBooking.selectedTable = tableIdNumber;
          clickedElement.classList.add(classNames.booking.tableSelected);
        }
      }
    }
  }

  removeSelected() {
    const thisBooking = this;
    const selectedTables = thisBooking.dom.floorPlan.querySelectorAll('.' + classNames.booking.tableSelected);
    for (let selectedTable of selectedTables) {
      selectedTable.classList.remove(classNames.booking.tableSelected);
    }
  }
}

export default Booking;
