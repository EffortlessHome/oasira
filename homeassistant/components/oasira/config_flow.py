import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback

from .const import DOMAIN

# Example constants for configuration
CONF_HOST = "host"
CONF_API_KEY = "api_key"


class OasiraConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the Oasira integration."""

    VERSION = 1
    CONNECTION_CLASS = "local_polling"

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        errors = {}

        if user_input is not None:
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
