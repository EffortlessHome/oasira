class EntityLabelCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    set hass(hass) {
      if (!this.content) {
        const card = document.createElement('ha-card');
        card.header = 'Set Labels for Entities';
        this.content = document.createElement('div');
        this.content.style.padding = '16px';

        const entities = Object.keys(hass.states).map((entityId) => ({
          id: entityId,
          name: hass.states[entityId].attributes.friendly_name || entityId,
          label: hass.states[entityId].attributes.label || '',
        }));

        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        // Table Header
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
          <th style="text-align: left; padding: 8px;">Entity</th>
          <th style="text-align: left; padding: 8px;">Current Label</th>
          <th style="text-align: left; padding: 8px;">Set Label</th>
        `;
        table.appendChild(headerRow);

        entities.forEach((entity) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${entity.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${entity.label}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
              <input type="text" id="${entity.id}" value="${entity.label}" style="width: 100%; padding: 4px;">
            </td>
          `;
          table.appendChild(row);
        });

        // Save Button
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Save Changes';
        saveButton.style.marginTop = '16px';
        saveButton.style.padding = '8px 16px';
        saveButton.style.cursor = 'pointer';

        saveButton.addEventListener('click', async () => {
          const updates = entities.map((entity) => {
            const input = this.shadowRoot.getElementById(entity.id);
            return {
              entity_id: entity.id,
              label: input.value.trim(),
            };
          });

          updates.forEach(async (update) => {
            await hass.callWS({
              type: 'config/entity_registry/update',
              entity_id: update.entity_id,
              options: { label: update.label || null },
            });
          });

          alert('Labels updated successfully!');
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

  customElements.define('entity-label-card', EntityLabelCard);
