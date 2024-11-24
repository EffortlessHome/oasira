var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { mdiPencil } from '@mdi/js';
import { prettyPrint, sortAlphabetically } from '../../helpers';
import '../../components/settings-row.ts';
import '../../components/effortlesshome-table.ts';
import '../../dialogs/create-area-dialog';
import { commonStyle } from '../../styles';
import { localize } from '../../../localize/localize';
import { SubscribeMixin } from '../../subscribe-mixin';
import { fetchAreas, fetchSensors, fetchAutomations } from '../../data/websockets';
import { exportPath } from '../../common/navigation';
import { fireEvent } from '../../fire_event';
let AreaConfigCard = class AreaConfigCard extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.areas = {};
        this.sensors = {};
        this.automations = {};
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
    render() {
        if (!this.hass)
            return html ``;
        const areas = Object.values(this.areas);
        areas.sort(sortAlphabetically);
        const columns = {
            actions: {
                width: '48px',
            },
            name: {
                title: this.hass.localize('ui.components.area-picker.add_dialog.name'),
                width: '40%',
                grow: true,
                text: true,
            },
            remarks: {
                title: localize('panels.general.cards.areas.table.remarks', this.hass.language),
                width: '60%',
                hide: this.narrow,
                text: true,
            },
        };
        const data = Object.values(areas).map(item => {
            const sensors = Object.values(this.sensors).filter(e => e.area == item.area_id).length;
            const automations = Object.values(areas).length == 1
                ? Object.values(this.automations).filter(e => { var _a, _b; return ((_a = e.triggers) === null || _a === void 0 ? void 0 : _a.map(e => e.area).includes(item.area_id)) || !((_b = e.triggers) === null || _b === void 0 ? void 0 : _b.map(e => e.area).length); }).length
                : Object.values(this.automations).filter(e => { var _a; return (_a = e.triggers) === null || _a === void 0 ? void 0 : _a.map(e => e.area).includes(item.area_id); }).length;
            const summary_sensors = `<a href="${exportPath('sensors', { filter: { area: item.area_id } })}">${localize('panels.general.cards.areas.table.summary_sensors', this.hass.language, 'number', sensors)}</a>`;
            const summary_automations = `<a href="${exportPath('actions', { filter: { area: item.area_id } })}">${localize('panels.general.cards.areas.table.summary_automations', this.hass.language, 'number', automations)}</a>`;
            const output = {
                id: item.area_id,
                actions: html `
          <ha-icon-button @click=${(ev) => this.editClick(ev, item.area_id)} .path=${mdiPencil}></ha-icon-button>
        `,
                name: prettyPrint(item.name),
                remarks: unsafeHTML(localize('panels.general.cards.areas.table.summary', this.hass.language, 'summary_sensors', summary_sensors, 'summary_automations', summary_automations)),
            };
            return output;
        });
        return html `
      <ha-card header="${localize('panels.general.cards.areas.title', this.hass.language)}">
        <div class="card-content">
          ${localize('panels.general.cards.areas.description', this.hass.language)}
        </div>

        <effortlesshome-table .columns=${columns} .data=${data}>
          ${localize('panels.general.cards.areas.no_items', this.hass.language)}
        </effortlesshome-table>
        <div class="card-actions">
          <mwc-button @click=${this.addClick}>
            ${localize('panels.general.cards.areas.actions.add', this.hass.language)}
          </mwc-button>
        </div>
      </ha-card>
    `;
    }
    addClick(ev) {
        const element = ev.target;
        fireEvent(element, 'show-dialog', {
            dialogTag: 'create-area-dialog',
            dialogImport: () => import('../../dialogs/create-area-dialog'),
            dialogParams: {},
        });
    }
    editClick(ev, area_id) {
        const element = ev.target;
        fireEvent(element, 'show-dialog', {
            dialogTag: 'create-area-dialog',
            dialogImport: () => import('../../dialogs/create-area-dialog'),
            dialogParams: { area_id: area_id },
        });
    }
};
AreaConfigCard.styles = commonStyle;
__decorate([
    property()
], AreaConfigCard.prototype, "narrow", void 0);
__decorate([
    property()
], AreaConfigCard.prototype, "path", void 0);
__decorate([
    property()
], AreaConfigCard.prototype, "config", void 0);
__decorate([
    property()
], AreaConfigCard.prototype, "areas", void 0);
__decorate([
    property()
], AreaConfigCard.prototype, "sensors", void 0);
__decorate([
    property()
], AreaConfigCard.prototype, "automations", void 0);
AreaConfigCard = __decorate([
    customElement('area-config-card')
], AreaConfigCard);
export { AreaConfigCard };
