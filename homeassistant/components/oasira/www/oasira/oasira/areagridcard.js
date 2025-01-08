class AreaGridCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    set hass(hass) {
      if (!this.content) {
        const card = document.createElement('ha-card');
        card.header = 'Set Areas for Entities';
        this.content = document.createElement('div');
        this.content.style.padding = '16px';

        // Fetch areas
        const areas = hass.areas.map((area) => ({
          name: area.name,
          id: area.id,
        }));

        // Fetch entities
        const entities = Object.keys(hass.states).map((entityId) => ({
          id: entityId,
          name: hass.states[entityId].attributes.friendly_name || entityId,
          area_id: hass.states[entityId].area_id || null,
        }));

        // Create grid table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        // Table header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
          <th style="text-align: left; padding: 8px;">Entity</th>
          <th style="text-align: left; padding: 8px;">Current Area</th>
          <th style="text-align: left; padding: 8px;">Set Area</th>
        `;
        table.appendChild(headerRow);

        entities.forEach((entity) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${entity.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${areas.find((area) => area.id === entity.area_id)?.name || 'None'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              <select id="${entity.id}" style="width: 100%;">
                <option value="">None</option>
                ${areas
                  .map(
                    (area) =>
                      `<option value="${area.id}" ${
                        area.id === entity.area_id ? 'selected' : ''
                      }>${area.name}</option>`
                  )
                  .join('')}
              </select>
            </td>
          `;
          table.appendChild(row);
        });

        // Save button
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Save Changes';
        saveButton.style.marginTop = '16px';
        saveButton.style.padding = '8px 16px';
        saveButton.style.cursor = 'pointer';

        saveButton.addEventListener('click', async () => {
          const updates = entities.map((entity) => {
            const select = this.shadowRoot.getElementById(entity.id);
            return {
              entity_id: entity.id,
              area_id: select.value || null,
            };
          });

          updates.forEach(async (update) => {
            await hass.callWS({
              type: 'config/entity_registry/update',
              entity_id: update.entity_id,
              area_id: update.area_id,
            });
          });

          alert('Areas updated successfully!');
        });

        this.content.appendChild(table);
        this.content.appendChild(saveButton);
        card.appendChild(this.content);
        this.shadowRoot.appendChild(card);
      }
    }

    setConfig(config) {
      this.config = config;
    }

    getCardSize() {
      return 3;
    }
  }

  customElements.define('area-grid-card', AreaGridCard);
