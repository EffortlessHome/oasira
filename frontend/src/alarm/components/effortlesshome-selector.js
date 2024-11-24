var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { fireEvent } from '../fire_event';
import { isDefined, IsEqual } from '../helpers';
let effortlesshomeSelector = class effortlesshomeSelector extends LitElement {
    constructor() {
        super(...arguments);
        this.items = [];
        this.value = [];
        this.label = '';
        this.invalid = false;
    }
    shouldUpdate(changedProps) {
        if (changedProps.get('items')) {
            if (!IsEqual(this.items, changedProps.get('items')))
                this.firstUpdated();
        }
        return true;
    }
    firstUpdated() {
        //remove items from selection which are not in the list (anymore)
        if (this.value.some(e => !this.items.map(v => v.value).includes(e))) {
            this.value = this.value.filter(e => this.items.map(v => v.value).includes(e));
            fireEvent(this, 'value-changed', { value: this.value });
        }
    }
    render() {
        return html `
      <div class="chip-set">
        ${this.value.length
            ? this.value
                .map(val => this.items.find(e => e.value == val))
                .filter(isDefined)
                .map(e => html `
          <div class="chip">
            <ha-icon class="icon" icon=${e.icon}>
            </ha-icon>
            <span class="label">
              ${e.name}
            </span>            
            <ha-icon class="button" icon="hass:close" @click=${() => this._removeClick(e.value)}>
            </ha-icon>
            </mwc-icon-button>
          </div>
        `)
            : ''}
      </div>
      <effortlesshome-select
        .hass=${this.hass}
        .items=${this.items.filter(e => !this.value.includes(e.value))}
        ?disabled=${this.value.length == this.items.length}
        label=${this.label}
        icons=${true}
        @value-changed=${this._addClick}
        ?invalid=${this.invalid && this.value.length != this.items.length}
      ></effortlesshome-select>
    `;
    }
    _removeClick(value) {
        this.value = this.value.filter(e => e !== value);
        fireEvent(this, 'value-changed', { value: this.value });
    }
    _addClick(ev) {
        ev.stopPropagation();
        const target = ev.target;
        const value = target.value;
        if (!this.value.includes(value))
            this.value = [...this.value, value];
        target.value = '';
        fireEvent(this, 'value-changed', { value: [...this.value] });
    }
    static get styles() {
        return css `
      div.chip-set {
        margin: 0px -4px;
      }
      div.chip {
        height: 32px;
        border-radius: 16px;
        border: 2px solid rgb(168, 232, 251);
        line-height: 1.25rem;
        font-size: 0.875rem;
        font-weight: 400;
        padding: 0px 12px;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        margin: 4px;
      }
      .icon {
        vertical-align: middle;
        outline: none;
        display: flex;
        align-items: center;
        border-radius: 50%;
        padding: 6px;
        color: rgba(0, 0, 0, 0.54);
        background: rgb(168, 232, 251);
        --mdc-icon-size: 20px;
        margin-left: -14px !important;
      }
      .label {
        margin: 0px 4px;
      }
      .button {
        cursor: pointer;
        background: var(--secondary-text-color);
        border-radius: 50%;
        --mdc-icon-size: 14px;
        color: var(--card-background-color);
        width: 16px;
        height: 16px;
        padding: 1px;
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        margin-right: -6px !important;
      }
    `;
    }
};
__decorate([
    property()
], effortlesshomeSelector.prototype, "hass", void 0);
__decorate([
    property()
], effortlesshomeSelector.prototype, "items", void 0);
__decorate([
    property({ type: Array })
], effortlesshomeSelector.prototype, "value", void 0);
__decorate([
    property()
], effortlesshomeSelector.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeSelector.prototype, "invalid", void 0);
effortlesshomeSelector = __decorate([
    customElement('effortlesshome-selector')
], effortlesshomeSelector);
export { effortlesshomeSelector };
