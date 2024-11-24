var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { EAlarmEvent, } from '../../types';
import { handleError, omit, showErrorDialog, isDefined, computeName, computeDomain, navigate } from '../../helpers';
import { saveAutomation, fetchAreas, fetchConfig, deleteAutomation } from '../../data/websockets';
import { localize } from '../../../localize/localize';
import { computeEventDisplay, computeAreaDisplay, computeArmModeDisplay, getAreaOptions, getArmModeOptions, computeServiceDisplay, getNotifyServices, getWildcardOptions, isValidString, isString, isObject, getOpenSensorsWildCardOptions, getArmModeWildCardOptions, computeEntityDisplay, getEntitiesByDomain, } from '../../data/actions';
import { EAutomationTypes } from '../../const';
import { exportPath } from '../../common/navigation';
import { loadHaYamlEditor } from '../../load-ha-elements';
import '../../components/effortlesshome-selector';
import '../../components/effortlesshome-select';
import '../../components/effortlesshome-chip-set';
var ViewMode;
(function (ViewMode) {
    ViewMode[ViewMode["Yaml"] = 0] = "Yaml";
    ViewMode[ViewMode["UI"] = 1] = "UI";
})(ViewMode || (ViewMode = {}));
let NotificationEditorCard = class NotificationEditorCard extends LitElement {
    constructor() {
        super(...arguments);
        this.config = {
            type: EAutomationTypes.Notification,
            triggers: [{}],
            actions: [{}],
        };
        this.viewMode = ViewMode.UI;
        this.errors = {};
    }
    async firstUpdated() {
        await loadHaYamlEditor();
        this.areas = await fetchAreas(this.hass);
        this.effortlesshomeConfig = await fetchConfig(this.hass);
        if (this.item) {
            let actions = this.item.actions.map(e => omit(e, 'entity_id'));
            this.config = Object.assign(Object.assign({}, this.item), { actions: [actions[0], ...actions.slice(1)] });
            if (this.config.triggers.length > 1)
                this.config = Object.assign(Object.assign({}, this.config), { triggers: [this.config.triggers[0]] });
            let area = this.config.triggers[0].area;
            if (isDefined(area) && !getAreaOptions(this.areas, this.effortlesshomeConfig).includes(area))
                area = undefined;
            else if (area === null)
                area = 0;
            this._setArea(new CustomEvent('value-changed', { detail: { value: area } }));
        }
        //automatically set area if there is only 1 option
        if (!isDefined(this.config.triggers[0].area)) {
            const areaOptions = getAreaOptions(this.areas, this.effortlesshomeConfig);
            if (areaOptions.length == 1)
                this._setArea(new CustomEvent('value-changed', { detail: { value: areaOptions[0] } }));
            else if (areaOptions.includes(0))
                this._setArea(new CustomEvent('value-changed', { detail: { value: 0 } }));
        }
    }
    render() {
        var _a, _b, _c, _d, _e;
        if (!this.hass || !this.areas || !this.effortlesshomeConfig)
            return html ``;
        return html `
      <div class="heading">
        <ha-icon-button .path=${mdiClose} @click=${this._cancelClick} class="icon"></ha-icon-button>
        <div class="header">${localize('panels.actions.cards.new_notification.title', this.hass.language)}</div>
        <div class="description">
          ${localize('panels.actions.cards.new_notification.description', this.hass.language)}
        </div>
      </div>
      <div class="section-header">${localize('panels.actions.cards.new_notification.trigger', this.hass.language)}</div>
      <ha-card>
        <div class="card-content">
          <settings-row .narrow=${this.narrow} .large=${true} first>
            <span slot="heading">
              ${localize('panels.actions.cards.new_notification.fields.event.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.actions.cards.new_notification.fields.event.description', this.hass.language)}
            </span>

            <effortlesshome-select
              .hass=${this.hass}
              .items=${Object.values(EAlarmEvent).map(e => computeEventDisplay(e, this.hass))}
              label=${localize('panels.actions.cards.new_action.fields.event.heading', this.hass.language)}
              icons=${true}
              .value=${this.config.triggers[0].event}
              @value-changed=${this._setEvent}
              ?invalid=${this.errors.event}
            ></effortlesshome-select>
          </settings-row>

          ${Object.keys(this.areas).length > 1
            ? html `
                <settings-row .narrow=${this.narrow} .large=${true}>
                  <span slot="heading">
                    ${localize('panels.actions.cards.new_action.fields.area.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.actions.cards.new_action.fields.area.description', this.hass.language)}
                  </span>

                  <effortlesshome-select
                    .hass=${this.hass}
                    .items=${getAreaOptions(this.areas, this.effortlesshomeConfig).map(e => computeAreaDisplay(e, this.areas, this.effortlesshomeConfig))}
                    clearable=${true}
                    label=${localize('panels.actions.cards.new_action.fields.area.heading', this.hass.language)}
                    .value=${this.config.triggers[0].area}
                    @value-changed=${this._setArea}
                    ?invalid=${this.errors.area || (!this.config.triggers[0].area && !this.effortlesshomeConfig.master.enabled)}
                  ></effortlesshome-select>
                </settings-row>
              `
            : ''}

          <settings-row .narrow=${this.narrow} .large=${true} last>
            <span slot="heading">
              ${localize('panels.actions.cards.new_notification.fields.mode.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.actions.cards.new_notification.fields.mode.description', this.hass.language)}
            </span>

            <effortlesshome-selector
              .hass=${this.hass}
              .items=${getArmModeOptions(this.config.triggers[0].area, this.areas).map(e => computeArmModeDisplay(e, this.hass))}
              label=${localize('panels.actions.cards.new_action.fields.mode.heading', this.hass.language)}
              .value=${this.config.triggers[0].modes || []}
              @value-changed=${this._setModes}
              ?invalid=${this.errors.modes}
            ></effortlesshome-selector>
          </settings-row>
        </div>
      </ha-card>

      <div class="section-header">${localize('panels.actions.cards.new_notification.action', this.hass.language)}</div>
      <ha-card>
        <div class="card-content">
          ${this.viewMode == ViewMode.UI
            ? html `
                <settings-row .narrow=${this.narrow} .large=${true} first>
                  <span slot="heading">
                    ${localize('panels.actions.cards.new_notification.fields.target.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.actions.cards.new_notification.fields.target.description', this.hass.language)}
                  </span>

                  <effortlesshome-select
                    .hass=${this.hass}
                    .items=${computeServiceDisplay(this.hass, ...getNotifyServices(this.hass))}
                    ?disabled=${!getNotifyServices(this.hass).length}
                    label=${localize('panels.actions.cards.new_notification.fields.target.heading', this.hass.language)}
                    icons=${true}
                    .value=${this.config.actions[0].service}
                    @value-changed=${this._setService}
                    ?invalid=${this.errors.service}
                    allow-custom-value
                  ></effortlesshome-select>
                </settings-row>

                ${!this.config.actions[0].service || computeDomain(this.config.actions[0].service) == 'notify'
                ? html `
                      <settings-row .narrow=${this.narrow}>
                        <span slot="heading">
                          ${localize('panels.actions.cards.new_notification.fields.title.heading', this.hass.language)}
                        </span>
                        <span slot="description">
                          ${localize('panels.actions.cards.new_notification.fields.title.description', this.hass.language)}
                        </span>

                        <ha-textfield
                          label="${localize('panels.actions.cards.new_notification.fields.title.heading', this.hass.language)}"
                          .value=${((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.title) || ''}
                          @input=${this._setTitle}
                          ?invalid=${this.errors.title}
                        ></ha-textfield>
                      </settings-row>
                    `
                : ''}
                ${this.config.actions[0].service && computeDomain(this.config.actions[0].service) == 'tts'
                ? html `
                      <settings-row .narrow=${this.narrow} .large=${true} first>
                        <span slot="heading">
                          ${localize('panels.actions.cards.new_action.fields.entity.heading', this.hass.language)}
                        </span>
                        <span slot="description">
                          ${localize('panels.actions.cards.new_action.fields.entity.description', this.hass.language)}
                        </span>

                        <effortlesshome-select
                          .items=${computeEntityDisplay(this.config.actions[0].service == 'tts.speak' ? getEntitiesByDomain(this.hass, 'tts') : getEntitiesByDomain(this.hass, 'media_player', 'tts'), this.hass)}
                          label=${localize('panels.actions.cards.new_action.fields.entity.heading', this.hass.language)}
                          .value=${((_b = this.config.actions[0].data) === null || _b === void 0 ? void 0 : _b.entity_id) || ''}
                          @value-changed=${this._setEntity}
                          .icons=${true}
                          ?invalid=${this.errors.entity}
                        ></effortlesshome-select>
                      </settings-row>
                    `
                : ''}

                  
                ${this.config.actions[0].service && this.config.actions[0].service == 'tts.speak'
                ? html `
                      <settings-row .narrow=${this.narrow} .large=${true}>
                        <span slot="heading">
                          ${localize('panels.actions.cards.new_notification.fields.media_player_entity.heading', this.hass.language)}
                        </span>
                        <span slot="description">
                          ${localize('panels.actions.cards.new_notification.fields.media_player_entity.description', this.hass.language)}
                        </span>

                        <effortlesshome-select
                          .items=${computeEntityDisplay(getEntitiesByDomain(this.hass, 'media_player'), this.hass)}
                          label=${localize('panels.actions.cards.new_notification.fields.media_player_entity.heading', this.hass.language)}
                          .value=${((_c = this.config.actions[0].data) === null || _c === void 0 ? void 0 : _c.media_player_entity_id) || ''}
                          @value-changed=${this._setMediaPlayerEntity}
                          .icons=${true}
                          ?invalid=${this.errors.media_player_entity}
                        ></effortlesshome-select>
                      </settings-row>
                    `
                : ''}

                <settings-row .narrow=${this.narrow} .large=${true} last>
                  <span slot="heading">
                    ${localize('panels.actions.cards.new_notification.fields.message.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.actions.cards.new_notification.fields.message.description', this.hass.language)}
                  </span>

                  <ha-textarea
                    id="message"
                    label="${localize('panels.actions.cards.new_notification.fields.message.heading', this.hass.language)}"
                    placeholder=${this._messagePlaceholder()}
                    .value=${((_d = this.config.actions[0].data) === null || _d === void 0 ? void 0 : _d.message) || ''}
                    @input=${(ev) => this._setMessage(ev.target.value)}
                    ?invalid=${this.errors.message}
                  ></ha-textarea>

                  ${this.config.triggers[0].event
                ? html `
                        <div style="margin-top: 10px">
                          <span style="padding-right: 10px">
                            ${localize('panels.actions.cards.new_notification.fields.message.insert_wildcard', this.hass.language)}:
                          </span>
                          <effortlesshome-chip-set
                            .items=${getWildcardOptions(this.config.triggers[0].event, this.effortlesshomeConfig)}
                            @value-changed=${(ev) => this._insertWildCard(ev.detail)}
                          ></effortlesshome-chip-set>
                        </div>
                      `
                : ''}
                </settings-row>

                ${this._getOpenSensorsFormat() !== null
                ? html `
                      <settings-row .narrow=${this.narrow} .large=${true}>
                        <span slot="heading">
                          ${localize('panels.actions.cards.new_notification.fields.open_sensors_format.heading', this.hass.language)}
                        </span>

                        <span slot="description">
                          ${localize('panels.actions.cards.new_notification.fields.open_sensors_format.description', this.hass.language)}
                        </span>

                        <effortlesshome-select
                          .items=${getOpenSensorsWildCardOptions(this.hass)}
                          .value=${this._getOpenSensorsFormat(true)}
                          @value-changed=${this._setOpenSensorsFormat}
                        ></effortlesshome-select>
                      </settings-row>
                    `
                : ''}
                ${this._getArmModeFormat() !== null &&
                (getArmModeWildCardOptions(this.hass).length > 1 ||
                    (getArmModeWildCardOptions(this.hass).length == 1 &&
                        getArmModeWildCardOptions(this.hass)[0].value != this._getArmModeFormat()))
                ? html `
                      <settings-row .narrow=${this.narrow} .large=${true}>
                        <span slot="heading">
                          ${localize('panels.actions.cards.new_notification.fields.arm_mode_format.heading', this.hass.language)}
                        </span>

                        <span slot="description">
                          ${localize('panels.actions.cards.new_notification.fields.arm_mode_format.description', this.hass.language)}
                        </span>

                        <effortlesshome-select
                          .items=${getArmModeWildCardOptions(this.hass)}
                          .value=${this._getArmModeFormat(true)}
                          @value-changed=${this._setArmModeFormat}
                        ></effortlesshome-select>
                      </settings-row>
                    `
                : ''}
              `
            : html `
                <h2>${localize('components.editor.edit_in_yaml', this.hass.language)}</h2>

                <ha-yaml-editor
                  .defaultValue=${this.config.actions[0] || ''}
                  @value-changed=${this._setYaml}
                ></ha-yaml-editor>

                ${this.errors.service || this.errors.title || this.errors.message || this.errors.entity || this.errors.media_player_entity
                ? html `
                      <span class="error-message">
                        ${this.hass.localize('ui.errors.config.key_missing', 'key', Object.entries(this.errors).find(([k, v]) => v && ['service', 'title', 'message', 'entity', 'media_player_entity'].includes(k))[0])}
                      </span>
                    `
                : ''}
              `}
        </div>

        <div class="toggle-button">
          <mwc-button @click=${this._toggleYamlMode}>
            <ha-icon icon="hass:shuffle-variant"></ha-icon>
            ${this.viewMode == ViewMode.Yaml
            ? localize('components.editor.ui_mode', this.hass.language)
            : localize('components.editor.yaml_mode', this.hass.language)}
          </mwc-button>
        </div>

        <div class="card-actions">
          <mwc-button trailingIcon ?disabled=${!this._validAction()} @click=${this._testClick}>
            ${localize('panels.actions.cards.new_notification.actions.test', this.hass.language)}
            <ha-icon icon="hass:arrow-right"></ha-icon>
          </mwc-button>
        </div>
      </ha-card>

      <div class="section-header">${localize('panels.actions.cards.new_notification.options', this.hass.language)}</div>
      <ha-card>
        <div class="card-content">
          <settings-row .narrow=${this.narrow} .large=${true} first>
            <span slot="heading">
              ${localize('panels.actions.cards.new_notification.fields.name.heading', this.hass.language)}
            </span>
            <span slot="description">
              ${localize('panels.actions.cards.new_notification.fields.name.description', this.hass.language)}
            </span>

            <ha-textfield
              label="${localize('panels.actions.cards.new_notification.fields.name.heading', this.hass.language)}"
              .placeholder=${this._namePlaceholder()}
              .value=${this.config.name || ''}
              @input=${this._setName}
              ?invalid=${this.errors.name}
            ></ha-textfield>
          </settings-row>

          ${((_e = this.item) === null || _e === void 0 ? void 0 : _e.automation_id)
            ? html `
                <settings-row .narrow=${this.narrow}>
                  <span slot="heading">
                    ${localize('panels.actions.cards.new_notification.fields.delete.heading', this.hass.language)}
                  </span>
                  <span slot="description">
                    ${localize('panels.actions.cards.new_notification.fields.delete.description', this.hass.language)}
                  </span>
                  <div>
                    <mwc-button class="warning" outlined @click=${this._deleteClick}>
                      <ha-icon icon="hass:trash-can-outline"></ha-icon>
                      ${this.hass.localize('ui.common.delete')}
                    </mwc-button>
                  </div>
                </settings-row>
              `
            : ''}
        </div>
      </ha-card>

      <div class="actions">
        <mwc-button raised @click=${this._saveClick} style="width: 100%" class="save-button">
          <ha-icon icon="hass:content-save-outline"></ha-icon>
          ${this.hass.localize('ui.common.save')}
        </mwc-button>
      </div>
    `;
    }
    _setEvent(ev) {
        ev.stopPropagation();
        const value = ev.detail.value;
        let triggerConfig = this.config.triggers;
        Object.assign(triggerConfig, { [0]: Object.assign(Object.assign({}, triggerConfig[0]), { event: value }) });
        this.config = Object.assign(Object.assign({}, this.config), { triggers: triggerConfig });
        if (Object.keys(this.errors).includes('event'))
            this._validateConfig();
    }
    _setArea(ev) {
        var _a;
        ev.stopPropagation();
        const value = ev.detail.value;
        let triggerConfig = this.config.triggers;
        Object.assign(triggerConfig, { [0]: Object.assign(Object.assign({}, triggerConfig[0]), { area: value }) });
        const armModes = getArmModeOptions(value, this.areas);
        if ((_a = triggerConfig[0].modes) === null || _a === void 0 ? void 0 : _a.length)
            this._setModes(new CustomEvent('value-changed', {
                detail: { value: triggerConfig[0].modes.filter(e => armModes.includes(e)) },
            }));
        this.config = Object.assign(Object.assign({}, this.config), { triggers: triggerConfig });
        if (Object.keys(this.errors).includes('area'))
            this._validateConfig();
    }
    _setModes(ev) {
        ev.stopPropagation();
        const value = ev.detail.value;
        let triggerConfig = this.config.triggers;
        Object.assign(triggerConfig, { [0]: Object.assign(Object.assign({}, triggerConfig[0]), { modes: value }) });
        this.config = Object.assign(Object.assign({}, this.config), { triggers: triggerConfig });
        if (Object.keys(this.errors).includes('modes'))
            this._validateConfig();
    }
    _setService(ev) {
        ev.stopPropagation();
        const value = String(ev.detail.value);
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, { [0]: Object.assign(Object.assign(Object.assign({}, actionConfig[0]), { service: value }), omit(actionConfig[0], 'service')) });
        if ((actionConfig[0].data || {}).entity_id && computeDomain(value) == 'notify')
            Object.assign(actionConfig, {
                [0]: Object.assign(Object.assign({}, actionConfig[0]), { data: omit(actionConfig[0].data || {}, 'entity_id') }),
            });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
        if (Object.keys(this.errors).includes('service'))
            this._validateConfig();
    }
    _setTitle(ev) {
        ev.stopPropagation();
        const value = ev.target.value;
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { title: value }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
        if (Object.keys(this.errors).includes('title'))
            this._validateConfig();
    }
    _setEntity(ev) {
        ev.stopPropagation();
        const value = ev.target.value;
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { entity_id: value }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
        if (Object.keys(this.errors).includes('entity'))
            this._validateConfig();
    }
    _setMediaPlayerEntity(ev) {
        ev.stopPropagation();
        const value = ev.target.value;
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { media_player_entity_id: value }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
        if (Object.keys(this.errors).includes('media_player_entity'))
            this._validateConfig();
    }
    _setMessage(value) {
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { message: value }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
        if (Object.keys(this.errors).includes('message'))
            this._validateConfig();
    }
    _setName(ev) {
        ev.stopPropagation();
        const value = ev.target.value;
        this.config = Object.assign(Object.assign({}, this.config), { name: value });
    }
    _setYaml(ev) {
        const value = ev.detail.value;
        let output = {};
        if (isString(value === null || value === void 0 ? void 0 : value.service))
            output = Object.assign(Object.assign({}, output), { service: String(value.service) });
        if (isObject(value === null || value === void 0 ? void 0 : value.data))
            output = Object.assign(Object.assign({}, output), { data: value.data });
        if (Object.keys(output).length)
            this.config = Object.assign(Object.assign({}, this.config), { actions: Object.assign(this.config.actions, { [0]: Object.assign(Object.assign({}, this.config.actions[0]), output) }) });
        if (Object.keys(this.errors).some(e => ['service', 'message', 'title'].includes(e)))
            this._validateConfig();
    }
    _validateConfig() {
        var _a;
        this.errors = {};
        const data = this._parseAutomation();
        const triggerConfig = data.triggers[0];
        if (!triggerConfig.event || !Object.values(EAlarmEvent).includes(triggerConfig.event))
            this.errors = Object.assign(Object.assign({}, this.errors), { event: true });
        if (!isDefined(triggerConfig.area) || !getAreaOptions(this.areas, this.effortlesshomeConfig).includes(triggerConfig.area))
            this.errors = Object.assign(Object.assign({}, this.errors), { area: true });
        if (!(triggerConfig.modes || []).every(e => getArmModeOptions(triggerConfig.area, this.areas).includes(e)))
            this.errors = Object.assign(Object.assign({}, this.errors), { modes: true });
        const actionConfig = data.actions[0];
        if (!actionConfig.service ||
            (!getNotifyServices(this.hass).includes(actionConfig.service) && computeDomain(actionConfig.service) != 'script'))
            this.errors = Object.assign(Object.assign({}, this.errors), { service: true });
        else if (actionConfig.service &&
            computeDomain(actionConfig.service) == 'tts' &&
            (!Object.keys(actionConfig.data || {}).includes('entity_id') ||
                !getEntitiesByDomain(this.hass, 'media_player', 'tts').includes(actionConfig.data.entity_id)))
            this.errors = Object.assign(Object.assign({}, this.errors), { entity: true });
        if (actionConfig.service && actionConfig.service == 'tts.speak') {
            if (!this.errors.entity && !getEntitiesByDomain(this.hass, 'tts').includes(actionConfig.data.entity_id))
                this.errors = Object.assign(Object.assign({}, this.errors), { entity: true });
            if (!Object.keys(actionConfig.data || {}).includes('media_player_entity_id') || !getEntitiesByDomain(this.hass, 'media_player').includes(actionConfig.data.media_player_entity_id))
                this.errors = Object.assign(Object.assign({}, this.errors), { media_player_entity: true });
        }
        if (!isValidString((_a = actionConfig.data) === null || _a === void 0 ? void 0 : _a.message))
            this.errors = Object.assign(Object.assign({}, this.errors), { message: true });
        // title is optional
        // if (!isValidString(actionConfig.data?.title))
        //   this.errors = { ...this.errors, title: true };
        if (!isValidString(data.name))
            this.errors = Object.assign(Object.assign({}, this.errors), { name: true });
        return !Object.values(this.errors).length;
    }
    _validAction() {
        var _a;
        const data = this._parseAutomation();
        const actionConfig = data.actions[0];
        return (actionConfig.service &&
            (computeDomain(actionConfig.service) == 'script' ||
                getNotifyServices(this.hass).includes(actionConfig.service)) &&
            isValidString((_a = actionConfig.data) === null || _a === void 0 ? void 0 : _a.message));
    }
    _insertWildCard(value) {
        var _a;
        const field = this.shadowRoot.querySelector('#message');
        if (field)
            field.focus();
        let message = ((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.message) || '';
        message =
            field && field.selectionStart !== null && field.selectionEnd !== null
                ? message.substring(0, field.selectionStart) + value + message.substring(field.selectionEnd, message.length)
                : message + value;
        this._setMessage(message);
    }
    _toggleYamlMode() {
        this.viewMode = this.viewMode == ViewMode.UI ? ViewMode.Yaml : ViewMode.UI;
        if (this.viewMode == ViewMode.Yaml) {
            let actionConfig = Object.assign({}, this.config.actions[0]);
            let serviceData = typeof actionConfig.data == 'object' && isDefined(actionConfig.data) ? actionConfig.data : {};
            actionConfig = Object.assign(Object.assign({}, actionConfig), { service: actionConfig.service || '' });
            if (!serviceData.message)
                serviceData = Object.assign(Object.assign({}, serviceData), { message: '' });
            if (getNotifyServices(this.hass).includes(actionConfig.service)) {
                if (computeDomain(actionConfig.service) == 'notify' && !serviceData.title)
                    serviceData = Object.assign(Object.assign({}, serviceData), { title: '' });
                if (computeDomain(actionConfig.service) == 'tts' && !serviceData.entity_id)
                    serviceData = Object.assign(Object.assign({}, serviceData), { entity_id: '' });
            }
            actionConfig = Object.assign(Object.assign({}, actionConfig), { data: serviceData });
            this.config = Object.assign(Object.assign({}, this.config), { actions: Object.assign(this.config.actions, {
                    [0]: actionConfig,
                }) });
        }
    }
    _namePlaceholder() {
        const event = this.config.triggers[0].event;
        const domain = this.config.actions[0].service ? computeDomain(this.config.actions[0].service) : null;
        if (!event)
            return '';
        if (domain == 'notify') {
            const target = computeServiceDisplay(this.hass, this.config.actions[0].service);
            if (!target.length)
                return '';
            return localize(`panels.actions.cards.new_notification.fields.name.placeholders.${event}`, this.hass.language, '{target}', target[0].name);
        }
        else if (domain == 'tts') {
            const entity = typeof this.config.actions[0].data == 'object' && isDefined(this.config.actions[0].data)
                ? this.config.actions[0].data.entity_id
                : null;
            if (!entity || !this.hass.states[entity])
                return '';
            const target = computeName(this.hass.states[entity]);
            return localize(`panels.actions.cards.new_notification.fields.name.placeholders.${event}`, this.hass.language, '{target}', target);
        }
        return '';
    }
    _messagePlaceholder() {
        const event = this.config.triggers[0].event;
        if (!event)
            return '';
        else
            return localize(`panels.actions.cards.new_notification.fields.message.placeholders.${event}`, this.hass.language);
    }
    _parseAutomation() {
        var _a;
        let data = Object.assign({}, this.config);
        let action = data.actions[0];
        //fill in message placeholder
        if (!isValidString((_a = action.data) === null || _a === void 0 ? void 0 : _a.message) && this.viewMode == ViewMode.UI && this._messagePlaceholder()) {
            action = Object.assign(Object.assign({}, action), { data: Object.assign(Object.assign({}, action.data), { message: this._messagePlaceholder() }) });
            Object.assign(data, { actions: Object.assign(data.actions, { [0]: action }) });
        }
        //fill in name placeholder
        if (!isValidString(data.name) && this._namePlaceholder())
            data = Object.assign(Object.assign({}, data), { name: this._namePlaceholder() });
        return data;
    }
    _getOpenSensorsFormat(forceResult = false) {
        var _a;
        const message = ((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.message) || '';
        const res = message.match(/{{open_sensors(\|[^}]+)?}}/);
        if (res !== null)
            return res[0];
        else
            return forceResult ? '{{open_sensors}}' : null;
    }
    _setOpenSensorsFormat(ev) {
        var _a;
        ev.stopPropagation();
        const value = String(ev.detail.value);
        let message = ((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.message) || '';
        message = message.replace(/{{open_sensors(\|[^}]+)?}}/, value);
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { message: message }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
    }
    _getArmModeFormat(forceResult = false) {
        var _a;
        const message = ((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.message) || '';
        const res = message.match(/{{arm_mode(\|[^}]+)?}}/);
        if (res !== null)
            return res[0];
        else
            return forceResult ? '{{arm_mode}}' : null;
    }
    _setArmModeFormat(ev) {
        var _a;
        ev.stopPropagation();
        const value = String(ev.detail.value);
        let message = ((_a = this.config.actions[0].data) === null || _a === void 0 ? void 0 : _a.message) || '';
        message = message.replace(/{{arm_mode(\|[^}]+)?}}/, value);
        let actionConfig = this.config.actions;
        Object.assign(actionConfig, {
            [0]: Object.assign(Object.assign({}, actionConfig[0]), { service: actionConfig[0].service || '', data: Object.assign(Object.assign({}, (actionConfig[0].data || {})), { message: message }) }),
        });
        this.config = Object.assign(Object.assign({}, this.config), { actions: actionConfig });
    }
    _saveClick(ev) {
        if (!this._validateConfig())
            return;
        let data = this._parseAutomation();
        //keep modes array empty if all modes are selected
        if (getArmModeOptions(data.triggers[0].area, this.areas).every(e => { var _a; return (_a = data.triggers[0].modes) === null || _a === void 0 ? void 0 : _a.includes(e); })) {
            data = Object.assign(Object.assign({}, data), { triggers: Object.assign(data.triggers, { [0]: Object.assign(Object.assign({}, data.triggers[0]), { modes: [] }) }) });
        }
        if (this.item)
            data = Object.assign(Object.assign({}, data), { automation_id: this.item.automation_id });
        saveAutomation(this.hass, data)
            .catch(e => handleError(e, ev))
            .then(() => this._cancelClick());
    }
    _deleteClick(ev) {
        var _a;
        if (!((_a = this.item) === null || _a === void 0 ? void 0 : _a.automation_id))
            return;
        deleteAutomation(this.hass, this.item.automation_id)
            .catch(e => handleError(e, ev))
            .then(() => this._cancelClick());
    }
    _testClick(ev) {
        const data = this._parseAutomation();
        const action = data.actions[0];
        const [domain, service] = action.service.split('.');
        let message = action.data.message;
        message = message.replace('{{open_sensors|format=short}}', 'Some Example Sensor');
        message = message.replace(/{{open_sensors(\|[^}]+)?}}/, 'Some Example Sensor is open');
        message = message.replace('{{bypassed_sensors}}', 'Some Bypassed Sensor');
        message = message.replace(/{{arm_mode(\|[^}]+)?}}/, 'Armed away');
        message = message.replace('{{changed_by}}', 'Some Example User');
        message = message.replace('{{delay}}', '30');
        this.hass
            .callService(domain, service, Object.assign(Object.assign({}, action.data), { message: message }))
            .then()
            .catch(e => {
            showErrorDialog(ev, e.message);
            return;
        });
    }
    _cancelClick() {
        navigate(this, exportPath('actions'), true);
    }
    static get styles() {
        return css `
      div.content {
        padding: 28px 20px 0;
        max-width: 1040px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
      }
      div.header {
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.012em;
        line-height: 32px;
        opacity: var(--dark-primary-opacity);
      }
      div.section-header {
        font-size: 18px;
        font-weight: 400;
        letter-spacing: -0.012em;
        line-height: 32px;
        opacity: var(--dark-primary-opacity);
        margin: 20px 0px 5px 10px;
      }
      div.actions {
        padding: 20px 0px 30px 0px;
      }
      mwc-button ha-icon {
        margin-right: 6px;
        --mdc-icon-size: 20px;
      }
      .toggle-button {
        position: absolute;
        right: 20px;
        top: 20px;
      }
      h2 {
        margin-top: 10px;
        font-size: 24px;
        font-weight: 400;
        letter-spacing: -0.012em;
      }
      span.error-message {
        color: var(--error-color);
      }
      mwc-button.warning {
        --mdc-theme-primary: var(--error-color);
      }
      mwc-button.save-button {
        --mdc-theme-primary: rgba(var(--rgb-primary-color), 0.8);
      }
      div.heading {
        display: grid;
        grid-template-areas:
          'header icon'
          'description icon';
        grid-template-rows: 1fr 1fr;
        grid-template-columns: 1fr 48px;
        margin: 20px 0px 10px 10px;
      }
      div.heading .icon {
        grid-area: icon;
      }
      div.heading .header {
        grid-area: header;
      }
      div.heading .description {
        grid-area: description;
      }
      ha-textarea[invalid] {
        --mdc-text-field-idle-line-color: var(--mdc-theme-error);
        --mdc-text-field-label-ink-color: var(--mdc-theme-error);
      }
    `;
    }
};
__decorate([
    property({ attribute: false })
], NotificationEditorCard.prototype, "hass", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "narrow", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "config", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "item", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "areas", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "effortlesshomeConfig", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "viewMode", void 0);
__decorate([
    property()
], NotificationEditorCard.prototype, "errors", void 0);
NotificationEditorCard = __decorate([
    customElement('notification-editor-card')
], NotificationEditorCard);
export { NotificationEditorCard };
