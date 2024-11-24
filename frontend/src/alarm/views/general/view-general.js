var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { fetchConfig, saveConfig, fetchAreas, fetchAutomations, deleteAutomation } from '../../data/websockets';
import { SubscribeMixin } from '../../subscribe-mixin';
import { localize } from '../../../localize/localize';
import { pick, handleError, navigate } from '../../helpers';
import { loadHaForm } from '../../load-ha-elements';
import { commonStyle } from '../../styles';
import { exportPath } from '../../common/navigation';
import './alarm-mode-card';
import './mqtt-config-card.ts';
import './area-config-card.ts';
import '../../components/settings-row.ts';
import '../../dialogs/edit-master-dialog.ts';
import '../../dialogs/confirm-delete-dialog.ts';
import { fireEvent } from '../../fire_event';
let AlarmViewGeneral = class AlarmViewGeneral extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.areas = {};
        this.automations = {};
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass) {
            return;
        }
        this.config = await fetchConfig(this.hass);
        this.areas = await fetchAreas(this.hass);
        this.automations = await fetchAutomations(this.hass);
        this.data = pick(this.config, ['trigger_time', 'disarm_after_trigger', 'mqtt', 'master']);
    }
    firstUpdated() {
        (async () => await loadHaForm())();
    }
    render() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!this.hass || !this.config || !this.data)
            return html ``;
        if (this.path.subpage == 'mqtt_configuration') {
            return html `
        <mqtt-config-card .hass=${this.hass} .narrow=${this.narrow}></mqtt-config-card>
      `;
        }
        if (this.path.params.edit_area) {
            return html `
        <area-editor-card
          .hass=${this.hass}
          .narrow=${this.narrow}
          item=${this.path.params.edit_area}
        ></area-editor-card>
      `;
        }
        else {
            return html `
        <ha-card header="${localize('panels.general.title', this.hass.language)}">
          <div class="card-content">
            ${localize('panels.general.cards.general.description', this.hass.language)}
          </div>

          <settings-row .narrow=${this.narrow}>
            <span slot="heading">
              ${localize('panels.general.cards.general.fields.disarm_after_trigger.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.general.cards.general.fields.disarm_after_trigger.description', this.hass.language)}
            </span>
            <ha-switch
              ?checked=${this.data.disarm_after_trigger}
              @change=${(ev) => {
                this.saveData({ disarm_after_trigger: ev.target.checked });
            }}
            ></ha-switch>
          </settings-row>

          <settings-row .narrow=${this.narrow}>
            <span slot="heading">
              ${localize('panels.general.cards.general.fields.enable_mqtt.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.general.cards.general.fields.enable_mqtt.description', this.hass.language)}
            </span>
            <ha-switch
              ?checked=${(_b = (_a = this.data) === null || _a === void 0 ? void 0 : _a.mqtt) === null || _b === void 0 ? void 0 : _b.enabled}
              @change=${(ev) => {
                this.saveData({ mqtt: Object.assign(Object.assign({}, this.data.mqtt), { enabled: ev.target.checked }) });
            }}
            ></ha-switch>
          </settings-row>

          ${((_d = (_c = this.data) === null || _c === void 0 ? void 0 : _c.mqtt) === null || _d === void 0 ? void 0 : _d.enabled)
                ? html `
                <div style="padding: 0px 0px 16px 16px">
                  <mwc-button
                    outlined
                    @click=${() => navigate(this, exportPath('general', 'mqtt_configuration'), true)}
                  >
                    ${localize('panels.general.cards.general.actions.setup_mqtt', this.hass.language)}
                  </mwc-button>
                </div>
              `
                : ''}
          ${Object.keys(this.areas).length >= 2
                ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.general.cards.general.fields.enable_master.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.general.cards.general.fields.enable_master.description', this.hass.language)}
                  </span>
                  <ha-switch
                    ?checked=${((_f = (_e = this.data) === null || _e === void 0 ? void 0 : _e.master) === null || _f === void 0 ? void 0 : _f.enabled) && Object.keys(this.areas).length >= 2}
                    ?disabled=${Object.keys(this.areas).length < 2}
                    @change=${this.toggleEnableMaster}
                  ></ha-switch>
                </settings-row>
              `
                : ''}
          ${((_h = (_g = this.data) === null || _g === void 0 ? void 0 : _g.master) === null || _h === void 0 ? void 0 : _h.enabled) && Object.keys(this.areas).length >= 2
                ? html `
                <div style="padding: 0px 0px 16px 16px">
                  <mwc-button outlined @click=${this.setupMasterClick}>
                    ${localize('panels.general.cards.general.actions.setup_master', this.hass.language)}
                  </mwc-button>
                </div>
              `
                : ''}
        </ha-card>

        <alarm-mode-card .hass=${this.hass} .narrow=${this.narrow}></alarm-mode-card>

        <area-config-card .hass=${this.hass} .narrow=${this.narrow}></area-config-card>
      `;
        }
    }
    setupMasterClick(ev) {
        const element = ev.target;
        fireEvent(element, 'show-dialog', {
            dialogTag: 'edit-master-dialog',
            dialogImport: () => import('../../dialogs/edit-master-dialog'),
            dialogParams: {},
        });
    }
    async toggleEnableMaster(ev) {
        const target = ev.target;
        let enabled = target.checked;
        if (!enabled) {
            const automations = Object.values(this.automations).filter(e => e.triggers.some(e => !e.area));
            if (automations.length) {
                const result = await new Promise(resolve => {
                    fireEvent(target, 'show-dialog', {
                        dialogTag: 'confirm-delete-dialog',
                        dialogImport: () => import('../../dialogs/confirm-delete-dialog'),
                        dialogParams: {
                            title: localize('panels.general.dialogs.disable_master.title', this.hass.language),
                            description: localize('panels.general.dialogs.disable_master.description', this.hass.language, 'automations', String(automations.length)),
                            cancel: () => resolve(false),
                            confirm: () => resolve(true),
                        },
                    });
                });
                if (!result) {
                    enabled = true;
                    target.checked = true;
                }
                else if (!enabled && automations.length) {
                    automations.forEach(e => {
                        deleteAutomation(this.hass, e.automation_id).catch(e => handleError(e, ev));
                    });
                }
            }
        }
        this.saveData({ master: Object.assign(Object.assign({}, this.data.master), { enabled: enabled }) });
    }
    saveData(changes) {
        if (!this.hass || !this.data)
            return;
        this.data = Object.assign(Object.assign({}, this.data), changes);
        saveConfig(this.hass, this.data)
            .catch(e => handleError(e, this.shadowRoot.querySelector('ha-card')))
            .then();
    }
};
AlarmViewGeneral.styles = commonStyle;
__decorate([
    property()
], AlarmViewGeneral.prototype, "narrow", void 0);
__decorate([
    property()
], AlarmViewGeneral.prototype, "path", void 0);
__decorate([
    property()
], AlarmViewGeneral.prototype, "data", void 0);
__decorate([
    property()
], AlarmViewGeneral.prototype, "config", void 0);
__decorate([
    property()
], AlarmViewGeneral.prototype, "areas", void 0);
__decorate([
    property()
], AlarmViewGeneral.prototype, "automations", void 0);
AlarmViewGeneral = __decorate([
    customElement('alarm-view-general')
], AlarmViewGeneral);
export { AlarmViewGeneral };
