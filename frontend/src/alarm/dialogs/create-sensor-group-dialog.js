var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { fetchSensors, fetchSensorGroups, saveSensorGroup, deleteSensorGroup } from '../data/websockets';
import { dialogStyle } from '../styles';
import { localize } from '../../localize/localize';
import { SubscribeMixin } from '../subscribe-mixin';
import { computeName, handleError, isDefined, prettyPrint, showErrorDialog, sortAlphabetically } from '../helpers';
import { ESensorIcons, ESensorTypes } from '../const';
import '../components/effortlesshome-chip-set';
import '../components/effortlesshome-select';
let CreateSensorGroupDialog = class CreateSensorGroupDialog extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.sensorGroups = {};
        this.sensors = {};
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass)
            return;
        this.sensorGroups = await fetchSensorGroups(this.hass);
        this.sensors = await fetchSensors(this.hass);
    }
    async showDialog(params) {
        await this._fetchData();
        this._params = params;
        if (params.group_id && Object.keys(this.sensorGroups).includes(params.group_id)) {
            this.data = Object.assign({}, this.sensorGroups[params.group_id]);
        }
        else {
            this.data = {
                name: '',
                entities: [],
                timeout: 600,
                event_count: 2
            };
        }
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
          <ha-icon-button slot="navigationIcon" dialogAction="close" .path=${mdiClose}>
          </ha-icon-button>
          <span slot="title">
            ${this.data.group_id
            ? localize('panels.sensors.dialogs.edit_group.title', this.hass.language, '{name}', this.sensorGroups[this.data.group_id].name)
            : localize('panels.sensors.dialogs.create_group.title', this.hass.language)}
          </span>
        </ha-dialog-header>
        <div class="wrapper">
          <settings-row dialog>
            <span slot="heading">
              ${localize('panels.sensors.dialogs.create_group.fields.name.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.sensors.dialogs.create_group.fields.name.description', this.hass.language)}
            </span>
            <ha-textfield
              label=${this.hass.localize('ui.components.area-picker.add_dialog.name')}
              @input=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { name: String(ev.target.value).trim() }))}
              value="${this.data.name}"
            ></ha-textfield>
          </settings-row>

          <settings-row large dialog>
            <span slot="heading">
              ${localize('panels.sensors.dialogs.create_group.fields.sensors.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.sensors.dialogs.create_group.fields.sensors.description', this.hass.language)}
            </span>
            <div>
              ${this.renderSensorOptions()}
            </div>
          </settings-row>

          <settings-row dialog>
            <span slot="heading">
              ${localize('panels.sensors.dialogs.create_group.fields.timeout.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.sensors.dialogs.create_group.fields.timeout.description', this.hass.language)}
            </span>
            <time-slider
              .hass=${this.hass}
              min="10"
              max="900"
              .value=${this.data.timeout}
              @value-changed=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { timeout: ev.detail.value }))}
            ></time-slider>
          </settings-row>

          ${this.data.entities.length > 2
            ? html `
          <settings-row dialog>
            <span slot="heading">
              ${localize('panels.sensors.dialogs.create_group.fields.event_count.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.sensors.dialogs.create_group.fields.event_count.description', this.hass.language)}
            </span>
            <effortlesshome-select
              .hass=${this.hass}
              .items=${this.renderSensorCountOptions()}
              ?disabled=${this.data.entities.length <= 2}
              @value-changed=${(ev) => { this.data = Object.assign(Object.assign({}, this.data), { event_count: Number(ev.detail.value) }); }}
              .value=${String(this.data.event_count > this.data.entities.length ? this.data.entities.length : this.data.event_count)}
            ></effortlesshome-select>
          </settings-row>
          `
            : ''}
        </div>
        <mwc-button slot="secondaryAction" @click=${this.saveClick}>
          ${this.hass.localize('ui.common.save')}
        </mwc-button>
        ${this.data.group_id
            ? html `
              <mwc-button slot="secondaryAction" @click=${this.deleteClick} class="warning">
                ${this.hass.localize('ui.common.delete')}
              </mwc-button>
            `
            : ''}
      </ha-dialog>
    `;
    }
    renderSensorOptions() {
        const sensors = Object.keys(this.sensors)
            .filter(e => !isDefined(this.sensors[e].group) || this.sensors[e].group === this.data.group_id)
            .map(e => {
            const stateObj = this.hass.states[e];
            const type = Object.entries(ESensorTypes).find(([, v]) => v == this.sensors[e].type)[0];
            return {
                value: e,
                name: prettyPrint(computeName(stateObj)),
                icon: ESensorIcons[type],
            };
        });
        sensors.sort(sortAlphabetically);
        if (!sensors.length)
            return localize('panels.sensors.cards.sensors.no_items', this.hass.language);
        return html `
      <effortlesshome-chip-set
        .items=${sensors}
        .value=${this.data.entities}
        ?selectable=${true}
        @value-changed=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { entities: ev.detail }))}
      ></effortlesshome-chip-set>
    `;
    }
    renderSensorCountOptions() {
        let options = [];
        for (let i = 2; i <= this.data.entities.length; i++) {
            options = [...options, {
                    name: `${i}`,
                    value: `${i}`
                }];
        }
        return options;
    }
    saveClick(ev) {
        if (!this.data.name.length)
            showErrorDialog(ev, localize('panels.sensors.dialogs.create_group.errors.invalid_name', this.hass.language));
        else if ((!this.data.group_id || this.data.name != this.sensorGroups[this.data.group_id].name) &&
            Object.values(this.sensorGroups).find(e => e.name.toLowerCase() == this.data.name.toLowerCase()))
            showErrorDialog(ev, localize('panels.sensors.dialogs.create_group.errors.invalid_name', this.hass.language));
        else if (this.data.entities.length < 2)
            showErrorDialog(ev, localize('panels.sensors.dialogs.create_group.errors.insufficient_sensors', this.hass.language));
        else {
            if (this.data.event_count > this.data.entities.length)
                this.data = Object.assign(Object.assign({}, this.data), { event_count: this.data.entities.length });
            saveSensorGroup(this.hass, this.data)
                .catch(e => handleError(e, ev))
                .then(() => {
                this.closeDialog();
            });
        }
    }
    deleteClick(ev) {
        if (!this.data.group_id)
            return;
        deleteSensorGroup(this.hass, this.data.group_id)
            .catch(e => handleError(e, ev))
            .then(() => {
            this.closeDialog();
        });
    }
    static get styles() {
        return css `
      ${dialogStyle}
      div.wrapper {
        color: var(--primary-text-color);
      }
      mwc-button.warning {
        --mdc-theme-primary: var(--error-color);
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], CreateSensorGroupDialog.prototype, "hass", void 0);
__decorate([
    state()
], CreateSensorGroupDialog.prototype, "_params", void 0);
__decorate([
    property()
], CreateSensorGroupDialog.prototype, "sensorGroups", void 0);
__decorate([
    property()
], CreateSensorGroupDialog.prototype, "sensors", void 0);
__decorate([
    property()
], CreateSensorGroupDialog.prototype, "data", void 0);
CreateSensorGroupDialog = __decorate([
    customElement('create-sensor-group-dialog')
], CreateSensorGroupDialog);
export { CreateSensorGroupDialog };
