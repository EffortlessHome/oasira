export const loadHaForm = async () => {
    if (customElements.get('ha-checkbox') && customElements.get('ha-slider') && !customElements.get('ha-panel-config'))
        return;
    await customElements.whenDefined('partial-panel-resolver');
    const ppr = document.createElement('partial-panel-resolver');
    ppr.hass = {
        panels: [
            {
                url_path: 'tmp',
                component_name: 'config',
            },
        ],
    };
    ppr._updateRoutes();
    await ppr.routerOptions.routes.tmp.load();
    await customElements.whenDefined('ha-panel-config');
    const cpr = document.createElement('ha-panel-config');
    await cpr.routerOptions.routes.automation.load();
};
export const loadHaYamlEditor = async () => {
    var _a, _b, _c, _d, _e, _f, _g;
    if (customElements.get('ha-yaml-editor'))
        return;
    // Load in ha-yaml-editor from developer-tools-service
    const ppResolver = document.createElement('partial-panel-resolver');
    const routes = ppResolver.getRoutes([
        {
            component_name: 'developer-tools',
            url_path: 'a',
        },
    ]);
    await ((_c = (_b = (_a = routes === null || routes === void 0 ? void 0 : routes.routes) === null || _a === void 0 ? void 0 : _a.a) === null || _b === void 0 ? void 0 : _b.load) === null || _c === void 0 ? void 0 : _c.call(_b));
    const devToolsRouter = document.createElement('developer-tools-router');
    await ((_g = (_f = (_e = (_d = devToolsRouter === null || devToolsRouter === void 0 ? void 0 : devToolsRouter.routerOptions) === null || _d === void 0 ? void 0 : _d.routes) === null || _e === void 0 ? void 0 : _e.service) === null || _f === void 0 ? void 0 : _f.load) === null || _g === void 0 ? void 0 : _g.call(_f));
};
