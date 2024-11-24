var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
let ErrorDialog = class ErrorDialog extends LitElement {
    async showDialog(params) {
        this._params = params;
        await this.updateComplete;
    }
    async closeDialog() {
        this._params = undefined;
    }
    render() {
        if (!this._params)
            return html ``;
        return html `
      <ha-dialog open .heading=${true} @closed=${this.closeDialog} @close-dialog=${this.closeDialog}>
        <ha-dialog-header slot="heading">
          <ha-icon-button slot="navigationIcon" dialogAction="cancel" .path=${mdiClose}>
          </ha-icon-button>
            <span slot="title">
              ${this.hass.localize('state_badge.default.error')}
            </span>
        </ha-dialog-header>
        <div class="wrapper">
          ${this._params.error || ''}
        </div>

        <mwc-button slot="primaryAction" style="float: left" @click=${this.closeDialog} dialogAction="close">
          ${this.hass.localize('ui.dialogs.generic.ok')}
        </mwc-button>
      </ha-dialog>
    `;
    }
    static get styles() {
        return css `
      div.wrapper {
        color: var(--primary-text-color);
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], ErrorDialog.prototype, "hass", void 0);
__decorate([
    state()
], ErrorDialog.prototype, "_params", void 0);
ErrorDialog = __decorate([
    customElement('error-dialog')
], ErrorDialog);
export { ErrorDialog };
