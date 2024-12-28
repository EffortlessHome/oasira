import voluptuous as vol
from typing import List
from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN

# Example constants for configuration
CONF_HOST = "host"
CONF_API_KEY = "api_key"

FAKE_DEVICE_TYPES = {
    "LED Bulb": (5, 15),
    "Incandescent Bulb": (40, 100),
    "Smart Plug (idle)": (1, 2),
    "Ceiling Fan": (50, 75),
    "Laptop Charger": (30, 60),
    "Desktop Computer": (100, 250),
    "TV (LED/LCD)": (50, 150),
    "Refrigerator": (100, 800),
    "Air Conditioner": (1000, 2500),
    "Heater": (1000, 1500),
    "Router": (5, 15),
}


class OasiraConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the Oasira integration."""

    VERSION = 1
    CONNECTION_CLASS = "local_polling"

    def __init__(self):
        self.selected_devices: List[dict] = []

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
            device_type = user_input["device_type"]
            name = user_input["name"]
            wattage_range = FAKE_DEVICE_TYPES[device_type]
            self.selected_devices.append(
                {
                    "device_type": device_type,
                    "name": name,
                    "wattage_range": wattage_range,
                }
            )

            # if user_input["add_more"]:
            #    return await self.async_step_user()

            # user_input.append({"devices": self.selected_devices})

            return self.async_create_entry(title="Oasira", data=user_input)

        # Define schema for options
        options_schema = vol.Schema(
            {
                vol.Required(
                    "Oasira Email Address",
                    description="Oasira Email Address",
                ): str,
                vol.Required(
                    "Oasira System ID",
                    description="Oasira System ID",
                ): str,
                vol.Required(
                    "Days History To Keep",
                    default=14,
                    description="Number of days of history to retain",
                ): int,
                vol.Required(
                    "Low Temperature",
                    default=55,
                    description="Low temperature for alerts",
                ): int,
                vol.Required(
                    "High Temperature",
                    default=85,
                    description="High temperature for alerts",
                ): int,
                vol.Required(
                    "Low Humidity",
                    default=20,
                    description="Low humidity percentage",
                ): int,
                vol.Required(
                    "High Humidity",
                    default=80,
                    description="High humidity percentage",
                ): int,
                vol.Required("device_type"): vol.In(FAKE_DEVICE_TYPES.keys()),
                vol.Required("name"): str,
                vol.Optional("add_more", default=False): bool,
            }
        )

        return self.async_show_form(step_id="user", data_schema=options_schema)

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Return the options flow handler for this integration."""
        return OasiraOptionsFlowHandler(config_entry)


class OasiraOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options flow for Oasira."""

    def __init__(self, config_entry):
        """Initialize options flow."""
        # self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage options."""
        if user_input is not None:
            # Update configuration options
            return self.async_create_entry(title="", data=user_input)

        # Define schema for options
        options_schema = vol.Schema(
            {
                vol.Required(
                    "Oasira Email Address",
                    default=self.config_entry.options.get("Oasira Email Address", ""),
                    description="Oasira Email Address",
                ): str,
                vol.Required(
                    "Oasira System ID",
                    default=self.config_entry.options.get("Oasira System ID", ""),
                    description="Oasira System ID",
                ): str,
                vol.Required(
                    "Days History To Keep",
                    default=self.config_entry.options.get("Days History To Keep", 14),
                ): int,
                vol.Required(
                    "Low Temperature",
                    default=self.config_entry.options.get("Low Temperature", 55),
                ): int,
                vol.Required(
                    "High Temperature",
                    default=self.config_entry.options.get("High Temperature", 85),
                ): int,
                vol.Required(
                    "Low Humidity",
                    default=self.config_entry.options.get("Low Humidity", 20),
                ): int,
                vol.Required(
                    "High Humidity",
                    default=self.config_entry.options.get("High Humidity", 80),
                ): int,
            }
        )

        return self.async_show_form(step_id="init", data_schema=options_schema)
