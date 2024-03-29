import BaseWidget from './BaseWidget.js';
import { select, settings } from '../settings.js';
import utils from '../utils.js';
import RangeSlider from '../../vendor/range-slider.min.js';

class HourPicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, settings.hours.open);
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }

  initPlugin() {
    const thisWidget = this;
    
    if (typeof RangeSlider !== 'undefined') {
      RangeSlider.create(thisWidget.dom.input);
      thisWidget.dom.input.addEventListener('input', function () {
        thisWidget.value = thisWidget.dom.input.value;
        thisWidget.updateDisplayedHour();
        console.log('Input value:', thisWidget.dom.input.value);

        if (typeof thisWidget.updateDOM === 'function') {
          thisWidget.updateDOM();
        }
      });
    } else {
      console.error('RangeSlider is not defined. Make sure you have included the library.');
    }
  }

  parseValue(value) {
    return utils.numberToHour(value);
  }

  isValid() {
    return true;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.output.innerHTML = thisWidget.value;
  }

  updateDisplayedHour() {
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.parseValue(thisWidget.value);
  }
}

export default HourPicker;
