var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { mdiChevronDown, mdiChevronUp, mdiChevronRight } from '@mdi/js';
let CollapsibleSection = class CollapsibleSection extends LitElement {
    constructor() {
        super(...arguments);
        this.header = '';
        this.open = false;
    }
    render() {
        return html `
      ${this.open
            ? html `
            <div class="header open">
              <span @click=${() => { this.open = false; }}>${this.header}</span>
              <ha-icon-button .path=${mdiChevronDown} @click=${() => { this.open = false; }}>
              </ha-icon-button>
            </div>
            <slot></slot>
            <div class="header open">
              <span @click=${() => { this.open = false; }}>${this.header}</span>
              <ha-icon-button .path=${mdiChevronUp} @click=${() => { this.open = false; }}>
              </ha-icon-button>
            </div>
          `
            : html `
            <div class="header">
              <span @click=${() => { this.open = true; }}>${this.header}</span>
              <ha-icon-button .path=${mdiChevronRight} @click=${() => { this.open = true; }}>
              </ha-icon-button>
            </div>
          `}
    `;
    }
    static get styles() {
        return css `
      :host {
      }

      div.header {
        display: flex;
        align-items: center;
        padding: 0px 16px;
        cursor: pointer;
      }
      div.header.open:first-of-type {
        border-bottom: 1px solid var(--divider-color);
      }
      div.header.open:last-of-type {
        border-top: 1px solid var(--divider-color);
      }

      :host([narrow]) div.header {
        border-top: 1px solid var(--divider-color);
        border-bottom: none;
      }

      div.header span {
        display: flex;
        flex-grow: 1;
      }

      div.seperator {
        height: 1px;
        background: var(--divider-color);
      }
    `;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], CollapsibleSection.prototype, "narrow", void 0);
__decorate([
    property()
], CollapsibleSection.prototype, "header", void 0);
__decorate([
    property()
], CollapsibleSection.prototype, "open", void 0);
CollapsibleSection = __decorate([
    customElement('collapsible-section')
], CollapsibleSection);
export { CollapsibleSection };
