var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { loadHaForm } from '../../load-ha-elements';
import { commonStyle } from '../../styles';
import '../../components/settings-row.ts';
import '../../components/collapsible-section.ts';
import { fetchConfig, saveConfig, fetchAreas } from '../../data/websockets';
import { SubscribeMixin } from '../../subscribe-mixin';
import { localize } from '../../../localize/localize';
import { handleError, prettyPrint, filterState, commandToState, Assign, navigate } from '../../helpers';
import { AlarmStates, AlarmCommands } from '../../const';
import { exportPath } from '../../common/navigation';
let MqttConfigCard = class MqttConfigCard extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.areas = {};
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass) {
            return;
        }
        const config = await fetchConfig(this.hass);
        this.config = config;
        this.areas = await fetchAreas(this.hass);
        this.selection = config.mqtt;
    }
    firstUpdated() {
        (async () => await loadHaForm())();
    }
    render() {
        if (!this.hass || !this.selection)
            return html ``;
        return html `
      <ha-card>
        <div class="card-header">
          <div class="name">${localize('panels.general.cards.mqtt.title', this.hass.language)}</div>
          <ha-icon-button .path=${mdiClose} @click=${this.cancelClick}></ha-icon-button>
        </div>
        <div class="card-content">${localize('panels.general.cards.mqtt.description', this.hass.language)}</div>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.general.cards.mqtt.fields.state_topic.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.general.cards.mqtt.fields.state_topic.description', this.hass.language)}
          </span>
          <ha-textfield
            label="${localize('panels.general.cards.mqtt.fields.state_topic.heading', this.hass.language)}"
            value=${this.selection.state_topic}
            @change=${(ev) => {
            this.selection = Object.assign(Object.assign({}, this.selection), { state_topic: ev.target.value });
        }}
          ></ha-textfield>
        </settings-row>

        <collapsible-section
          .narrow=${this.narrow}
          header=${localize('panels.general.cards.mqtt.fields.state_payload.heading', this.hass.language)}
        >
          ${Object.values(AlarmStates)
            .filter(state => Object.values(this.areas).some(area => filterState(state, area.modes)))
            .map(e => html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">${prettyPrint(e)}</span>
                  <span slot="description">
                    ${localize('panels.general.cards.mqtt.fields.state_payload.item', this.hass.language, '{state}', prettyPrint(e))}
                  </span>
                  <ha-textfield
                    label=${prettyPrint(e)}
                    placeholder=${e}
                    value=${this.selection.state_payload[e] || ''}
                    @change=${(ev) => {
            this.selection = Assign(this.selection, {
                state_payload: { [e]: ev.target.value },
            });
        }}
                  ></ha-textfield>
                </settings-row>
              `)}
        </collapsible-section>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.general.cards.mqtt.fields.event_topic.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.general.cards.mqtt.fields.event_topic.description', this.hass.language)}
          </span>
          <ha-textfield
            label="${localize('panels.general.cards.mqtt.fields.event_topic.heading', this.hass.language)}"
            value=${this.selection.event_topic}
            @change=${(ev) => {
            this.selection = Object.assign(Object.assign({}, this.selection), { event_topic: ev.target.value });
        }}
          ></ha-textfield>
        </settings-row>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.general.cards.mqtt.fields.command_topic.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.general.cards.mqtt.fields.command_topic.description', this.hass.language)}
          </span>
          <ha-textfield
            label="${localize('panels.general.cards.mqtt.fields.command_topic.heading', this.hass.language)}"
            value=${this.selection.command_topic}
            @change=${(ev) => {
            this.selection = Object.assign(Object.assign({}, this.selection), { command_topic: ev.target.value });
        }}
          ></ha-textfield>
        </settings-row>

        <collapsible-section
          .narrow=${this.narrow}
          header=${localize('panels.general.cards.mqtt.fields.command_payload.heading', this.hass.language)}
        >
          ${Object.values(AlarmCommands)
            .filter(command => Object.values(this.areas).some(area => filterState(commandToState(command), area.modes)))
            .map(e => html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">${prettyPrint(e)}</span>
                  <span slot="description">
                    ${localize('panels.general.cards.mqtt.fields.command_payload.item', this.hass.language, '{command}', prettyPrint(e))}
                  </span>
                  <ha-textfield
                    label=${prettyPrint(e)}
                    placeholder=${e}
                    value=${this.selection.command_payload[e] || ''}
                    @change=${(ev) => {
            this.selection = Assign(this.selection, {
                command_payload: { [e]: ev.target.value },
            });
        }}
                  ></ha-textfield>
                </settings-row>
              `)}
        </collapsible-section>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.general.cards.mqtt.fields.require_code.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.general.cards.mqtt.fields.require_code.description', this.hass.language)}
          </span>
          <ha-switch
            ?checked=${this.selection.require_code}
            ?disabled=${!this.config.code_arm_required && !this.config.code_disarm_required}
            @change=${(ev) => {
            this.selection = Object.assign(Object.assign({}, this.selection), { require_code: ev.target.checked });
        }}
          ></ha-switch>
        </settings-row>

        <div class="card-actions">
          <mwc-button @click=${this.saveClick}>
            ${this.hass.localize('ui.common.save')}
          </mwc-button>
        </div>
      </ha-card>
    `;
    }
    saveClick(ev) {
        if (!this.hass)
            return;
        saveConfig(this.hass, { mqtt: Object.assign(Object.assign({}, this.selection), { enabled: true }) })
            .catch(e => handleError(e, ev))
            .then(() => {
            this.cancelClick();
        });
    }
    cancelClick() {
        navigate(this, exportPath('general'), true);
    }
};
MqttConfigCard.styles = commonStyle;
__decorate([
    property()
], MqttConfigCard.prototype, "narrow", void 0);
__decorate([
    property()
], MqttConfigCard.prototype, "config", void 0);
__decorate([
    property()
], MqttConfigCard.prototype, "areas", void 0);
__decorate([
    property()
], MqttConfigCard.prototype, "selection", void 0);
MqttConfigCard = __decorate([
    customElement('mqtt-config-card')
], MqttConfigCard);
export { MqttConfigCard };
