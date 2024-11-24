var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { localize } from '../../localize/localize';
import { fetchConfig, saveConfig } from '../data/websockets';
let EditMasterDialog = class EditMasterDialog extends LitElement {
    constructor() {
        super(...arguments);
        this.name = '';
    }
    async showDialog(params) {
        this._params = params;
        const config = await fetchConfig(this.hass);
        this.name = config.master['name'] || '';
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
            <span slot="title">${localize('panels.general.dialogs.edit_master.title', this.hass.language)}</span>
        </ha-dialog-header>
        <div class="wrapper">
          <ha-textfield
            label=${this.hass.localize('ui.components.area-picker.add_dialog.name')}
            @input=${(ev) => (this.name = ev.target.value)}
            value="${this.name}"
          ></ha-textfield>
          <span class="note">${localize('panels.general.dialogs.edit_area.name_warning', this.hass.language)}</span>
        </div>
        <mwc-button slot="primaryAction" @click=${this.saveClick}>
          ${this.hass.localize('ui.common.save')}
        </mwc-button>
        <mwc-button slot="secondaryAction" @click=${this.closeDialog}>
          ${this.hass.localize('ui.common.cancel')}
        </mwc-button>
      </ha-dialog>
    `;
    }
    saveClick() {
        const name = this.name.trim();
        if (!name.length)
            return;
        saveConfig(this.hass, {
            master: {
                enabled: true,
                name: name,
            },
        })
            .catch()
            .then(() => {
            this.closeDialog();
        });
    }
    static get styles() {
        return css `
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.note {
        color: var(--secondary-text-color);
      }
      ha-textfield {
        display: block;
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], EditMasterDialog.prototype, "hass", void 0);
__decorate([
    state()
], EditMasterDialog.prototype, "_params", void 0);
__decorate([
    property()
], EditMasterDialog.prototype, "name", void 0);
EditMasterDialog = __decorate([
    customElement('edit-master-dialog')
], EditMasterDialog);
export { EditMasterDialog };
