var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
let effortlesshomeChip = class effortlesshomeChip extends LitElement {
    render() {
        return html `
      <div class="chip ${this.checked ? 'selected' : ''}" @click=${this._toggleSelect}>
        ${this.renderCheckmark()}
        <slot></slot>
        ${this.renderButton()}
      </div>
    `;
    }
    renderCheckmark() {
        if (!this.checkmark)
            return html ``;
        return html `
      <div class="checkmark-container">
        <ha-icon icon="mdi:check"></ha-icon>
      </div>
    `;
    }
    renderButton() {
        if (this.cancellable) {
            return html `
        <div class="button-container" @click=${this._buttonClick}>
          <ha-icon icon="mdi:close"></ha-icon>
        </div>
      `;
        }
        else if (this.badge !== undefined) {
            return html `
        <div class="badge-container" @click=${this._buttonClick}>
          ${this.badge}
        </div>
      `;
        }
        else
            return html ``;
    }
    _toggleSelect() {
        if (!this.value || !this.clickable)
            return;
        if (this.selectable)
            this.checked = this.checked ? false : true;
        const myEvent = new CustomEvent('value-changed', { detail: this.value });
        this.dispatchEvent(myEvent);
    }
    _buttonClick() {
        const myEvent = new CustomEvent('button-clicked', { detail: this.value });
        this.dispatchEvent(myEvent);
    }
    static get styles() {
        return css `
      :host {
        margin: 4px;
      }
      .chip {
        display: flex;
        position: relative;
        height: 36px;
        padding: 0px 16px;
        align-items: center;
        color: var(--primary-text-color);
        user-select: none;
        font-weight: 400;
        z-index: 1;
      }
      :host([clickable]) .chip {
        cursor: pointer;
        color: var(--rgb-primary-color);
        opacity: 0.85;
      }
      .chip:before {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        content: '';
        border-radius: 8px;
        border: 1px solid var(--primary-text-color);
        opacity: 0.24;
        z-index: -1;
      }
      :host([clickable]) .chip:hover,
      :host([clickable]) .chip:active {
        opacity: 1;
      }
      :host([clickable]) .chip:hover:before {
        opacity: 0.3;
      }
      :host([clickable]) .chip:active:before {
        opacity: 0.06;
        background: var(--primary-text-color);
      }
      :host .chip.selected:before,
      :host([cancellable]) .chip:before {
        background: rgba(var(--rgb-primary-color), 0.18);
        border: none;
        opacity: 1;
      }
      :host .chip.selected:hover:before {
        background: rgba(var(--rgb-primary-color), 0.24);
        opacity: 1;
      }
      :host .chip.selected:active:before {
        background: rgba(var(--rgb-primary-color), 0.3);
        opacity: 1;
      }
      .chip div.checkmark-container {
        width: 0px;
        height: 100%;
        transition: width 0.1s ease-in-out;
        overflow: hidden;
        display: flex;
        align-items: center;
        margin: 0px 4px 0px -4px;
        --mdc-icon-size: 18px;
      }
      .chip.selected div.checkmark-container {
        width: 18px;
      }
      .chip div.button-container {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px -16px 0px 6px;
        cursor: pointer;
        --mdc-icon-size: 20px;
        position: relative;
        z-index: 1;
        opacity: 0.85;
        color: var(--dark-primary-color);
      }
      .chip div.button-container:before {
        position: absolute;
        top: 3px;
        right: 3px;
        bottom: 3px;
        left: 3px;
        pointer-events: none;
        content: '';
        border-radius: 15px;
        z-index: -1;
      }
      .chip div.button-container:hover,
      .chip div.button-container:hover {
        opacity: 1;
      }
      .chip div.button-container:hover:before {
        background: rgba(var(--rgb-primary-color), 0.12);
      }
      .chip div.button-container:active:before {
        background: rgba(var(--rgb-primary-color), 0.24);
      }
      .chip div.badge-container {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0px -9px 0px 9px;
        position: relative;
        z-index: 1;
        font-size: 0.875em;
      }
      .chip div.badge-container:before {
        position: absolute;
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: 0px;
        pointer-events: none;
        content: '';
        border-radius: 50%;
        z-index: -1;
      }
      :host([table]) .chip {
        height: 40px;
      }
      :host([table]) .chip:before {
        border-radius: 4px;
      }
    `;
    }
};
__decorate([
    property({ type: String })
], effortlesshomeChip.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "checkmark", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "selectable", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "clickable", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "cancellable", void 0);
__decorate([
    property({ type: Number })
], effortlesshomeChip.prototype, "badge", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChip.prototype, "table", void 0);
effortlesshomeChip = __decorate([
    customElement('effortlesshome-chip')
], effortlesshomeChip);
export { effortlesshomeChip };
