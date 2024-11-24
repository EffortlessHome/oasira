var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { mdiClose } from '@mdi/js';
import { commonStyle } from '../../styles';
import { fetchUsers, saveUser, deleteUser, fetchAreas } from '../../data/websockets';
import { localize } from '../../../localize/localize';
import { omit, showErrorDialog, handleError, sortAlphabetically, navigate } from '../../helpers';
import { exportPath } from '../../common/navigation';
let UserEditorCard = class UserEditorCard extends LitElement {
    constructor() {
        super(...arguments);
        this.data = {
            can_arm: true,
            can_disarm: true,
            is_override_code: false,
        };
        this.repeatCode = '';
        this.areas = {};
    }
    async firstUpdated() {
        this.users = await fetchUsers(this.hass);
        this.areas = await fetchAreas(this.hass);
        if (this.item) {
            const user = this.users[this.item];
            this.data = omit(user, 'code', 'code_format', 'code_length');
        }
        this.data = Object.assign(Object.assign({}, this.data), { area_limit: (this.data.area_limit || []).filter(e => Object.keys(this.areas).includes(e)) });
        if (!(this.data.area_limit || []).length)
            this.data = Object.assign(Object.assign({}, this.data), { area_limit: Object.keys(this.areas) });
    }
    render() {
        var _a;
        if (!this.users)
            return html ``;
        return html `
      <ha-card>
        <div class="card-header">
          <div class="name">
            ${this.item
            ? localize('panels.codes.cards.edit_user.title', this.hass.language)
            : localize('panels.codes.cards.new_user.title', this.hass.language)}
          </div>
          <ha-icon-button .path=${mdiClose} @click=${this.cancelClick}></ha-icon-button>
        </div>
        <div class="card-content">
          ${this.item
            ? localize('panels.codes.cards.edit_user.description', this.hass.language, '{name}', this.users[this.item].name)
            : localize('panels.codes.cards.new_user.description', this.hass.language)}
        </div>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">${localize('panels.codes.cards.new_user.fields.name.heading', this.hass.language)}</span>
          <span slot="description">
            ${localize('panels.codes.cards.new_user.fields.name.description', this.hass.language)}
          </span>

          <ha-textfield
            label="${localize('panels.codes.cards.new_user.fields.name.heading', this.hass.language)}"
            placeholder=""
            value=${this.data.name}
            @input=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { name: ev.target.value }))}
          ></ha-textfield>
        </settings-row>

        ${this.item
            ? html `
              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.codes.cards.edit_user.fields.old_code.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.codes.cards.edit_user.fields.old_code.description', this.hass.language)}
                </span>

                <ha-textfield
                  label="${localize('panels.codes.cards.edit_user.fields.old_code.heading', this.hass.language)}"
                  placeholder=""
                  type="password"
                  value=${this.data.old_code || ''}
                  @input=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { old_code: String(ev.target.value).trim() }))}
                ></ha-textfield>
              </settings-row>
            `
            : ''}
        ${this.item && !((_a = this.data.old_code) === null || _a === void 0 ? void 0 : _a.length)
            ? ''
            : html `
              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.codes.cards.new_user.fields.code.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.codes.cards.new_user.fields.code.description', this.hass.language)}
                </span>

                <ha-textfield
                  label="${localize('panels.codes.cards.new_user.fields.code.heading', this.hass.language)}"
                  placeholder=""
                  type="password"
                  value=${this.data.code}
                  @input=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { code: String(ev.target.value).trim() }))}
                ></ha-textfield>
              </settings-row>

              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.codes.cards.new_user.fields.confirm_code.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.codes.cards.new_user.fields.confirm_code.description', this.hass.language)}
                </span>

                <ha-textfield
                  label="${localize('panels.codes.cards.new_user.fields.confirm_code.heading', this.hass.language)}"
                  placeholder=""
                  type="password"
                  value=${this.repeatCode || ''}
                  @input=${(ev) => (this.repeatCode = String(ev.target.value).trim())}
                ></ha-textfield>
              </settings-row>
            `}

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.codes.cards.new_user.fields.can_arm.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.codes.cards.new_user.fields.can_arm.description', this.hass.language)}
          </span>

          <ha-switch
            ?checked=${this.data.can_arm}
            @change=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { can_arm: ev.target.checked }))}
          ></ha-switch>
        </settings-row>

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.codes.cards.new_user.fields.can_disarm.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.codes.cards.new_user.fields.can_disarm.description', this.hass.language)}
          </span>

          <ha-switch
            ?checked=${this.data.can_disarm}
            @change=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { can_disarm: ev.target.checked }))}
          ></ha-switch>
        </settings-row>

        ${this.getAreaOptions().length >= 2
            ? html `
              <settings-row .narrow=${this.narrow}>
                <span slot="heading">
                  ${localize('panels.codes.cards.new_user.fields.area_limit.heading', this.hass.language)}
                </span>
                <span slot="description">
                  ${localize('panels.codes.cards.new_user.fields.area_limit.description', this.hass.language)}
                </span>

                <div class="checkbox-list">
                  ${this.getAreaOptions().map(e => {
                var _a;
                const checked = (this.data.area_limit || []).includes(e.value) || !((_a = this.data.area_limit) === null || _a === void 0 ? void 0 : _a.length);
                return html `
                      <div>
                        <ha-checkbox
                          @change=${(ev) => this.toggleSelectArea(e.value, ev.target.checked)}
                          ?disabled=${checked && (this.data.area_limit || []).length <= 1}
                          ?checked=${checked}
                        ></ha-checkbox>
                        <span @click=${() => this.toggleSelectArea(e.value, !checked)}>
                          ${e.name}
                        </span>
                      </div>
                    `;
            })}
                </div>
              </settings-row>
            `
            : ''}

        <settings-row .narrow=${this.narrow}>
          <span slot="heading">
            ${localize('panels.codes.cards.new_user.fields.is_override_code.heading', this.hass.language)}
          </span>
          <span slot="description">
            ${localize('panels.codes.cards.new_user.fields.is_override_code.description', this.hass.language)}
          </span>

          <ha-switch
            ?checked=${this.data.is_override_code}
            @change=${(ev) => (this.data = Object.assign(Object.assign({}, this.data), { is_override_code: ev.target.checked }))}
          ></ha-switch>
        </settings-row>

        <div class="card-actions">
          <mwc-button @click=${this.saveClick}>
            ${this.hass.localize('ui.common.save')}
          </mwc-button>

          ${this.item
            ? html `
                <mwc-button class="warning" @click=${this.deleteClick}>
                  ${this.hass.localize('ui.common.delete')}
                </mwc-button>
              `
            : ''}
        </div>
      </ha-card>
    `;
    }
    getAreaOptions() {
        let areas = Object.keys(this.areas || {}).map(e => Object({
            value: e,
            name: this.areas[e].name,
        }));
        areas.sort(sortAlphabetically);
        return areas;
    }
    toggleSelectArea(id, checked) {
        if ((this.data.area_limit || []).length <= 1 && !checked)
            return;
        let areaLimit = this.data.area_limit || [];
        areaLimit = checked
            ? areaLimit.includes(id)
                ? areaLimit
                : [...areaLimit, id]
            : areaLimit.includes(id)
                ? areaLimit.filter(e => e != id)
                : areaLimit;
        this.data = Object.assign(Object.assign({}, this.data), { area_limit: areaLimit });
    }
    deleteClick(ev) {
        if (!this.item)
            return;
        deleteUser(this.hass, this.item)
            .catch(e => handleError(e, ev))
            .then(() => {
            this.cancelClick();
        });
    }
    saveClick(ev) {
        var _a, _b, _c;
        let data = Object.assign({}, this.data);
        if (!((_a = data.name) === null || _a === void 0 ? void 0 : _a.length))
            showErrorDialog(ev, localize('panels.codes.cards.new_user.errors.no_name', this.hass.language));
        else if ((!((_b = data.code) === null || _b === void 0 ? void 0 : _b.length) || data.code.length < 4) && (!this.item || ((_c = data.old_code) === null || _c === void 0 ? void 0 : _c.length)))
            showErrorDialog(ev, localize('panels.codes.cards.new_user.errors.no_code', this.hass.language));
        else if ((data.code || '').length && data.code !== this.repeatCode) {
            showErrorDialog(ev, localize('panels.codes.cards.new_user.errors.code_mismatch', this.hass.language));
            this.data = omit(this.data, 'code');
            this.repeatCode = '';
        }
        else {
            if (this.item) {
                if ((data.old_code || '').length < 4)
                    omit(data, 'old_code', 'code');
            }
            if (!this.getAreaOptions().length ||
                this.getAreaOptions().every(e => (this.data.area_limit || []).includes(e.value)))
                data = Object.assign(Object.assign({}, data), { area_limit: [] });
            saveUser(this.hass, data)
                .catch(e => handleError(e, ev))
                .then(() => {
                this.cancelClick();
            });
        }
    }
    cancelClick() {
        navigate(this, exportPath('codes'), true);
    }
    static get styles() {
        return css `
      ${commonStyle}
      div.checkbox-list {
        display: flex;
        flex-direction: row;
      }
      div.checkbox-list div {
        display: flex;
        align-items: center;
      }
      div.checkbox-list div span {
        cursor: pointer;
      }
    `;
    }
};
__decorate([
    property()
], UserEditorCard.prototype, "hass", void 0);
__decorate([
    property()
], UserEditorCard.prototype, "narrow", void 0);
__decorate([
    property()
], UserEditorCard.prototype, "item", void 0);
__decorate([
    property()
], UserEditorCard.prototype, "data", void 0);
__decorate([
    property()
], UserEditorCard.prototype, "repeatCode", void 0);
UserEditorCard = __decorate([
    customElement('user-editor-card')
], UserEditorCard);
export { UserEditorCard };
