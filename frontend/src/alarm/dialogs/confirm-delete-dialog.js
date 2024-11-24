var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { commonStyle } from '../styles';
let ConfirmDeleteDialog = class ConfirmDeleteDialog extends LitElement {
    async showDialog(params) {
        this._params = params;
        await this.updateComplete;
    }
    async closeDialog() {
        if (this._params)
            this._params.cancel();
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
          <span slot="title">${this._params.title}</span>
        </ha-dialog-header>
        <div class="wrapper">
          ${this._params.description}
        </div>

        <mwc-button slot="primaryAction" @click=${this.cancelClick} dialogAction="close">
          ${this.hass.localize('ui.dialogs.generic.cancel')}
        </mwc-button>
        <mwc-button slot="secondaryAction" style="float: left" @click=${this.confirmClick} dialogAction="close">
          ${this.hass.localize('ui.dialogs.generic.ok')}
        </mwc-button>
      </ha-dialog>
    `;
    }
    confirmClick() {
        this._params.confirm();
    }
    cancelClick() {
        this._params.cancel();
    }
    static get styles() {
        return css `
      ${commonStyle}
      div.wrapper {
        color: var(--primary-text-color);
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], ConfirmDeleteDialog.prototype, "hass", void 0);
__decorate([
    state()
], ConfirmDeleteDialog.prototype, "_params", void 0);
ConfirmDeleteDialog = __decorate([
    customElement('confirm-delete-dialog')
], ConfirmDeleteDialog);
export { ConfirmDeleteDialog };
