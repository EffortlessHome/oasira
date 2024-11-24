var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { localize } from '../../localize/localize';
import { fireEvent } from '../fire_event';
export var ETimeUnits;
(function (ETimeUnits) {
    ETimeUnits["Seconds"] = "sec";
    ETimeUnits["Minutes"] = "min";
})(ETimeUnits || (ETimeUnits = {}));
const round = (val, step) => {
    return Math.round(val / step) * step;
};
const calcStepSize = (min, max) => {
    const stepSizes = [10 / 60, 15 / 60, 20 / 60, 30 / 60, 1, 2, 5];
    let range = max - min;
    let step = range / 12;
    step = stepSizes.reduce((prev, curr) => Math.abs(curr - step) < Math.abs(prev - step) ? curr : prev);
    return step;
};
let TimeSlider = class TimeSlider extends LitElement {
    constructor() {
        super(...arguments);
        this.min = 0;
        this.max = 100;
        this.value = 0;
        this.step = 0;
        this.scaleFactor = 1;
        this.unit = ETimeUnits.Minutes;
        this.disabled = false;
        this._min = 0;
        this._max = 0;
        this._step = 0;
    }
    firstUpdated() {
        if (this.value > 0 && this.value < 60)
            this.setUnit(ETimeUnits.Seconds);
        else
            this.setUnit(ETimeUnits.Minutes);
    }
    setUnit(unit) {
        this.unit = unit;
        this.scaleFactor = this.unit == ETimeUnits.Minutes ? 1 / 60 : 1;
        this._step = calcStepSize(this.min * this.scaleFactor, (ETimeUnits.Minutes ? this.max : 60) * this.scaleFactor);
        if (this.step && this._step > this.step * this.scaleFactor)
            this._step = this.step * this.scaleFactor;
        let min = this.min * this.scaleFactor;
        if (min < this._step)
            min = this._step;
        this._min = this.min ? round(min, this._step) : 0;
        this._max = (unit == ETimeUnits.Minutes ? round(this.max, this._step) : 60) * this.scaleFactor;
    }
    render() {
        return html `
      <div class="container">
        <div class="prefix">
          <slot name="prefix"></slot>
        </div>
        <div class="slider">
          ${this.getSlider()}
        </div>
        <div class="value${this.disabled ? ' disabled' : ''}" @click=${this.toggleUnit}>
          ${this.getValue()}
        </div>
      </div>
    `;
    }
    getValue() {
        const value = round(this.value * this.scaleFactor, this._step);
        if (!value && this.zeroValue) {
            return this.zeroValue;
        }
        return `${value} ${this.getUnit()}`;
    }
    getUnit() {
        switch (this.unit) {
            case ETimeUnits.Seconds:
                return localize('components.time_slider.seconds', this.hass.language);
            case ETimeUnits.Minutes:
                return localize('components.time_slider.minutes', this.hass.language);
            default:
                return '';
        }
    }
    getSlider() {
        const val = round(this.value * this.scaleFactor, this._step);
        return html `
      <ha-slider
        labeled
        min=${this._min}
        max=${this._max}
        step=${this._step}
        value=${val}
        ?disabled=${this.disabled}
        @change=${this.updateValue}
      ></ha-slider>
    `;
    }
    updateValue(e) {
        const value = Number(e.target.value);
        this.value = round(value, this._step) / this.scaleFactor;
        fireEvent(this, 'value-changed', { value: this.value });
    }
    toggleUnit() {
        this.setUnit(this.unit == ETimeUnits.Minutes ? ETimeUnits.Seconds : ETimeUnits.Minutes);
    }
};
TimeSlider.styles = css `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 250px;
    }

    div.container {
      display: grid;
      grid-template-columns: max-content 1fr 60px;
      grid-template-rows: min-content;
      grid-template-areas: 'prefix slider value';
    }

    div.prefix {
      grid-area: prefix;
      display: flex;
      align-items: center;
    }

    div.slider {
      grid-area: slider;
      display: flex;
      align-items: center;
      flex: 1;
    }

    div.value {
      grid-area: value;
      min-width: 40px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
    }

    ha-slider {
      width: 100%;
    }

    .disabled {
      color: var(--disabled-text-color);
    }
  `;
__decorate([
    property({ type: Number })
], TimeSlider.prototype, "min", void 0);
__decorate([
    property({ type: Number })
], TimeSlider.prototype, "max", void 0);
__decorate([
    property({ type: Number })
], TimeSlider.prototype, "value", void 0);
__decorate([
    property({ type: Number })
], TimeSlider.prototype, "step", void 0);
__decorate([
    property()
], TimeSlider.prototype, "scaleFactor", void 0);
__decorate([
    property({ type: ETimeUnits })
], TimeSlider.prototype, "unit", void 0);
__decorate([
    property({ type: Boolean })
], TimeSlider.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], TimeSlider.prototype, "zeroValue", void 0);
TimeSlider = __decorate([
    customElement('time-slider')
], TimeSlider);
export { TimeSlider };
