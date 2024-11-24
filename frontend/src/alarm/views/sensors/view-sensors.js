var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from 'lit';
import { property, customElement } from 'lit/decorators.js';
import { loadHaForm } from '../../load-ha-elements';
import './sensor-editor-card.ts';
import './sensors-overview-card.ts';
import './add-sensors-card.ts';
let AlarmViewSensors = class AlarmViewSensors extends LitElement {
    firstUpdated() {
        (async () => await loadHaForm())();
        // if (this.path && this.path.length == 3 && this.path[0] == 'filter') {
        //   const filterOption = this.path[1];
        //   const filterValue = this.path[2];
        //   if (filterOption == 'area') this.selectedArea = this.path[2];
        //   else if (filterOption == 'mode') {
        //     const res = Object.keys(EArmModes).find(e => EArmModes[e] == filterValue);
        //     if (res) this.selectedMode = res as EArmModes;
        //   }
        // }
    }
    render() {
        var _a, _b;
        if (!this.hass)
            return html ``;
        if (this.path.params.edit) {
            return html `
        <sensor-editor-card
          .hass=${this.hass}
          .narrow=${this.narrow}
          .item=${this.path.params.edit}
        ></sensor-editor-card>
      `;
        }
        else {
            const selectedArea = (_a = this.path.filter) === null || _a === void 0 ? void 0 : _a.area;
            const selectedMode = (_b = this.path.filter) === null || _b === void 0 ? void 0 : _b.mode;
            return html `
        <sensors-overview-card
          .hass=${this.hass}
          .narrow=${this.narrow}
          .selectedArea=${selectedArea}
          .selectedMode=${selectedMode}
        ></sensors-overview-card>
        <add-sensors-card .hass=${this.hass} .narrow=${this.narrow}></add-sensors-card>
      `;
        }
    }
};
__decorate([
    property()
], AlarmViewSensors.prototype, "hass", void 0);
__decorate([
    property()
], AlarmViewSensors.prototype, "narrow", void 0);
__decorate([
    property()
], AlarmViewSensors.prototype, "path", void 0);
AlarmViewSensors = __decorate([
    customElement('alarm-view-sensors')
], AlarmViewSensors);
export { AlarmViewSensors };
