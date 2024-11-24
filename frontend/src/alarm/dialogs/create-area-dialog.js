var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { saveArea, deleteArea, fetchAreas, fetchSensors, fetchAutomations } from '../data/websockets';
import { commonStyle } from '../styles';
import { localize } from '../../localize/localize';
import { SubscribeMixin } from '../subscribe-mixin';
import { handleError } from '../helpers';
import { fireEvent } from '../fire_event';
import './confirm-delete-dialog';
let CreateAreaDialog = class CreateAreaDialog extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.areas = {};
        this.sensors = {};
        this.automations = {};
        this.name = '';
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass)
            return;
        this.areas = await fetchAreas(this.hass);
        this.sensors = await fetchSensors(this.hass);
        this.automations = await fetchAutomations(this.hass);
    }
    async showDialog(params) {
        await this._fetchData();
        this._params = params;
        if (params.area_id) {
            this.area_id = params.area_id;
            this.name = this.areas[this.area_id].name;
        }
        await this.updateComplete;
    }
    async closeDialog() {
        this._params = undefined;
        this.area_id = undefined;
        this.name = '';
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
              ${this.area_id
            ? localize('panels.general.dialogs.edit_area.title', this.hass.language, '{area}', this.areas[this.area_id].name)
            : localize('panels.general.dialogs.create_area.title', this.hass.language)}
            </span>
        </ha-dialog-header>
        <div class="wrapper">
          <ha-textfield
            label=${this.hass.localize('ui.components.area-picker.add_dialog.name')}
            @input=${(ev) => (this.name = ev.target.value)}
            value="${this.name}"
          ></ha-textfield>
          ${this.area_id
            ? html `
                <span class="note">
                  ${localize('panels.general.dialogs.edit_area.name_warning', this.hass.language)}
                </span>
              `
            : ''}
          ${!this.area_id
            ? html `
                <effortlesshome-select
                  .items=${Object.values(this.areas).map(e => Object({ value: e.area_id, name: e.name }))}
                  value=${this.selectedArea}
                  label="${localize('panels.general.dialogs.create_area.fields.copy_from', this.hass.language)}"
                  clearable=${true}
                  @value-changed=${(ev) => (this.selectedArea = ev.target.value)}
                ></effortlesshome-select>
              `
            : ''}
        </div>
        <mwc-button slot="primaryAction" @click=${this.saveClick}>
          ${this.hass.localize('ui.common.save')}
        </mwc-button>
        ${this.area_id
            ? html `
              <mwc-button
                slot="secondaryAction"
                @click=${this.deleteClick}
                class="warning"
                ?disabled=${Object.keys(this.areas).length == 1}
              >
                ${this.hass.localize('ui.common.delete')}
              </mwc-button>
            `
            : ''}
      </ha-dialog>
    `;
    }
    saveClick(ev) {
        const name = this.name.trim();
        if (!name.length)
            return;
        let data = {
            name: name,
        };
        if (this.area_id)
            data = Object.assign(Object.assign({}, data), { area_id: this.area_id });
        else if (this.selectedArea)
            data = Object.assign(Object.assign({}, data), { modes: Object.assign({}, this.areas[this.selectedArea].modes) });
        saveArea(this.hass, data)
            .catch(e => handleError(e, ev))
            .then(() => {
            this.closeDialog();
        });
    }
    async deleteClick(ev) {
        if (!this.area_id)
            return;
        const sensors = Object.values(this.sensors).filter(e => e.area == this.area_id).length;
        const automations = Object.values(this.automations).filter(e => { var _a; return (_a = e.triggers) === null || _a === void 0 ? void 0 : _a.map(e => e.area).includes(this.area_id); })
            .length;
        let result = false;
        if (sensors || automations) {
            result = await new Promise(resolve => {
                fireEvent(ev.target, 'show-dialog', {
                    dialogTag: 'confirm-delete-dialog',
                    dialogImport: () => import('./confirm-delete-dialog'),
                    dialogParams: {
                        title: localize('panels.general.dialogs.remove_area.title', this.hass.language),
                        description: localize('panels.general.dialogs.remove_area.description', this.hass.language, 'sensors', String(sensors), 'automations', String(automations)),
                        cancel: () => resolve(false),
                        confirm: () => resolve(true),
                    },
                });
            });
        }
        else
            result = true;
        if (result) {
            deleteArea(this.hass, this.area_id)
                .catch(e => handleError(e, ev))
                .then(() => {
                this.closeDialog();
            });
        }
    }
    static get styles() {
        return css `
      ${commonStyle}
      div.wrapper {
        color: var(--primary-text-color);
      }
      span.note {
        color: var(--secondary-text-color);
      }
      ha-textfield {
        display: block;
      }
      effortlesshome-select {
        margin-top: 10px;
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], CreateAreaDialog.prototype, "hass", void 0);
__decorate([
    state()
], CreateAreaDialog.prototype, "_params", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "areas", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "sensors", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "automations", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "name", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "area_id", void 0);
__decorate([
    property()
], CreateAreaDialog.prototype, "selectedArea", void 0);
CreateAreaDialog = __decorate([
    customElement('create-area-dialog')
], CreateAreaDialog);
export { CreateAreaDialog };
