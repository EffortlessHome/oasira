var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement, state } from 'lit/decorators.js';
import { mdiClose, mdiLock, mdiLockOpen } from '@mdi/js';
import { commonStyle } from '../../styles';
import { EArmModes } from '../../types';
import { fetchSensors, saveSensor, deleteSensor, fetchAreas, fetchSensorGroups } from '../../data/websockets';
import { localize } from '../../../localize/localize';
import { Unique, Without, handleError, showErrorDialog, computeName, navigate, omit } from '../../helpers';
import { sensorConfigByType, getSensorTypeOptions, getConfigurableSensors } from '../../data/sensors';
import { EArmModeIcons, ESensorTypes } from '../../const';
import { SubscribeMixin } from '../../subscribe-mixin';
import '../../dialogs/error-dialog';
import '../../dialogs/manage-sensor-groups-dialog';
import '../../components/effortlesshome-select';
import { exportPath } from '../../common/navigation';
import { fireEvent } from '../../fire_event';
let SensorEditorCard = class SensorEditorCard extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.showBypassModes = false;
        this.sensorsList = [];
        this.entityIdUnlocked = false;
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        var _a;
        if (!this.hass)
            return;
        const areas = await fetchAreas(this.hass);
        this.areas = areas;
        const sensorGroups = await fetchSensorGroups(this.hass);
        this.sensorGroups = sensorGroups;
        const sensors = await fetchSensors(this.hass);
        this.data = Object.keys(sensors).includes(this.item) ? sensors[this.item] : undefined;
        if (this.data && !((_a = this.data) === null || _a === void 0 ? void 0 : _a.area) && Object.keys(areas).length == 1)
            this.data = Object.assign(Object.assign({}, this.data), { area: Object.keys(this.areas)[0] });
        let sensorsList = getConfigurableSensors(this.hass, Object.keys(sensors), true);
        this.sensorsList = sensorsList.map(e => Object(Object.assign(Object.assign({}, e), { description: e.id, value: e.id })));
        if (!this.hass.states[this.item])
            this.entityIdUnlocked = true;
    }
    render() {
        if (!this.data)
            return html ``;
        let sensorsList = [...this.sensorsList];
        if (!sensorsList.find(e => e.value == this.data.entity_id)) {
            sensorsList = [{
                    value: this.data.entity_id,
                    description: this.data.entity_id,
                    name: computeName(this.hass.states[this.item]),
                    icon: 'hass:help-circle-outline',
                }, ...sensorsList];
        }
        const stateObj = this.hass.states[this.data.entity_id];
        return html `
      <ha-card>
        <div class="card-header">
          <div class="name">${localize('panels.sensors.cards.editor.title', this.hass.language)}</div>
          <ha-icon-button .path=${mdiClose} @click=${this.cancelClick}></ha-icon-button>
        </div>
        <div class="card-content">
          ${localize('panels.sensors.cards.editor.description', this.hass.language, '{entity}', computeName(this.hass.states[this.item]))}
        </div>

        <settings-row .narrow=${this.narrow} .large=${true}>
          <span slot="heading">
            ${localize('panels.sensors.cards.editor.fields.entity.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.sensors.cards.editor.fields.entity.description', this.hass.language)}
          </span>

          <div style="display: flex; flex-direction: row">
            <effortlesshome-select
              style="flex: 1"
              .items=${sensorsList}
              .value=${this.data.entity_id}
              label="${localize('panels.sensors.cards.editor.fields.entity.heading', this.hass.language)}"
              @value-changed=${(ev) => { (this.data = Object.assign(Object.assign({}, this.data), { new_entity_id: ev.target.value })); }}
              ?disabled=${!this.entityIdUnlocked}
              ?icons=${true}
              ?invalid=${this.hass.states[this.data.new_entity_id || this.data.entity_id] === undefined}
            ></effortlesshome-select>

            <ha-icon-button
              .path=${this.entityIdUnlocked ? mdiLock : mdiLockOpen}
              @click=${() => { this.entityIdUnlocked = !this.entityIdUnlocked; }}
              style="--mdc-icon-size: 20px; --mdc-icon-button-size: 48px"
            >

            </ha-icon-button>
          </div>
        </settings-row>


        ${Object.keys(this.areas).length > 1
            ? html `
              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.sensors.cards.editor.fields.area.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.sensors.cards.editor.fields.area.description', this.hass.language)}
                </span>

                <effortlesshome-select
                  .items=${Object.values(this.areas).map(e => Object({ value: e.area_id, name: e.name }))}
                  value=${this.data.area}
                  label=${localize('panels.sensors.cards.editor.fields.area.heading', this.hass.language)}
                  @value-changed=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { area: ev.target.value }))}
                  ?invalid=${!this.data.area}
                ></effortlesshome-select>
              </settings-row>
            `
            : ''}

        <settings-row .narrow=${this.narrow} .large=${true}>
          <span slot="heading">
            ${localize('panels.sensors.cards.editor.fields.device_type.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.sensors.cards.editor.fields.device_type.description', this.hass.language)}
          </span>

          <effortlesshome-select
            .hass=${this.hass}
            .items=${getSensorTypeOptions(this.hass)}
            label=${localize('panels.sensors.cards.editor.fields.device_type.heading', this.hass.language)}
            clearable=${true}
            icons=${true}
            value=${this.data['type']}
            @value-changed=${(ev) => this.setType((ev.target.value || ESensorTypes.Other))}
          ></effortlesshome-select>
        </settings-row>

        <settings-row .narrow=${this.narrow} .large=${this.modesByArea(this.data.area).length > 3}>
          <span slot="heading">
            ${localize('panels.sensors.cards.editor.fields.modes.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.sensors.cards.editor.fields.modes.description', this.hass.language)}
          </span>

          <div>
            ${this.modesByArea(this.data.area).map(el => html `
                <mwc-button
                  class="${this.data.modes.includes(el) || this.data.always_on ? 'active' : ''}"
                  @click=${() => {
            this.setMode(el);
        }}
                  ?disabled=${this.data.always_on}
                >
                  <ha-icon icon="${EArmModeIcons[Object.entries(EArmModes).find(([, v]) => v == el)[0]]}"></ha-icon>
                  ${localize(`common.modes_short.${el}`, this.hass.language)}
                </mwc-button>
              `)}
          </div>
        </settings-row>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.sensors.cards.editor.fields.group.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.sensors.cards.editor.fields.group.description', this.hass.language)}
          </span>

          <div>
            ${Object.keys(this.sensorGroups).length
            ? html `
                  <effortlesshome-select
                    .clearable=${true}
                    .items=${this.getSensorGroups()}
                    value=${this.data.group}
                    label="${localize('panels.sensors.cards.editor.fields.group.heading', this.hass.language)}"
                    @value-changed=${(ev) => {
                this.data = Object.assign(Object.assign({}, this.data), { group: ev.detail.value });
            }}
                  ></effortlesshome-select>
                `
            : ''}
            <mwc-button @click=${this.manageGroupsClick}>
              ${localize('panels.sensors.cards.editor.actions.setup_groups', this.hass.language)}
            </mwc-button>
          </div>
        </settings-row>

        <collapsible-section
          .narrow=${this.narrow}
          header=${localize('panels.sensors.cards.editor.actions.toggle_advanced', this.hass.language)}
        >
          ${!this.data.type || [ESensorTypes.Environmental, ESensorTypes.Other].includes(this.data.type)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.sensors.cards.editor.fields.always_on.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.sensors.cards.editor.fields.always_on.description', this.hass.language)}
                  </span>

                  <ha-switch
                    ?checked=${this.data.always_on}
                    @change=${(ev) => this._SetData({ always_on: ev.target.checked })}
                  ></ha-switch>
                </settings-row>
              `
            : ''}
          ${!this.data.type ||
            [ESensorTypes.Window, ESensorTypes.Door, ESensorTypes.Motion, ESensorTypes.Other].includes(this.data.type)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.sensors.cards.editor.fields.use_exit_delay.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.sensors.cards.editor.fields.use_exit_delay.description', this.hass.language)}
                  </span>

                  <ha-switch
                    ?checked=${this.data.use_exit_delay}
                    ?disabled=${this.data.always_on}
                    @change=${(ev) => this._SetData({ use_exit_delay: ev.target.checked })}
                  ></ha-switch>
                </settings-row>

                ${this.data.type == ESensorTypes.Motion && this.data.use_exit_delay
                ? html `
                      <settings-row .narrow=${this.narrow} nested>
                        <span slot="heading">
                          ${localize('panels.sensors.cards.editor.fields.allow_open.heading', this.hass.language)}
                        </span>
                        <span slot="description">
                          ${localize('panels.sensors.cards.editor.fields.allow_open.description', this.hass.language)}
                        </span>

                        <ha-switch
                          ?checked=${this.data.allow_open}
                          ?disabled=${this.data.always_on || this.data.arm_on_close}
                          @change=${(ev) => this._SetData({ allow_open: ev.target.checked })}
                        ></ha-switch>
                      </settings-row>
                    `
                : ''}
              `
            : ''}
          ${!this.data.type ||
            [ESensorTypes.Window, ESensorTypes.Door, ESensorTypes.Motion, ESensorTypes.Other].includes(this.data.type)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.sensors.cards.editor.fields.use_entry_delay.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.sensors.cards.editor.fields.use_entry_delay.description', this.hass.language)}
                  </span>

                  <ha-switch
                    ?checked=${this.data.use_entry_delay}
                    ?disabled=${this.data.always_on}
                    @change=${(ev) => this._SetData({ use_entry_delay: ev.target.checked })}
                  ></ha-switch>
                </settings-row>
              `
            : ''}
          ${!this.data.type || [ESensorTypes.Door, ESensorTypes.Other].includes(this.data.type)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.sensors.cards.editor.fields.arm_on_close.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.sensors.cards.editor.fields.arm_on_close.description', this.hass.language)}
                  </span>

                  <ha-switch
                    ?checked=${this.data.arm_on_close}
                    ?disabled=${this.data.always_on}
                    @change=${(ev) => this._SetData({ arm_on_close: ev.target.checked })}
                  ></ha-switch>
                </settings-row>
              `
            : ''}
          ${!this.data.type || [ESensorTypes.Window, ESensorTypes.Door, ESensorTypes.Other].includes(this.data.type)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.sensors.cards.editor.fields.auto_bypass.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.sensors.cards.editor.fields.auto_bypass.description', this.hass.language)}
                  </span>

                  <ha-switch
                    ?checked=${this.data.auto_bypass}
                    ?disabled=${this.data.always_on}
                    @change=${(ev) => this._SetData({ auto_bypass: ev.target.checked })}
                  ></ha-switch>
                </settings-row>

                ${this.data.auto_bypass
                ? html `
                      <settings-row .narrow=${this.narrow} .large=${this.modesByArea(this.data.area).length > 2} nested>
                        <span slot="heading">
                          ${localize('panels.sensors.cards.editor.fields.auto_bypass.modes', this.hass.language)}
                        </span>
                        <div>
                          ${this.modesByArea(this.data.area).map(el => html `
                              <mwc-button
                                class="${this.data.auto_bypass_modes.includes(el) && this.data.modes.includes(el)
                    ? 'active'
                    : ''}"
                                ?disabled=${!this.data.modes.includes(el)}
                                @click=${() => {
                    this.setBypassMode(el);
                }}
                              >
                                <ha-icon
                                  icon="${EArmModeIcons[Object.entries(EArmModes).find(([, v]) => v == el)[0]]}"
                                ></ha-icon>
                                ${localize(`common.modes_short.${el}`, this.hass.language)}
                              </mwc-button>
                            `)}
                        </div>
                      </settings-row>
                    `
                : ''}
              `
            : ''}

        ${(!this.data.type || [ESensorTypes.Window, ESensorTypes.Door, ESensorTypes.Other].includes(this.data.type))
            ? html `
              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.sensors.cards.editor.fields.allow_open.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.sensors.cards.editor.fields.allow_open.description', this.hass.language)}
                </span>

                <ha-switch
                  ?checked=${this.data.allow_open}
                  ?disabled=${this.data.always_on || this.data.arm_on_close}
                  @change=${(ev) => this._SetData({ allow_open: ev.target.checked })}
                ></ha-switch>
              </settings-row>
            `
            : ''}

          <settings-row .narrow=${this.narrow}>
            <span slot="heading">
              ${localize('panels.sensors.cards.editor.fields.trigger_unavailable.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.sensors.cards.editor.fields.trigger_unavailable.description', this.hass.language)}
            </span>

            <ha-switch
              ?checked=${this.data.trigger_unavailable}
              @change=${(ev) => this._SetData({ trigger_unavailable: ev.target.checked })}
            ></ha-switch>
          </settings-row>
        </collapsible-section>

        <div class="card-actions">
          <mwc-button @click=${this.saveClick}>
            ${this.hass.localize('ui.common.save')}
          </mwc-button>

          <mwc-button class="warning" @click=${this.deleteClick}>
            ${localize('panels.sensors.cards.editor.actions.remove', this.hass.language)}
          </mwc-button>
        </div>
      </ha-card>
    `;
    }
    modesByArea(area_id) {
        const modesPerArea = Object.keys(this.areas).reduce((obj, e) => Object.assign(obj, {
            [e]: Object.entries(this.areas[e].modes)
                .filter(([, v]) => v.enabled)
                .map(([k]) => k),
        }), {});
        return area_id ? modesPerArea[area_id] : Object.values(modesPerArea).reduce((a, b) => a.filter(i => b.includes(i)));
    }
    _SetData(data) {
        if (!this.data)
            return;
        for (const [key, val] of Object.entries(data)) {
            switch (key) {
                case 'always_on':
                    this.data = Object.assign(Object.assign({}, this.data), { always_on: val == true });
                    if (val)
                        this.data = Object.assign(Object.assign({}, this.data), { arm_on_close: false, use_exit_delay: false, use_entry_delay: false, allow_open: false, auto_bypass: false });
                    break;
                case 'use_entry_delay':
                    this.data = Object.assign(Object.assign({}, this.data), { use_entry_delay: val == true });
                    break;
                case 'use_exit_delay':
                    this.data = Object.assign(Object.assign({}, this.data), { use_exit_delay: val == true });
                    if (this.data.type === ESensorTypes.Motion && !val)
                        this.data = Object.assign(Object.assign({}, this.data), { allow_open: false });
                    break;
                case 'arm_on_close':
                    this.data = Object.assign(Object.assign({}, this.data), { arm_on_close: val == true });
                    if (val)
                        this.data = Object.assign(Object.assign({}, this.data), { always_on: false, allow_open: false });
                    break;
                case 'allow_open':
                    this.data = Object.assign(Object.assign({}, this.data), { allow_open: val == true });
                    if (val)
                        this.data = Object.assign(Object.assign({}, this.data), { arm_on_close: false, always_on: false });
                    break;
                case 'auto_bypass':
                    this.data = Object.assign(Object.assign({}, this.data), { auto_bypass: val == true });
                    if (val)
                        this.data = Object.assign(Object.assign({}, this.data), { always_on: false });
                    break;
                case 'trigger_unavailable':
                    this.data = Object.assign(Object.assign({}, this.data), { trigger_unavailable: val == true });
                    break;
            }
        }
    }
    setMode(mode) {
        if (!this.data)
            return;
        this.data = Object.assign(Object.assign({}, this.data), { modes: this.data.modes.includes(mode) ? Without(this.data.modes, mode) : Unique(this.data.modes.concat([mode])) });
    }
    setBypassMode(mode) {
        if (!this.data)
            return;
        this.data = Object.assign(Object.assign({}, this.data), { auto_bypass_modes: this.data.auto_bypass_modes.includes(mode)
                ? Without(this.data.auto_bypass_modes, mode)
                : Unique(this.data.auto_bypass_modes.concat([mode])) });
    }
    setType(type) {
        if (!this.data)
            return;
        const settings = type != ESensorTypes.Other ? sensorConfigByType(this.modesByArea(this.data.area))[type] : {};
        this.data = Object.assign(Object.assign(Object.assign({}, this.data), { type: type }), settings);
    }
    deleteClick(ev) {
        deleteSensor(this.hass, this.item)
            .catch(e => handleError(e, ev))
            .then(() => {
            this.cancelClick();
        });
    }
    saveClick(ev) {
        if (!this.data)
            return;
        const errors = [];
        if (this.data.new_entity_id && this.data.new_entity_id == this.data.entity_id)
            this.data = omit(this.data, 'new_entity_id');
        this.data = Object.assign(Object.assign({}, this.data), { auto_bypass_modes: this.data.auto_bypass_modes.filter(e => this.data.modes.includes(e)) });
        if (!this.data.area)
            errors.push(localize('panels.sensors.cards.editor.errors.no_area', this.hass.language));
        if (!this.data.modes.length && !this.data.always_on)
            errors.push(localize('panels.sensors.cards.editor.errors.no_modes', this.hass.language));
        if (this.data.auto_bypass && !this.data.auto_bypass_modes.length)
            errors.push(localize('panels.sensors.cards.editor.errors.no_auto_bypass_modes', this.hass.language));
        if (errors.length) {
            showErrorDialog(ev, html `
          ${localize('panels.sensors.cards.editor.errors.description', this.hass.language)}
          <ul>
            ${errors.map(e => html `
                  <li>${e}</li>
                `)}
          </ul>
        `);
        }
        else {
            saveSensor(this.hass, Object.assign({}, this.data))
                .catch(e => handleError(e, ev))
                .then(() => {
                this.cancelClick();
            });
        }
    }
    cancelClick() {
        navigate(this, exportPath('sensors'), true);
    }
    manageGroupsClick(ev) {
        const element = ev.target;
        fireEvent(element, 'show-dialog', {
            dialogTag: 'manage-sensor-groups-dialog',
            dialogImport: () => import('../../dialogs/manage-sensor-groups-dialog'),
            dialogParams: {},
        });
    }
    getSensorGroups() {
        return Object.keys(this.sensorGroups).map(e => Object({
            value: e,
            name: this.sensorGroups[e].name,
        }));
    }
};
SensorEditorCard.styles = commonStyle;
__decorate([
    property()
], SensorEditorCard.prototype, "hass", void 0);
__decorate([
    property()
], SensorEditorCard.prototype, "narrow", void 0);
__decorate([
    property()
], SensorEditorCard.prototype, "item", void 0);
__decorate([
    property()
], SensorEditorCard.prototype, "data", void 0);
__decorate([
    property()
], SensorEditorCard.prototype, "showBypassModes", void 0);
__decorate([
    state()
], SensorEditorCard.prototype, "entityIdUnlocked", void 0);
SensorEditorCard = __decorate([
    customElement('sensor-editor-card')
], SensorEditorCard);
export { SensorEditorCard };
