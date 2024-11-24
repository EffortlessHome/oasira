var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators';
import { localize } from '../../../localize/localize';
import { defaultSensorConfig, getConfigurableSensors, sensorClassToType } from '../../data/sensors';
import { fetchAreas, fetchSensors, saveSensor } from '../../data/websockets';
import { handleError, prettyPrint } from '../../helpers';
import { commonStyle } from '../../styles';
import { SubscribeMixin } from '../../subscribe-mixin';
import '../../components/effortlesshome-table.ts';
let AddSensorsCard = class AddSensorsCard extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.addSelection = [];
        this.areas = {};
        this.sensors = {};
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass) {
            return;
        }
        this.areas = await fetchAreas(this.hass);
    }
    async firstUpdated() {
        this.areas = await fetchAreas(this.hass);
        this.sensors = await fetchSensors(this.hass);
    }
    render() {
        const columns = {
            checkbox: {
                width: '48px',
                renderer: (item) => html `
          <ha-checkbox
            @change=${(e) => this.toggleSelect(e, item.id)}
            ?checked=${this.addSelection.includes(item.id)}
          ></ha-checkbox>
        `,
            },
            icon: {
                width: '40px',
                renderer: (item) => html `
          <state-badge .hass=${this.hass} .stateObj=${this.hass.states[item.id]}></state-badge>
        `,
            },
            name: {
                title: this.hass.localize('ui.components.entity.entity-picker.entity'),
                width: '40%',
                grow: true,
                text: true,
                renderer: (item) => html `
          ${prettyPrint(item.name)}
          <span class="secondary">${item.id}</span>
        `,
            },
            type: {
                title: localize('panels.sensors.cards.add_sensors.table.type', this.hass.language),
                width: '40%',
                hide: this.narrow,
                text: true,
                renderer: (item) => item.type
                    ? localize(`panels.sensors.cards.editor.fields.device_type.choose.${item.type}.name`, this.hass.language)
                    : this.hass.localize('state.default.unknown'),
            },
        };
        const sensorList = getConfigurableSensors(this.hass, Object.keys(this.sensors), true);
        const tableData = sensorList.map(item => {
            const output = Object.assign(Object.assign({}, item), { type: sensorClassToType(this.hass.states[item.id]), isSupportedType: sensorClassToType(this.hass.states[item.id]) !== undefined ? 'true' : 'false' });
            return output;
        });
        return html `
      <ha-card header="${localize('panels.sensors.cards.add_sensors.title', this.hass.language)}">
        <div class="card-content">
          ${localize('panels.sensors.cards.add_sensors.description', this.hass.language)}
        </div>

        <effortlesshome-table
          .hass=${this.hass}
          .columns=${columns}
          .data=${tableData}
          .filters=${this.getTableFilterOptions()}
        >
          ${localize('panels.sensors.cards.add_sensors.no_items', this.hass.language)}
        </effortlesshome-table>

        <div class="card-actions">
          <mwc-button @click=${this.addSelected} ?disabled=${this.addSelection.length == 0}>
            ${localize('panels.sensors.cards.add_sensors.actions.add_to_alarm', this.hass.language)}
          </mwc-button>
        </div>
      </ha-card>
    `;
    }
    toggleSelect(ev, id) {
        const checked = ev.target.checked;
        this.addSelection =
            checked && !this.addSelection.includes(id)
                ? [...this.addSelection, id]
                : !checked
                    ? this.addSelection.filter(e => e != id)
                    : this.addSelection;
    }
    addSelected(ev) {
        if (!this.hass)
            return;
        const modeList = Object.values(this.areas)
            .map(e => Object.entries(e.modes)
            .filter(([, v]) => v.enabled)
            .map(([k]) => k))
            .reduce((a, b) => a.filter(i => b.includes(i)));
        const data = this.addSelection
            // Map each selected item to its default sensor configuration
            .map((entity) => {
            const sensorConfig = defaultSensorConfig(this.hass.states[entity], modeList);
            return sensorConfig;
        })
            // Check if there is only one area and assign it to each sensor config
            .map((sensorConfig) => {
            if (Object.keys(this.areas).length === 1 && sensorConfig) {
                const singleArea = Object.keys(this.areas)[0];
                return Object.assign(sensorConfig, { area: singleArea });
            }
            else {
                return sensorConfig;
            }
        })
            // Filter out any falsy values and cast to effortlesshomeSensor[]
            .filter((sensorConfig) => sensorConfig);
        data.forEach(el => {
            saveSensor(this.hass, el)
                .catch(e => handleError(e, ev))
                .then();
        });
        this.addSelection = [];
    }
    getTableFilterOptions() {
        const filterConfig = {
            isSupportedType: {
                name: localize('panels.sensors.cards.add_sensors.actions.filter_supported', this.hass.language),
                items: [{
                        value: 'true',
                        name: 'true'
                    }],
                value: ['true'],
                binary: true
            },
        };
        return filterConfig;
    }
};
AddSensorsCard.styles = commonStyle;
__decorate([
    property()
], AddSensorsCard.prototype, "hass", void 0);
__decorate([
    property()
], AddSensorsCard.prototype, "narrow", void 0);
__decorate([
    property()
], AddSensorsCard.prototype, "addSelection", void 0);
__decorate([
    property()
], AddSensorsCard.prototype, "areas", void 0);
__decorate([
    property()
], AddSensorsCard.prototype, "sensors", void 0);
AddSensorsCard = __decorate([
    customElement('add-sensors-card')
], AddSensorsCard);
export { AddSensorsCard };
