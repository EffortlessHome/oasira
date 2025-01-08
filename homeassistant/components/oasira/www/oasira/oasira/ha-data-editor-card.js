class HaDataEditorCard extends HTMLElement {
    set hass(hass) {
        if (!this._initialized) {
            this._initialized = true;

            this.attachShadow({ mode: 'open' });
            this.shadowRoot.innerHTML = `
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.css">
                <style>
                    .card {
                        padding: 16px;
                        font-family: 'Arial', sans-serif;
                    }
                    #handsontableContainer {
                        width: 100%;
                        height: 400px;
                    }
                </style>
                <ha-card class="card">
                    <div id="handsontableContainer"></div>
                </ha-card>
            `;

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/handsontable/dist/handsontable.full.min.js';
            script.onload = () => this.initHandsontable(hass);
            this.shadowRoot.appendChild(script);
        }

        this._hass = hass;

        if (this.hot) {
            this.updateTableData(hass);
        }
    }

    initHandsontable(hass) {
        const container = this.shadowRoot.getElementById('handsontableContainer');

        this.hot = new Handsontable(container, {
            data: [],
            colHeaders: ['Name', 'Area'],
            columns: [
                {
                    data: 'name',
                    readOnly: true,
                },
                {
                    data: 'area',
                    type: 'dropdown',
                    source: [null].concat(Object.values(hass.areas).map(area => area.area_id)),
                },
            ],
            rowHeaders: true,
            multiColumnSorting: true,
            manualColumnResize: true,
            colWidths: [400, 250],
            licenseKey: 'non-commercial-and-evaluation',
            afterChange: (changes, source) => {
                if (source !== 'loadData') {
                    changes.forEach(([row, prop, oldValue, newValue]) => {
                        if (prop === 'area' && oldValue !== newValue) {
                            const physicalRow = this.hot.toPhysicalRow(row);
                            const rowData = this.hot.getDataAtRow(physicalRow);
                            this.updateArea(hass, rowData.id, newValue);
                        }
                    });
                }
            },
        });

        this.updateTableData(hass);
    }

    updateTableData(hass) {
        const entities = Object.values(hass.devices || {});
        const data = entities.map(entity => ({
            id: entity.id,
            name: entity.name_by_user || entity.name,
            area: entity.area_id,
        }));

        this.hot.loadData(data);
    }

    updateArea(hass, deviceId, newAreaId) {
        hass.callService('ha_data_editor', 'update_device', {
            device_id: deviceId,
            area_id: newAreaId,
        });
    }

    setConfig(config) {
        this._config = config;
    }

    getCardSize() {
        return 5;
    }
}

customElements.define('ha-data-editor-card', HaDataEditorCard);
