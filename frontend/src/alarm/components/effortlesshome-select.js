var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing, render, } from 'lit';
import { property, customElement, state, query } from 'lit/decorators.js';
import { mdiClose, mdiMenuUp, mdiMenuDown } from '@mdi/js';
import { IsEqual, isDefined } from '../helpers';
import { directive, Directive, PartType } from 'lit/directive.js';
import { fireEvent } from '../fire_event';
let effortlesshomeSelect = class effortlesshomeSelect extends LitElement {
    constructor() {
        super(...arguments);
        this.label = '';
        this.items = [];
        this.clearable = false;
        this.icons = false;
        this.disabled = false;
        this.invalid = false;
        this.rowRenderer = item => {
            const hasDescription = isDefined(item.description);
            if (this.icons) {
                return html `
        <style>
          mwc-list-item {
            font-size: 15px;
            --mdc-typography-body2-font-size: 14px;
            --mdc-list-item-meta-size: 8px;
            --mdc-list-item-graphic-margin: 8px;
          }
        </style>
        <mwc-list-item graphic="avatar" .twoline=${hasDescription}>
          <ha-icon icon="${item.icon}" slot="graphic"></ha-icon>
          <span>${item.name}</span>
          ${hasDescription
                    ? html `
                <span slot="secondary">${item.description}</span>
              `
                    : ''}
        </mwc-list-item>
      `;
            }
            else {
                return html `
        <style>
          mwc-list-item {
            font-size: 15px;
            --mdc-typography-body2-font-size: 14px;
          }
        </style>
        <mwc-list-item .twoline=${hasDescription}>
          <span>${item.name}</span>
          ${hasDescription
                    ? html `
                <span slot="secondary">${item.description}</span>
              `
                    : ''}
        </mwc-list-item>
      `;
            }
        };
    }
    open() {
        this.updateComplete.then(() => {
            var _a, _b;
            (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('vaadin-combo-box-light')) === null || _b === void 0 ? void 0 : _b.open();
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._overlayMutationObserver) {
            this._overlayMutationObserver.disconnect();
            this._overlayMutationObserver = undefined;
        }
    }
    focus() {
        this.updateComplete.then(() => {
            var _a;
            ((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('ha-textfield')).focus();
        });
    }
    shouldUpdate(changedProps) {
        if (changedProps.get('items')) {
            if (!IsEqual(this.items, changedProps.get('items')))
                this.firstUpdated();
            else if (changedProps.size == 1)
                return false;
        }
        return true;
    }
    firstUpdated() {
        this._comboBox.items = this.items;
    }
    render() {
        const hasValue = isDefined(this._value) && this.items.find(e => e.value == this._value);
        return html `
      <vaadin-combo-box-light
        item-value-path="value"
        item-id-path="value"
        item-label-path="name"
        .value=${this._value}
        ${comboBoxRenderer(this.rowRenderer)}
        .allowCustomValue=${this.allowCustomValue}
        ?disabled=${this.disabled}
        @opened-changed=${this._openedChanged}
        @value-changed=${this._valueChanged}
      >
        <ha-textfield
          .label=${this.label}
          class="input"
          autocapitalize="none"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          ?disabled=${this.disabled}
          ?invalid=${this.invalid}
          .icon=${this.icons && hasValue}
        >
          <ha-icon
            name="icon"
            slot="leadingIcon"
            icon="${this.icons && hasValue ? this.items.find(e => e.value == this._value).icon : undefined}"
          ></ha-icon>
        </ha-textfield>
        <ha-svg-icon
          class="toggle-button ${this.items.length ? '' : 'disabled'}"
          .path=${this._opened && this.items.length ? mdiMenuUp : mdiMenuDown}
          @click=${this._toggleOpen}
        ></ha-svg-icon>
        ${this.clearable && hasValue
            ? html `
              <ha-svg-icon class="clear-button" @click=${this._clearValue} .path=${mdiClose}></ha-svg-icon>
            `
            : ''}
      </vaadin-combo-box-light>
    `;
    }
    _clearValue(ev) {
        ev.stopPropagation();
        this._setValue('');
    }
    get _value() {
        return isDefined(this.value) ? this.value : '';
    }
    _toggleOpen(ev) {
        var _a, _b, _c, _d, _e, _f;
        if (!this.items.length) {
            ev.stopPropagation();
            return;
        }
        if (this._opened) {
            (_c = (_b = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('vaadin-combo-box-light')) === null || _b === void 0 ? void 0 : _b.inputElement) === null || _c === void 0 ? void 0 : _c.blur();
            ev.stopPropagation();
        }
        else {
            (_f = (_e = (_d = this.shadowRoot) === null || _d === void 0 ? void 0 : _d.querySelector('vaadin-combo-box-light')) === null || _e === void 0 ? void 0 : _e.inputElement) === null || _f === void 0 ? void 0 : _f.focus();
        }
    }
    _openedChanged(ev) {
        this._opened = ev.detail.value;
        if (this._opened && 'MutationObserver' in window && !this._overlayMutationObserver) {
            const overlay = document.querySelector('vaadin-combo-box-overlay');
            if (!overlay)
                return;
            this._overlayMutationObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    var _a;
                    if (mutation.type === 'attributes' &&
                        mutation.attributeName === 'inert') {
                        //overlay.inert = false;
                        (_a = this._overlayMutationObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
                        this._overlayMutationObserver = undefined;
                    }
                    else if (mutation.type === 'childList') {
                        mutation.removedNodes.forEach(node => {
                            var _a;
                            if (node.nodeName === 'VAADIN-COMBO-BOX-OVERLAY') {
                                (_a = this._overlayMutationObserver) === null || _a === void 0 ? void 0 : _a.disconnect();
                                this._overlayMutationObserver = undefined;
                            }
                        });
                    }
                });
            });
            this._overlayMutationObserver.observe(overlay, {
                attributes: true,
            });
            this._overlayMutationObserver.observe(document.body, {
                childList: true,
            });
        }
    }
    _valueChanged(ev) {
        const newValue = ev.detail.value;
        if (newValue !== this._value) {
            this._setValue(newValue);
        }
    }
    _setValue(value) {
        this.value = value;
        setTimeout(() => {
            fireEvent(this, 'value-changed', { value });
        }, 0);
    }
    static get styles() {
        return css `
      :host {
        display: block;
      }
      vaadin-combo-box-light {
        position: relative;
      }
      ha-textfield {
        width: 100%;
      }
      ha-textfield > ha-icon-button {
        --mdc-icon-button-size: 24px;
        padding: 2px;
        color: var(--secondary-text-color);
      }
      ha-svg-icon {
        color: var(--input-dropdown-icon-color);
        position: absolute;
        cursor: pointer;
      }
      ha-svg-icon.disabled {
        cursor: default;
        color: var(--disabled-text-color);
      }
      .toggle-button {
        right: 12px;
        bottom: 5px;
      }
      :host([opened]) .toggle-button {
        color: var(--primary-color);
      }
      .clear-button {
        --mdc-icon-size: 20px;
        bottom: 5px;
        right: 36px;
      }
    `;
    }
};
__decorate([
    property()
], effortlesshomeSelect.prototype, "label", void 0);
__decorate([
    property()
], effortlesshomeSelect.prototype, "value", void 0);
__decorate([
    property()
], effortlesshomeSelect.prototype, "items", void 0);
__decorate([
    property()
], effortlesshomeSelect.prototype, "clearable", void 0);
__decorate([
    property()
], effortlesshomeSelect.prototype, "icons", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeSelect.prototype, "disabled", void 0);
__decorate([
    state()
], effortlesshomeSelect.prototype, "_opened", void 0);
__decorate([
    property({ attribute: 'allow-custom-value', type: Boolean })
], effortlesshomeSelect.prototype, "allowCustomValue", void 0);
__decorate([
    property({ type: Boolean })
], effortlesshomeSelect.prototype, "invalid", void 0);
__decorate([
    query('vaadin-combo-box-light', true)
], effortlesshomeSelect.prototype, "_comboBox", void 0);
effortlesshomeSelect = __decorate([
    customElement('effortlesshome-select')
], effortlesshomeSelect);
export { effortlesshomeSelect };
// A sentinel that indicates renderer hasn't been initialized
const initialValue = {};
export class AbstractRendererDirective extends Directive {
    constructor(part) {
        super(part);
        this.previousValue = initialValue;
        if (part.type !== PartType.ELEMENT) {
            throw new Error('renderer only supports binding to element');
        }
    }
    render(_renderer, _value) {
        return nothing;
    }
    update(part, [renderer, value]) {
        var _a;
        const firstRender = this.previousValue === initialValue;
        if (!this.hasChanged(value)) {
            return nothing;
        }
        // Copy the value if it's an array so that if it's mutated we don't forget
        // what the previous values were.
        this.previousValue = Array.isArray(value) ? Array.from(value) : value;
        const element = part.element;
        // TODO: support re-assigning renderer function.
        if (firstRender) {
            const host = (_a = part.options) === null || _a === void 0 ? void 0 : _a.host;
            this.addRenderer(element, renderer, { host });
        }
        else {
            this.runRenderer(element);
        }
        return nothing;
    }
    hasChanged(value) {
        let result = true;
        if (Array.isArray(value)) {
            // Dirty-check arrays by item
            if (Array.isArray(this.previousValue) &&
                this.previousValue.length === value.length &&
                value.every((v, i) => v === this.previousValue[i])) {
                result = false;
            }
        }
        else if (this.previousValue === value) {
            // Dirty-check non-arrays by identity
            result = false;
        }
        return result;
    }
}
class ComboBoxRendererDirective extends AbstractRendererDirective {
    /**
     * Set renderer callback to the element.
     */
    addRenderer(element, renderer, options) {
        element.renderer = (root, comboBox, model) => {
            render(renderer.call(options.host, model.item, model, comboBox), root, options);
        };
    }
    /**
     * Run renderer callback on the element.
     */
    runRenderer(element) {
        element.requestContentUpdate();
    }
}
const rendererDirective = directive(ComboBoxRendererDirective);
export const comboBoxRenderer = (renderer, value) => rendererDirective(renderer, value);
