from __future__ import annotations

import asyncio
import base64
import json
import logging
import mimetypes
import os
from pathlib import Path
import re
import shutil
import subprocess
from typing import TYPE_CHECKING

from datetime import UTC, datetime, timedelta
import random
import re

import pytz

import aiohttp
import bcrypt
from google.ai import generativelanguage_v1beta
from google.api_core.client_options import ClientOptions
from google.api_core.exceptions import ClientError, DeadlineExceeded, GoogleAPIError
import google.generativeai as genai
import google.generativeai.types as genai_types
import voluptuous as vol

from homeassistant.components.recorder import get_instance

from homeassistant.components.alarm_control_panel import DOMAIN as PLATFORM
from homeassistant.components.notify import BaseNotificationService
from homeassistant.config import get_default_config_dir
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    ATTR_CODE,
    ATTR_NAME,
    CONF_API_KEY,
    EVENT_HOMEASSISTANT_STARTED,
    Platform,
)
import homeassistant.core
from homeassistant.core import (
    HomeAssistant,
    ServiceCall,
    ServiceResponse,
    SupportsResponse,
    asyncio,  # noqa: F811, PGH003 # type: ignore
    callback,
)
from homeassistant.exceptions import (
    ConfigEntryAuthFailed,
    ConfigEntryError,
    ConfigEntryNotReady,
    HomeAssistantError,
)
from homeassistant.helpers import (
    config_validation as cv,
    device_registry as dr,
    entity_registry,
    entity_registry as er,
    issue_registry,
)
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.device_registry import DeviceRegistry
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.service import async_register_admin_service
from homeassistant.helpers.typing import ConfigType
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
import homeassistant.util.dt as dt_util

from . import const

from .alarm_common import (
    async_cancelalarm,
    async_confirmpendingalarm,
    async_getalarmstatus,
)
from .area_manager import AreaManager
from .auto_area import AutoArea
from .backup import OasiraBackup
from .card import async_register_card

# from homeassistant.helpers.typing import ConfigType
from .const import (
    CONF_CHAT_MODEL,
    CONF_PROMPT,
    CONF_SYSTEMID,
    CONF_USERNAME,
    DOMAIN,
    EH_INITIALIZE_API,
    EH_SECURITY_API,
    ISSUE_TYPE_YAML_DETECTED,
    RECOMMENDED_CHAT_MODEL,
    SETUP_DOMAIN,
    MY_EVENT,
    RESTORE_SCENE,
    SCENE_PLATFORM,
    SWITCH_PLATFORM,
    UNIQUE_ID,
)

from .deviceclassgroupsync import async_setup_devicegroup
from .event import EventHandler
from .MotionSensorGrouper import MotionSensorGrouper
from .panel import async_register_panel, async_unregister_panel
from .SecurityAlarmWebhook import SecurityAlarmWebhook, async_remove

from .virtualpowersensor import VirtualPowerSensor
from .aiautomationcoordinator import AIAutomationCoordinator

SERVICE_GENERATE_CONTENT = "generate_content"
CONF_IMAGE_FILENAME = "image_filename"
MIN_DELAY = 1

DEFAULT_AREAS = (
    "Kitchen",
    "bedroom",
    "FamilyRoom",
    "Yard",
    "Basement",
    "Garage",
    "Office",
    "Unknown",
)

# CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)

_LOGGER = logging.getLogger(__name__)


class HASSComponent:
    """Hasscomponent."""

    # Class-level property to hold the hass instance
    hass_instance = None

    @classmethod
    def set_hass(cls, hass: HomeAssistant) -> None:
        """Set Hass."""
        cls.hass_instance = hass

    @classmethod
    def get_hass(cls):  # noqa: ANN206
        """Get Hass."""
        return cls.hass_instance


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Set up Oasira from a config entry."""
    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {}  # Store integration data
    hass.data[DOMAIN]["alarm_id"] = ""

    HASSComponent.set_hass(hass)

    areamanager = AreaManager(hass, DEFAULT_AREAS)
    await areamanager.ensure_areas_exist()

    username = entry.data.get("Oasira Email Address")
    systemid = entry.data.get("Oasira System ID")

    url = EH_INITIALIZE_API + username + "/" + systemid

    headers = {
        "Accept": "application/json, text/html",
    }

    async with aiohttp.ClientSession() as session:  # noqa: SIM117
        async with session.post(url, headers=headers, json={}) as response:
            _LOGGER.debug("API response status: %s", response.status)
            _LOGGER.debug("API response headers: %s", response.headers)
            content = await response.text()
            _LOGGER.debug("API response content: %s", content)

            if response.status == 200 and content != None:  # noqa: PLR2004
                parsed_data = json.loads(content)

                hass.states.async_set("oasira.fullname", parsed_data["fullname"])
                hass.states.async_set("oasira.phonenumber", parsed_data["phonenumber"])

                hass.data[const.DOMAIN] = {
                    "username": username,
                    "systemid": systemid,
                    "eh_security_token": parsed_data["ha_security_token"],
                }

    systemid = hass.data[DOMAIN]["systemid"]  # type: ignore  # noqa: PGH003
    eh_security_token = hass.data[DOMAIN]["eh_security_token"]  # type: ignore  # noqa: PGH003

    url = EH_SECURITY_API + "getsystemplansbysystemid/" + systemid
    headers = {
        "accept": "application/json, text/html",
        "X-Custom-PSK": eh_security_token,
        "eh_system_id": systemid,
        "Content-Type": "application/json; charset=utf-8",
    }

    _LOGGER.info("Calling get plan status API")

    async with aiohttp.ClientSession() as session:  # noqa: SIM117
        async with session.post(url, headers=headers) as response:
            _LOGGER.debug("API response status: %s", response.status)
            _LOGGER.debug("API response headers: %s", response.headers)
            content = await response.text()
            _LOGGER.debug("API response content: %s", content)

            if content is not None:
                data = json.loads(content)

            if "results" in data:
                # Iterate through the 'results' array and process the PlanID
                for result in data["results"]:
                    plan_id = result.get("PlanID")
                    name = result.get("name")
                    active = result.get("active")
                    if plan_id is not None:
                        _LOGGER.debug(
                            f"EH PlanID: {plan_id}, Plan Name: {name}, Active: {active}"
                        )  # noqa: G004

                        if plan_id == 1:
                            hass.states.async_set("oasira.activebaseplan", active == 1)  # type: ignore  # noqa: FBT003, PGH003
                        elif plan_id == 2:  # noqa: PLR2004
                            hass.states.async_set(  # type: ignore  # noqa: PGH003
                                "oasira.activesecurityplan",
                                active == 1,  # noqa: FBT003, PGH003 # type: ignore
                            )
                        elif plan_id == 3:  # noqa: PLR2004
                            hass.states.async_set(  # type: ignore  # noqa: PGH003
                                "oasira.activemonitoringplan",
                                active == 1,  # noqa: FBT003, PGH003 # type: ignore
                            )
                        elif plan_id == 4:  # noqa: PLR2004
                            hass.states.async_set(  # type: ignore  # noqa: PGH003
                                "oasira.activemedicalalertplan",
                                active == 1,  # noqa: FBT003, PGH003 # type: ignore
                            )

            else:
                _LOGGER.debug("No Active Plans Found For This System")

    webhook = SecurityAlarmWebhook(hass)
    await SecurityAlarmWebhook.async_setup_webhook(webhook)

    register_services(hass)

    # Initialize the Motion Sensor Grouper
    grouper = MotionSensorGrouper(hass)

    # Create groups for motion sensors
    await grouper.create_sensor_groups()
    await grouper.create_security_sensor_group()

    # TODO: JERMIE replace hardcoded API Key
    key = "AIzaSyDZXGIUhDkULAWitkOnYfTJ-DbOz6a99lQ"

    genai.configure(api_key=key)

    try:
        client = generativelanguage_v1beta.ModelServiceAsyncClient(
            client_options=ClientOptions(api_key=key)
        )
        await client.get_model(
            name=entry.options.get(CONF_CHAT_MODEL, RECOMMENDED_CHAT_MODEL), timeout=5.0
        )
    except (GoogleAPIError, ValueError) as err:
        if isinstance(err, ClientError) and err.reason == "API_KEY_INVALID":
            raise ConfigEntryAuthFailed(err) from err
        if isinstance(err, DeadlineExceeded):
            raise ConfigEntryNotReady(err) from err
        raise ConfigEntryError(err) from err

    await hass.config_entries.async_forward_entry_setups(
        entry,
        [
            "switch",
            "binary_sensor",
            "sensor",
            "cover",
            "light",
            "conversation",
            "alarm_control_panel",
            "tts",
        ],
    )

    await deploy_latest_config(hass)

    async def after_home_assistant_started(event):
        """Call this function after Home Assistant has started."""
        await loaddevicegroups(None)

    # Listen for the 'homeassistant_started' event
    hass.bus.async_listen_once(
        homeassistant.core.EVENT_HOMEASSISTANT_STARTED, after_home_assistant_started
    )

    return True


async def deploy_latest_config(hass: HomeAssistant):
    # deploy latest: theme, cards, blueprints, etc.
    print("in deploy latest config")

    integration_dir = os.path.dirname(os.path.abspath(__file__))
    source_themes_dir = os.path.join(integration_dir, "themes/oasira")
    source_www_dir = os.path.join(integration_dir, "www")
    source_blueprints_dir = os.path.join(integration_dir, "blueprints")
    source_packages_dir = os.path.join(integration_dir, "oasira_packages")

    source_custom_components_dir = os.path.join(integration_dir, "custom_components")
    source_custom_sentences_dir = os.path.join(integration_dir, "custom_sentences")

    devmode_on = False

    if SETUP_DOMAIN in hass.data and "devmode" in hass.data[SETUP_DOMAIN]:
        devmode = hass.data[SETUP_DOMAIN]["devmode"]
        if devmode is not None:
            if devmode == "on":
                devmode_on = True

    target_themes_dir = "/config/themes"
    target_www_dir = "/config/www"
    target_blueprints_dir = "/config/blueprints"
    target_packages_dir = "/config/oasira_packages"
    target_custom_components_dir = "/config/custom_components"
    target_custom_sentences_dir = "/config/custom_sentences"

    if devmode_on:
        target_themes_dir = "/workspaces/oasiranew/config/themes"
        target_www_dir = "/workspaces/oasiranew/config/www"
        target_blueprints_dir = "/workspaces/oasiranew/config/blueprints"
        target_packages_dir = "/workspaces/oasiranew/config/oasira_packages"
        target_custom_components_dir = "/workspaces/oasiranew/config/custom_components"
        target_custom_sentences_dir = "/workspaces/oasiranew/config/custom_sentences"

    # Ensure destination directories exist
    os.makedirs(target_themes_dir, exist_ok=True)
    os.makedirs(target_www_dir, exist_ok=True)
    os.makedirs(target_blueprints_dir, exist_ok=True)
    os.makedirs(target_packages_dir, exist_ok=True)
    os.makedirs(target_custom_components_dir, exist_ok=True)
    os.makedirs(target_custom_sentences_dir, exist_ok=True)

    # Copy entire themes directory including subfolders and files
    if os.path.exists(source_themes_dir):
        shutil.copytree(source_themes_dir, target_themes_dir, dirs_exist_ok=True)

    # Copy entire www directory including subfolders and files
    if os.path.exists(source_www_dir):
        shutil.copytree(source_www_dir, target_www_dir, dirs_exist_ok=True)

    # Copy entire blueprints directory including subfolders and files
    if os.path.exists(source_blueprints_dir):
        shutil.copytree(
            source_blueprints_dir, target_blueprints_dir, dirs_exist_ok=True
        )

    # Copy entire packages directory including subfolders and files
    if os.path.exists(source_packages_dir):
        shutil.copytree(source_packages_dir, target_packages_dir, dirs_exist_ok=True)

    if os.path.exists(source_custom_components_dir):
        shutil.copytree(
            source_custom_components_dir,
            target_custom_components_dir,
            dirs_exist_ok=True,
        )

    if os.path.exists(source_custom_sentences_dir):
        shutil.copytree(
            source_custom_sentences_dir, target_custom_sentences_dir, dirs_exist_ok=True
        )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry):
    """Unload an Oasira config entry."""

    await hass.config_entries.async_unload_platforms(
        entry,
        [
            "switch",
            "binary_sensor",
            "sensor",
            "cover",
            "light",
            "conversation",
            "alarm_control_panel",
            "tts",
        ],
    )
    # hass.data[DOMAIN].pop(entry.entry_id)

    # await SecurityAlarmWebhook.async_remove(hass)

    return True


async def async_init(hass: HomeAssistant, entry: ConfigEntry, auto_area: AutoArea):
    """Initialize component."""
    await asyncio.sleep(5)  # wait for all area devices to be initialized

    return True


@callback
def register_services(hass) -> None:  # noqa: ANN001
    """Register security services."""

    @callback
    async def cloudbackupservice(call: ServiceCall) -> None:
        await savebackupstocloud(call)

    hass.services.async_register(DOMAIN, "cloudbackupservice", savebackupstocloud)

    @callback
    async def createcleanmotionfilesservice(call: ServiceCall) -> None:
        await cleanmotionfiles(call)

    hass.services.async_register(
        DOMAIN, "createcleanmotionfilesservice", cleanmotionfiles
    )

    @callback
    async def notify_person_service(call: ServiceCall) -> None:
        await async_send_message(call)

    hass.services.async_register(
        DOMAIN,
        "notify_person_service",
        async_send_message,
    )

    @callback
    async def generate_aigen_content_service(call: ServiceCall) -> None:
        await generate_content(call)

    hass.services.async_register(
        DOMAIN,
        "generate_aigen_content_service",
        generate_content,
        schema=vol.Schema(
            {
                vol.Required(CONF_PROMPT): cv.string,
                vol.Optional(CONF_IMAGE_FILENAME, default=[]): vol.All(
                    cv.ensure_list, [cv.string]
                ),
            }
        ),
        supports_response=SupportsResponse.ONLY,
    )

    @callback
    async def createeventservice(call: ServiceCall) -> None:
        await createevent(call)

    @callback
    async def cancelalarmservice(call: ServiceCall) -> None:
        await cancelalarm(call)

    @callback
    async def getalarmstatusservice(call: ServiceCall) -> None:
        await getalarmstatus(call)

    @callback
    async def confirmpendingalarmservice(call: ServiceCall) -> None:
        await confirmpendingalarm(call)

    @callback
    async def loaddevicegroupservice(call: ServiceCall) -> None:
        await loaddevicegroups(call)

    @callback
    async def generateautomationsuggestions(call: ServiceCall) -> None:
        await handle_generate_suggestions(call)

    @callback
    async def generateentityautomationsuggestions(call: ServiceCall) -> None:
        await handle_generate_entity_suggestions(call)

    # Register our service with Home Assistant.
    hass.services.async_register(DOMAIN, "createeventservice", createevent)
    hass.services.async_register(DOMAIN, "cancelalarmservice", cancelalarm)
    hass.services.async_register(DOMAIN, "getalarmstatusservice", getalarmstatus)
    hass.services.async_register(DOMAIN, "loaddevicegroupservice", loaddevicegroups)
    hass.services.async_register(
        DOMAIN, "confirmpendingalarmservice", confirmpendingalarm
    )
    hass.services.async_register(
        DOMAIN, "generateautomationsuggestions", handle_generate_suggestions
    )
    hass.services.async_register(
        DOMAIN,
        "generateentityautomationsuggestions",
        handle_generate_entity_suggestions,
    )


async def loaddevicegroups(calldata) -> None:  # noqa: ANN001, ARG001
    """Load device groups."""
    hass = HASSComponent.get_hass()
    await async_setup_devicegroup(hass)


async def createevent(calldata) -> None:  # noqa: ANN001
    """Create event."""
    _LOGGER.debug("create event calldata =" + str(calldata.data))  # noqa: G003

    hass = HASSComponent.get_hass()

    devicestate = hass.states.get(calldata.data["entity_id"])  # type: ignore  # noqa: PGH003
    sensor_device_class = None
    sensor_device_name = None

    if devicestate and devicestate.attributes.get("friendly_name"):
        sensor_device_name = devicestate.attributes["friendly_name"]

    if devicestate and devicestate.attributes.get("device_class"):
        sensor_device_class = devicestate.attributes["device_class"]

    if sensor_device_class is not None and sensor_device_name is not None:
        alarmstate = hass.data[DOMAIN]["alarm_id"]

        jsonpayload = (
            '{ "sensor_device_class":"'
            + sensor_device_class
            + '", "sensor_device_name":"'
            + sensor_device_name
            + '" }'
        )

        if alarmstate is not None and alarmstate != "":
            alarmstatus = hass.data[DOMAIN]["alarmstatus"]

            if alarmstatus == "ACTIVE":
                alarmid = hass.data[DOMAIN]["alarm_id"]  # type: ignore  # noqa: PGH003
                _LOGGER.debug("alarm id =" + alarmid)  # noqa: G003

                """Call the API to create event."""
                systemid = hass.data[const.DOMAIN]["systemid"]  # type: ignore  # noqa: PGH003
                eh_security_token = hass.data[const.DOMAIN]["eh_security_token"]  # type: ignore  # noqa: PGH003

                url = EH_SECURITY_API + "createevent/" + alarmid
                headers = {
                    "accept": "application/json, text/html",
                    "X-Custom-PSK": eh_security_token,
                    "eh_system_id": systemid,
                    "Content-Type": "application/json; charset=utf-8",
                }

                _LOGGER.info("Calling create event API with payload: %s", jsonpayload)

                async with (
                    aiohttp.ClientSession() as session,
                    session.post(
                        url, headers=headers, json=json.loads(jsonpayload)
                    ) as response,
                ):
                    _LOGGER.debug("API response status: %s", response.status)
                    _LOGGER.debug("API response headers: %s", response.headers)
                    content = await response.text()
                    _LOGGER.debug("API response content: %s", content)

                    return content
            return None
        return None


async def cancelalarm(calldata):  # noqa: ANN001, ANN201, ARG001
    """Cancel alarm."""
    hass = HASSComponent.get_hass()

    return await async_cancelalarm(hass)


async def getalarmstatus(calldata):  # noqa: ANN001, ANN201, ARG001
    """Get alarm status."""
    hass = HASSComponent.get_hass()

    return await async_getalarmstatus(hass)


async def confirmpendingalarm(calldata):  # noqa: ANN001, ANN201, ARG001
    """Confirm pending alarm."""
    hass = HASSComponent.get_hass()

    return await async_confirmpendingalarm(hass)


async def cleanmotionfiles(calldata):
    """Execute the shell command to delete old snapshots."""

    age = "30"

    try:
        age = calldata.data["age"]
    except:
        _LOGGER.error("Invalid Args To Clean Motion Service. Using Default 30 days")

    command = "find /media/snapshots/* -mtime +" + str(age) + " -exec rm {} \\;"

    # Use subprocess to execute the shell command
    process = subprocess.run(
        command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False
    )

    if process.returncode == 0:
        _LOGGER.info("Successfully deleted old snapshots.")
    else:
        _LOGGER.error(f"Error deleting snapshots: {process.stderr.decode()}")



async def async_send_message(calldata):
    """Send a notification message to a person’s device trackers."""
    _LOGGER.debug("In async_send_message")

    hass = HASSComponent.get_hass()

    person_name_list = calldata.data["target"]

    if not person_name_list:
        _LOGGER.debug("No person provided")
        return

    message = calldata.data["message"]

    if not message:
        _LOGGER.debug("No message provided")
        return

    title = calldata.data["title"]
    data = calldata.data["data"]

    # Retrieve person entity and associated device_trackers
    for person_name in person_name_list:
        person_entity = f"{person_name.lower()}"
        entity_reg = entity_registry.async_get(hass)
        person_entry = entity_reg.async_get(person_entity)

        if person_entry is None:
            _LOGGER.debug(f"Person entity {person_entity} not found.")
            return

        _LOGGER.debug(f"Person entry {person_entry} found.")

        device_trackers = homeassistant.components.person.entities_in_person(
            hass, person_entity
        )

        if not device_trackers:
            _LOGGER.debug(f"No device trackers found for person {person_name}.")
            return

        _LOGGER.debug(f"Person device trackers {device_trackers} found.")

        # Send notification to each device tracker
        for device_tracker in device_trackers:
            mobile_app_notify = device_tracker.replace("device_tracker.", "mobile_app_")
            await hass.services.async_call(
                "notify",
                mobile_app_notify,
                {"message": message, "title": title, "data": data},
            )


async def generate_content(call: ServiceCall):
    """Generate content from text and optionally images."""
    prompt_parts = [call.data[CONF_PROMPT]]
    image_filenames = call.data[CONF_IMAGE_FILENAME]

    hass = HASSComponent.get_hass()

    for image_filename in image_filenames:
        if not hass.config.is_allowed_path(image_filename):
            raise HomeAssistantError(
                f"Cannot read `{image_filename}`, no access to path; "
                "`allowlist_external_dirs` may need to be adjusted in "
                "`configuration.yaml`"
            )
        if not Path(image_filename).exists():
            raise HomeAssistantError(f"`{image_filename}` does not exist")
        mime_type, _ = mimetypes.guess_type(image_filename)
        if mime_type is None or not mime_type.startswith("image"):
            raise HomeAssistantError(f"`{image_filename}` is not an image")
        prompt_parts.append(
            {
                "mime_type": mime_type,
                "data": await hass.async_add_executor_job(
                    Path(image_filename).read_bytes
                ),
            }
        )

    # TODO: JERMIE replace hardcoded API Key
    key = "AIzaSyDZXGIUhDkULAWitkOnYfTJ-DbOz6a99lQ"

    genai.configure(api_key=key)

    model = genai.GenerativeModel(model_name=RECOMMENDED_CHAT_MODEL)

    try:
        # response = await model.generate_content_async(prompt_parts)
        # response = model.generate_content(prompt_parts)
        response = await hass.async_add_executor_job(
            model.generate_content, prompt_parts
        )
    except (
        GoogleAPIError,
        ValueError,
        genai_types.BlockedPromptException,
        genai_types.StopCandidateException,
    ) as err:
        raise HomeAssistantError(f"Error generating content: {err}") from err

    if not response.parts:
        raise HomeAssistantError("Error generating content")

    return {"text": response.text}


async def savebackupstocloud(call: ServiceCall):
    backup_folder = "/media/develop/oasiranew/config/backups"
    google_credentials_json = "/media/develop/oasiranew/config/service_account.json"
    retention_days = 30

    hass = HASSComponent.get_hass()

    await hass.async_add_executor_job(
        blocking_backup_and_cleanup,
        backup_folder,
        google_credentials_json,
        retention_days,
    )


def blocking_backup_and_cleanup(backup_folder, google_credentials_json, retention_days):
    """Blocking function to handle backup and cleanup."""

    # Create an instance and perform the operation
    backup_instance = OasiraBackup(
        backup_folder, google_credentials_json, retention_days
    )
    backup_instance.backup_and_cleanup()


async def handle_generate_suggestions(call: ServiceCall) -> None:
    """Handle the generate_suggestions service call."""
    hass = HASSComponent.get_hass()

    coordinator = AIAutomationCoordinator(hass)
    await coordinator.async_request_refresh()


async def handle_generate_entity_suggestions(call: ServiceCall) -> None:
    """Handle the generate_suggestions service call."""
    hass = HASSComponent.get_hass()

    coordinator = AIAutomationCoordinator(hass)
    await coordinator.get_ai_suggestions_for_entity(call)
