var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { loadHaForm } from '../../load-ha-elements';
import { SubscribeMixin } from '../../subscribe-mixin';
import { commonStyle } from '../../styles';
import { fetchAutomations, saveAutomation, fetchAreas, fetchConfig } from '../../data/websockets';
import { handleError, isDefined, sortAlphabetically, navigate } from '../../helpers';
import { localize } from '../../../localize/localize';
import './notification-editor-card.ts';
import './automation-editor-card.ts';
import '../../components/settings-row.ts';
import { EAutomationTypes } from '../../const';
import { getAreaOptions } from '../../data/actions';
import { exportPath } from '../../common/navigation';
const noArea = 'no_area';
let AlarmViewActions = class AlarmViewActions extends SubscribeMixin(LitElement) {
    constructor() {
        super(...arguments);
        this.areas = {};
        this.getAreaForAutomation = (automation) => {
            if (!this.config)
                return;
            const areaOptions = getAreaOptions(this.areas, this.config);
            let area = automation.triggers[0].area;
            return isDefined(area) && areaOptions.includes(area) ? area : undefined;
        };
    }
    hassSubscribe() {
        this._fetchData();
        return [this.hass.connection.subscribeMessage(() => this._fetchData(), { type: 'effortlesshome_config_updated' })];
    }
    async _fetchData() {
        if (!this.hass) {
            return;
        }
        const automations = await fetchAutomations(this.hass);
        this.automations = Object.values(automations);
        this.areas = await fetchAreas(this.hass);
        this.config = await fetchConfig(this.hass);
    }
    firstUpdated() {
        var _a;
        if (this.path.filter) {
            this.selectedArea = (_a = this.path.filter) === null || _a === void 0 ? void 0 : _a.area;
        }
        (async () => await loadHaForm())();
    }
    render() {
        if (!this.hass || !this.automations || !this.config)
            return html ``;
        if (this.path.subpage == 'new_notification') {
            return html `
        <notification-editor-card .hass=${this.hass} .narrow=${this.narrow}></notification-editor-card>
      `;
        }
        else if (this.path.params.edit_notification) {
            const config = this.automations.find(e => e.automation_id == this.path.params.edit_notification && e.type == EAutomationTypes.Notification);
            return html `
        <notification-editor-card .hass=${this.hass} .narrow=${this.narrow} .item=${config}></notification-editor-card>
      `;
        }
        else if (this.path.subpage == 'new_action') {
            return html `
        <automation-editor-card .hass=${this.hass} .narrow=${this.narrow}></automation-editor-card>
      `;
        }
        else if (this.path.params.edit_action) {
            const config = this.automations.find(e => e.automation_id == this.path.params.edit_action && e.type == EAutomationTypes.Action);
            return html `
        <automation-editor-card .hass=${this.hass} .narrow=${this.narrow} .item=${config}></automation-editor-card>
      `;
        }
        else {
            const warningTooltip = () => html `
        <paper-tooltip animation-delay="0">
          ${localize('panels.actions.cards.notifications.table.no_area_warning', this.hass.language)}
        </paper-tooltip>
      `;
            const columns = {
                type: {
                    width: '40px',
                    renderer: (item) => item.area == noArea && !this.config.master.enabled
                        ? html `
                  ${warningTooltip()}
                  <ha-icon icon="mdi:alert" style="color: var(--error-color)"></ha-icon>
                `
                        : item.type == EAutomationTypes.Notification
                            ? html `
                  <ha-icon icon="hass:message-text-outline"  class="${!item.enabled ? 'disabled' : ''}"></ha-icon>
                `
                            : html `
                  <ha-icon icon="hass:flash"  class="${!item.enabled ? 'disabled' : ''}"></ha-icon>
                `,
                },
                name: {
                    title: this.hass.localize('ui.components.area-picker.add_dialog.name'),
                    renderer: (item) => html `
            ${item.area == noArea && !this.config.master.enabled ? warningTooltip() : ''}
            <span class="${!item.enabled ? 'disabled' : ''}">${item.name}</span>
          `,
                    width: '40%',
                    grow: true,
                    text: true,
                },
                enabled: {
                    title: localize('common.enabled', this.hass.language),
                    width: '68px',
                    align: 'center',
                    renderer: (item) => html `
            <ha-switch
              ?checked=${item.enabled}
              @click=${(ev) => {
                        ev.stopPropagation();
                        this.toggleEnable(ev, item.automation_id);
                    }}
            ></ha-switch>
          `,
                },
            };
            const notificationData = this.automations
                .filter(e => e.type == EAutomationTypes.Notification)
                .map(e => Object(Object.assign(Object.assign({}, e), { id: e.automation_id, warning: !this.config.master.enabled && !this.getAreaForAutomation(e), area: this.getAreaForAutomation(e) || noArea })));
            const automationData = this.automations
                .filter(e => e.type == EAutomationTypes.Action)
                .map(e => Object(Object.assign(Object.assign({}, e), { id: e.automation_id, warning: !this.config.master.enabled && !this.getAreaForAutomation(e), area: this.getAreaForAutomation(e) || noArea })));
            return html `
        <ha-card header="${localize('panels.actions.cards.notifications.title', this.hass.language)}">
          <div class="card-content">
            ${localize('panels.actions.cards.notifications.description', this.hass.language)}
          </div>

          <effortlesshome-table
            .hass=${this.hass}
            ?selectable=${true}
            .columns=${columns}
            .data=${notificationData}
            .filters=${this.getTableFilterOptions()}
            @row-click=${(ev) => navigate(this, exportPath('actions', { params: { edit_notification: ev.detail.id } }), true)}
          >
            ${localize('panels.actions.cards.notifications.table.no_items', this.hass.language)}
          </effortlesshome-table>

          <div class="card-actions">
            <mwc-button @click=${this.addNotificationClick}>
              ${localize('panels.actions.cards.notifications.actions.new_notification', this.hass.language)}
            </mwc-button>
          </div>
        </ha-card>

        <ha-card header="${localize('panels.actions.title', this.hass.language)}">
          <div class="card-content">${localize('panels.actions.cards.actions.description', this.hass.language)}</div>

          <effortlesshome-table
            .hass=${this.hass}
            ?selectable=${true}
            .columns=${columns}
            .data=${automationData}
            .filters=${this.getTableFilterOptions()}
            @row-click=${(ev) => navigate(this, exportPath('actions', { params: { edit_action: ev.detail.id } }), true)}
          >
            ${localize('panels.actions.cards.actions.table.no_items', this.hass.language)}
          </effortlesshome-table>

          <div class="card-actions">
            <mwc-button @click=${this.addActionClick}>
              ${localize('panels.actions.cards.actions.actions.new_action', this.hass.language)}
            </mwc-button>
          </div>
        </ha-card>
      `;
        }
    }
    toggleEnable(ev, item_id) {
        saveAutomation(this.hass, { automation_id: item_id, enabled: !ev.target.checked })
            .catch(e => handleError(e, ev))
            .then();
    }
    getTableFilterOptions() {
        if (!this.hass)
            return;
        let areaFilterOptions = Object.values(this.areas)
            .map(e => Object({
            value: e.area_id,
            name: e.name,
            badge: (list) => list.filter(item => item.area == e.area_id).length,
        }))
            .sort(sortAlphabetically);
        if (Object.values(this.automations || []).filter(e => !this.getAreaForAutomation(e)).length)
            areaFilterOptions = [
                {
                    value: noArea,
                    name: this.config.master.enabled
                        ? this.config.master.name
                        : this.hass.localize('state_attributes.climate.preset_mode.none'),
                    badge: (list) => list.filter(item => item.area == noArea).length,
                },
                ...areaFilterOptions,
            ];
        const filterConfig = {
            area: {
                name: localize('components.table.filter.item', this.hass.language, 'name', localize('panels.actions.cards.new_action.fields.area.heading', this.hass.language)),
                items: areaFilterOptions,
                value: this.selectedArea ? [this.selectedArea] : [],
            },
        };
        return filterConfig;
    }
    addNotificationClick() {
        navigate(this, exportPath('actions', 'new_notification'), true);
    }
    addActionClick() {
        navigate(this, exportPath('actions', 'new_action'), true);
    }
};
AlarmViewActions.styles = commonStyle;
__decorate([
    property()
], AlarmViewActions.prototype, "hass", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "narrow", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "path", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "alarmEntity", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "automations", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "areas", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "config", void 0);
__decorate([
    property()
], AlarmViewActions.prototype, "selectedArea", void 0);
AlarmViewActions = __decorate([
    customElement('alarm-view-actions')
], AlarmViewActions);
export { AlarmViewActions };
