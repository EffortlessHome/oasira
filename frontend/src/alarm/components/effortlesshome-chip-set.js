var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import './effortlesshome-chip';
let effortlesshomeChipSet = class effortlesshomeChipSet extends LitElement {
    constructor() {
        super(...arguments);
        this.value = [];
    }
    render() {
        if (!this.items)
            return html ``;
        return html `
      ${Object.values(this.items).map(e => html `
          <effortlesshome-chip
            value="${e.value}"
            ?checked=${this.value.includes(e.value)}
            .badge=${e.badge}
            ?selectable=${this.selectable}
            ?checkmark=${this.selectable}
            clickable
            @value-changed=${this._itemChanged}
          >
            ${e.name}
          </effortlesshome-chip>
        `)}
    `;
    }
    _itemChanged(ev) {
        const value = ev.target.checked;
        const key = String(ev.detail);
        if (this.selectable) {
            if (this.value.includes(key) && !value)
                this.value = this.value.filter(e => e != key);
            else if (!this.value.includes(key) && value)
                this.value = [...this.value, key];
            const myEvent = new CustomEvent('value-changed', { detail: this.value });
            this.dispatchEvent(myEvent);
        }
        else {
            const myEvent = new CustomEvent('value-changed', { detail: key });
            this.dispatchEvent(myEvent);
        }
    }
    static get styles() {
        return css `
      :host {
        display: flex;
        flex-direction: row;
        flex: 1;
        margin: 0px -4px;
        flex-wrap: wrap;
      }
    `;
    }
};
__decorate([
    property()
], effortlesshomeChipSet.prototype, "items", void 0);
__decorate([
    property()
], effortlesshomeChipSet.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeChipSet.prototype, "selectable", void 0);
effortlesshomeChipSet = __decorate([
    customElement('effortlesshome-chip-set')
], effortlesshomeChipSet);
export { effortlesshomeChipSet };
