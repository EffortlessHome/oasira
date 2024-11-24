var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from 'lit/decorators.js';
export const SubscribeMixin = (superClass) => {
    class SubscribeClass extends superClass {
        connectedCallback() {
            super.connectedCallback();
            this.__checkSubscribed();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.__unsubs) {
                while (this.__unsubs.length) {
                    const unsub = this.__unsubs.pop();
                    if (unsub instanceof Promise) {
                        unsub.then(unsubFunc => unsubFunc());
                    }
                    else {
                        unsub();
                    }
                }
                this.__unsubs = undefined;
            }
        }
        updated(changedProps) {
            super.updated(changedProps);
            if (changedProps.has('hass')) {
                this.__checkSubscribed();
            }
        }
        hassSubscribe() {
            return [];
        }
        __checkSubscribed() {
            if (this.__unsubs !== undefined || !this.isConnected || this.hass === undefined) {
                return;
            }
            this.__unsubs = this.hassSubscribe();
        }
    }
    __decorate([
        property({ attribute: false })
    ], SubscribeClass.prototype, "hass", void 0);
    return SubscribeClass;
};
