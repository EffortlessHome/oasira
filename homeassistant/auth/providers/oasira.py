"""Example auth provider."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import aiohttp
import httpx
import voluptuous as vol

from homeassistant.const import CONF_ID
from homeassistant.exceptions import HomeAssistantError

from ..models import AuthFlowContext, AuthFlowResult, Credentials, UserMeta
from . import AUTH_PROVIDER_SCHEMA, AUTH_PROVIDERS, AuthProvider, LoginFlow

DOMAIN = "oasira_setup"


class InvalidAuthError(HomeAssistantError):
    """Raised when submitting invalid authentication."""


def _disallow_id(conf: dict[str, Any]) -> dict[str, Any]:
    """Disallow ID in config."""
    if CONF_ID in conf:
        raise vol.Invalid("ID is not allowed for the Oasira auth provider.")

    return conf


CONF_ARG_SYSTEMID = "oasira_systemid"
CONF_ARG_DEV_MODE = "oasira_dev_mode"


CONFIG_SCHEMA = AUTH_PROVIDER_SCHEMA.extend(
    {
        vol.Required(CONF_ARG_SYSTEMID, default=None): str,
        vol.Required(CONF_ARG_DEV_MODE, default="off"): str,
    },
    extra=vol.PREVENT_EXTRA,
)

CONFIG_SCHEMA = vol.All(AUTH_PROVIDER_SCHEMA, _disallow_id)


@AUTH_PROVIDERS.register("oasira")
class OasiraAuthProvider(AuthProvider):
    """Example auth provider based on hardcoded usernames and passwords."""

    ALLOWED_META_KEYS = (
        "name",
        "group",
        "local_only",
    )

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Extend parent's __init__.

        Adds self._user_meta dictionary to hold the user-specific
        attributes provided by external programs.
        """
        super().__init__(*args, **kwargs)
        self._user_meta: dict[str, dict[str, Any]] = {}
        self.runtime_data_key = "OasiraLoginData"
        if self.runtime_data_key not in self.hass.data:
            self.hass.data[self.runtime_data_key] = {}

    async def async_login_flow(self, context: AuthFlowContext | None) -> LoginFlow:
        """Return a flow to login."""
        runtime_data = self.hass.data.get(self.runtime_data_key)

        systemid = self.config[CONF_ARG_SYSTEMID]
        runtime_data["systemid"] = systemid

        self.hass.data.setdefault(DOMAIN, {})

        self.hass.data[DOMAIN]["systemid"] = systemid

        devmode = self.config[CONF_ARG_DEV_MODE]
        runtime_data["oasira_dev_mode"] = devmode

        print(devmode)

        self.hass.data[DOMAIN]["devmode"] = devmode

        return OasiraLoginFlow(self)

    async def async_user_meta_for_credentials(
        self, credentials: Credentials
    ) -> UserMeta:
        """Return extra user metadata for credentials.

        Will be used to populate info when creating a new user.
        """

        print("in async user meta")

        return UserMeta(
            name=credentials.data["username"],
            is_active=True,
            group="system-admin",  # or system-users
            local_only=False,
        )

    async def async_validate_login(self, username: str, password: str) -> None:
        """Validate a username and password."""
        print("in async validate login")

    async def async_get_or_create_credentials(
        self, flow_result: Mapping[str, str]
    ) -> Credentials:
        """Get credentials based on the flow result."""
        print("in async get or create credentials")

        username = flow_result["username"]
        for credential in await self.async_credentials():
            if credential.data["username"] == username:
                return credential

        # Create new credentials.
        return self.async_create_credentials({"username": username})


class OasiraLoginFlow(LoginFlow):
    """Handler for the login flow."""

    async def async_step_init(
        self, user_input: dict[str, str] | None = None
    ) -> AuthFlowResult:
        """Handle the step of the form."""
        errors = None

        if user_input is not None:
            try:
                print("in oasira login flow validate login")

                wordpress_url = (
                    "https://www.effortlesshome.co/wp-json/jwt-auth/v1/token"
                )

                username = user_input["username"]
                password = user_input["password"]

                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        wordpress_url,
                        data={
                            "username": username,
                            "password": password,
                        },
                    )

                runtime_data = self.hass.data.get("OasiraLoginData")
                # print(runtime_data["systemid"])

                if response.status_code == 200:
                    json_data = response.json()

                    # Load values into variables
                    # token = json_data["data"]["token"]
                    # user_id = json_data["data"]["id"]
                    # email = json_data["data"]["email"]
                    # nicename = json_data["data"]["nicename"]
                    # first_name = json_data["data"]["firstName"]
                    # last_name = json_data["data"]["lastName"]

                    self.hass.data[DOMAIN]["email"] = username
                    self.hass.data[DOMAIN]["fullname"] = json_data["data"][
                        "displayName"
                    ]

                else:
                    print("invalid auth")
                    raise InvalidAuthError  # Raise an error for non-200 responses

            except InvalidAuthError:
                print("invalid auth")
                errors = {"base": "invalid_auth"}

            # next check if this user is valid for this system

            url = (
                "https://checkusersystemaccess.jermie.workers.dev/"
                + username
                + "/"
                + runtime_data["systemid"]
            )

            async with aiohttp.ClientSession() as session:  # noqa: SIM117
                async with session.post(url, headers=None, json={}) as response:
                    if response.status != 200:
                        errors = {"base": "invalid_auth"}

            if not errors:
                user_input.pop("password")
                return await self.async_finish(user_input)

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required("username"): str,
                    vol.Required("password"): str,
                }
            ),
            errors=errors,
        )
