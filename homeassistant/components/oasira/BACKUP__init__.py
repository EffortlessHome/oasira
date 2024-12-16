"""The Oasira Integration."""  # noqa: EXE002

from __future__ import annotations

import asyncio
import base64
import logging
import os
import re

import bcrypt

from homeassistant.components.alarm_control_panel import DOMAIN as PLATFORM
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_CODE, Platform
from homeassistant.core import (
    HomeAssistant,
    asyncio,  # noqa: F811, PGH003 # type: ignore
    callback,
)
from homeassistant.helpers import device_registry as dr, entity_registry as er
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import const
from .automations import AutomationHandler
from .const import DOMAIN
from .event import EventHandler
from .mqtt import MqttHandler
from .panel import async_unregister_panel
from .SecurityAlarmWebhook import SecurityAlarmWebhook
from .sensors import ATTR_ENTITIES, ATTR_GROUP, ATTR_NEW_ENTITY_ID, SensorHandler
from .store import async_get_registry

PLATFORMS: list[Platform] = [
    Platform.SWITCH,
    Platform.BINARY_SENSOR,
    Platform.SENSOR,
    Platform.COVER,
    Platform.LIGHT,
    Platform.CONVERSATION,
]


from homeassistant.const import Platform

# from homeassistant.helpers.typing import ConfigType


SERVICE_GENERATE_CONTENT = "generate_content"
CONF_IMAGE_FILENAME = "image_filename"

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


async def async_setup(hass, config) -> bool:  # noqa: ANN001
    """Track states and offer events for sensors."""
    HASSComponent.set_hass(hass)

    # deploy latest: theme, cards, blueprints, etc.
    integration_dir = os.path.dirname(os.path.abspath(__file__))
    source_themes_dir = os.path.join(integration_dir, "themes")
    source_www_dir = os.path.join(integration_dir, "www")
    source_blueprints_dir = os.path.join(integration_dir, "blueprints")

    target_themes_dir = "/config/themes"
    target_www_dir = "/config/www"

    # Ensure destination directories exist
    # os.makedirs(target_themes_dir, exist_ok=True)
    # os.makedirs(target_www_dir, exist_ok=True)
    # os.makedirs(target_blueprints_dir, exist_ok=True)

    _LOGGER.info("effortlesshome source themes dir" + source_themes_dir)
    _LOGGER.info("effortlesshome target themes dir" + target_themes_dir)
    _LOGGER.info("effortlesshome target www dir" + target_www_dir)

    # Copy entire themes directory including subfolders and files
    # if os.path.exists(source_themes_dir):
    #    shutil.copytree(source_themes_dir, target_themes_dir, dirs_exist_ok=True)

    # Copy entire www directory including subfolders and files
    # if os.path.exists(source_www_dir):
    #    shutil.copytree(source_www_dir, target_www_dir, dirs_exist_ok=True)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool | None:
    """Set up effortlesshome integration from a config entry."""
    session = async_get_clientsession(hass)

    store = await async_get_registry(hass)
    coordinator = effortlesshomeCoordinator(hass, session, entry, store)

    device_registry = dr.async_get(hass)
    device_registry.async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={(const.DOMAIN, coordinator.id)},
        name=const.NAME,
        model=const.NAME,
        sw_version=const.VERSION,
        manufacturer=const.MANUFACTURER,
    )

    if entry.unique_id is None:
        hass.config_entries.async_update_entry(entry, unique_id=coordinator.id, data={})

    return True


async def async_unload_entry(hass, entry) -> bool:  # noqa: ANN001
    """Unload effortlesshome config entry."""
    unload_ok = all(
        await asyncio.gather(
            *[hass.config_entries.async_forward_entry_unload(entry, PLATFORM)]
        )
    )
    if not unload_ok:
        return False

    async_unregister_panel(hass)
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    await coordinator.async_unload()

    # unsubscribe from changes:
    hass.data[DOMAIN][entry.entry_id].cleanup()

    # unload platforms:
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data[DOMAIN].pop(entry.entry_id)
        _LOGGER.warning("Unloaded successfully %s", entry.entry_id)
    else:
        _LOGGER.error("Couldn't unload config entry %s", entry.entry_id)

    await SecurityAlarmWebhook.async_remove(hass)

    return unloaded


async def async_remove_entry(hass, entry) -> None:  # noqa: ANN001, ARG001
    """Remove effortlesshome config entry."""
    async_unregister_panel(hass)
    coordinator = hass.data[const.DOMAIN]["coordinator"]
    await coordinator.async_delete_config()
    del hass.data[const.DOMAIN]


class effortlesshomeCoordinator(DataUpdateCoordinator):  # noqa: N801
    """Define an object to hold effortlesshome device."""

    def __init__(self, hass, session, entry, store) -> None:  # noqa: ANN001, ARG002
        """Initialize."""
        self.id = entry.unique_id
        self.hass = hass
        self.entry = entry
        self.store = store
        self._subscriptions = []

        self._subscriptions.append(
            async_dispatcher_connect(
                hass, "effortlesshome_platform_loaded", self.setup_alarm_entities
            )
        )
        self.register_events()

        super().__init__(hass, _LOGGER, name=const.DOMAIN)

    @callback
    def setup_alarm_entities(self) -> None:
        """Setup alarm entities."""  # noqa: D401
        self.hass.data[const.DOMAIN]["sensor_handler"] = SensorHandler(self.hass)
        self.hass.data[const.DOMAIN]["automation_handler"] = AutomationHandler(
            self.hass
        )
        self.hass.data[const.DOMAIN]["mqtt_handler"] = MqttHandler(self.hass)
        self.hass.data[const.DOMAIN]["event_handler"] = EventHandler(self.hass)

        areas = self.store.async_get_areas()
        config = self.store.async_get_config()

        for item in areas.values():
            async_dispatcher_send(self.hass, "effortlesshome_register_entity", item)

        if len(areas) > 1 and config["master"]["enabled"]:
            async_dispatcher_send(
                self.hass, "effortlesshome_register_master", config["master"]
            )

    async def async_update_config(self, data) -> None:  # noqa: ANN001
        """Update config."""
        if "master" in data:
            old_config = self.store.async_get_config()
            if old_config[const.ATTR_MASTER] != data["master"]:
                if self.hass.data[const.DOMAIN]["master"]:
                    await self.async_remove_entity("master")
                if data["master"]["enabled"]:
                    async_dispatcher_send(
                        self.hass, "effortlesshome_register_master", data["master"]
                    )
                else:
                    automations = self.hass.data[const.DOMAIN][
                        "automation_handler"
                    ].get_automations_by_area(None)
                    if len(automations):
                        for el in automations:
                            self.store.async_delete_automation(el)
                        async_dispatcher_send(
                            self.hass, "effortlesshome_automations_updated"
                        )

        self.store.async_update_config(data)
        async_dispatcher_send(self.hass, "effortlesshome_config_updated")

    async def async_update_area_config(  # noqa: D102, PLR0912
        self, area_id: str | None = None, data: dict | None = None
    ) -> None:
        if data is None:
            data = {}
        if const.ATTR_REMOVE in data:
            # delete an area
            res = self.store.async_get_area(area_id)
            if not res:
                return
            sensors = self.store.async_get_sensors()
            sensors = dict(filter(lambda el: el[1]["area"] == area_id, sensors.items()))
            if sensors:
                for el in sensors:
                    self.store.async_delete_sensor(el)
                async_dispatcher_send(self.hass, "effortlesshome_sensors_updated")

            automations = self.hass.data[const.DOMAIN][
                "automation_handler"
            ].get_automations_by_area(area_id)
            if len(automations):
                for el in automations:
                    self.store.async_delete_automation(el)
                async_dispatcher_send(self.hass, "effortlesshome_automations_updated")

            self.store.async_delete_area(area_id)
            await self.async_remove_entity(area_id)  # type: ignore  # noqa: PGH003

            if (
                len(self.store.async_get_areas()) == 1
                and self.hass.data[const.DOMAIN]["master"]
            ):
                await self.async_remove_entity("master")

        elif self.store.async_get_area(area_id):
            # modify an area
            entry = self.store.async_update_area(area_id, data)
            if "name" not in data:
                async_dispatcher_send(
                    self.hass, "effortlesshome_config_updated", area_id
                )
            else:
                await self.async_remove_entity(area_id)  # type: ignore  # noqa: PGH003
                async_dispatcher_send(
                    self.hass, "effortlesshome_register_entity", entry
                )
        else:
            # create an area
            entry = self.store.async_create_area(data)
            async_dispatcher_send(self.hass, "effortlesshome_register_entity", entry)

            config = self.store.async_get_config()

            if len(self.store.async_get_areas()) == 2 and config["master"]["enabled"]:  # noqa: PLR2004
                async_dispatcher_send(
                    self.hass, "effortlesshome_register_master", config["master"]
                )

    def async_update_sensor_config(self, entity_id: str, data: dict) -> None:
        """Update sensor config."""
        group = None
        if ATTR_GROUP in data:
            group = data[ATTR_GROUP]
            del data[ATTR_GROUP]

        if ATTR_NEW_ENTITY_ID in data:
            # delete old sensor entry when changing the entity_id
            new_entity_id = data[ATTR_NEW_ENTITY_ID]
            del data[ATTR_NEW_ENTITY_ID]
            self.store.async_delete_sensor(entity_id)
            self.assign_sensor_to_group(new_entity_id, group)  # type: ignore  # noqa: PGH003
            self.assign_sensor_to_group(entity_id, None)  # type: ignore  # noqa: PGH003
            entity_id = new_entity_id

        if const.ATTR_REMOVE in data:
            self.store.async_delete_sensor(entity_id)
            self.assign_sensor_to_group(entity_id, None)  # type: ignore  # noqa: PGH003
        elif self.store.async_get_sensor(entity_id):
            self.store.async_update_sensor(entity_id, data)
            self.assign_sensor_to_group(entity_id, group)  # type: ignore  # noqa: PGH003
        else:
            self.store.async_create_sensor(entity_id, data)
            self.assign_sensor_to_group(entity_id, group)  # type: ignore  # noqa: PGH003

        async_dispatcher_send(self.hass, "effortlesshome_sensors_updated")

    def async_update_user_config(  # noqa: D102
        self, user_id: str | None = None, data: dict | None = None
    ) -> bool | None:
        if data is None:
            data = {}
        if const.ATTR_REMOVE in data:
            self.store.async_delete_user(user_id)
            return None

        if data.get(ATTR_CODE):
            data[const.ATTR_CODE_FORMAT] = (
                "number" if data[ATTR_CODE].isdigit() else "text"
            )
            data[const.ATTR_CODE_LENGTH] = len(data[ATTR_CODE])
            hashed = bcrypt.hashpw(
                data[ATTR_CODE].encode("utf-8"), bcrypt.gensalt(rounds=12)
            )
            hashed = base64.b64encode(hashed)
            data[ATTR_CODE] = hashed.decode()

        if not user_id:
            self.store.async_create_user(data)
            return None
        if ATTR_CODE in data:
            if const.ATTR_OLD_CODE not in data or not self.async_authenticate_user(
                data[const.ATTR_OLD_CODE], user_id
            ):
                return False
            del data[const.ATTR_OLD_CODE]
            self.store.async_update_user(user_id, data)
            return None
        self.store.async_update_user(user_id, data)
        return None

    def async_authenticate_user(self, code: str, user_id: str | None = None):  # noqa: ANN201
        """Authenticate user."""
        if not user_id:
            users = self.store.async_get_users()
        else:
            users = {user_id: self.store.async_get_user(user_id)}

        for user_id, user in users.items():  # noqa: B007, PLR1704
            if not user[const.ATTR_ENABLED]:
                continue
            if not user[ATTR_CODE] and not code:
                return user
            if user[ATTR_CODE]:
                hash = base64.b64decode(user[ATTR_CODE])  # noqa: A001
                if bcrypt.checkpw(code.encode("utf-8"), hash):
                    return user

        return None

    def async_update_automation_config(  # noqa: D102
        self, automation_id: str | None = None, data: dict | None = None
    ) -> None:
        if data is None:
            data = {}
        if const.ATTR_REMOVE in data:
            self.store.async_delete_automation(automation_id)
        elif not automation_id:
            self.store.async_create_automation(data)
        else:
            self.store.async_update_automation(automation_id, data)

        async_dispatcher_send(self.hass, "effortlesshome_automations_updated")

    def register_events(self) -> None:
        """Register events."""

        # handle push notifications with action buttons
        @callback
        async def async_handle_push_event(event) -> None:  # noqa: ANN001
            if not event.data:
                return
            action = (
                event.data.get("actionName")
                if "actionName" in event.data
                else event.data.get("action")
            )

            if action not in const.EVENT_ACTIONS:
                return

            if self.hass.data[const.DOMAIN]["master"]:
                alarm_entity = self.hass.data[const.DOMAIN]["master"]
            elif len(self.hass.data[const.DOMAIN]["areas"]) == 1:
                alarm_entity = next(
                    iter(self.hass.data[const.DOMAIN]["areas"].values())
                )
            else:
                _LOGGER.info(
                    "Cannot process the push action, since there are multiple areas."
                )
                return

            arm_mode = (
                alarm_entity._revert_state  # noqa: SLF001
                if alarm_entity._revert_state in const.ARM_MODES  # noqa: SLF001
                else alarm_entity._arm_mode  # noqa: SLF001
            )
            res = re.search(r"^effortlesshome_ARM_", action)
            if res:
                arm_mode = (
                    action.replace("effortlesshome_", "")
                    .lower()
                    .replace("arm", "armed")
                )
            if not arm_mode:
                _LOGGER.info(
                    "Cannot process the push action, since the arm mode is not known."
                )
                return

            if action == const.EVENT_ACTION_FORCE_ARM:
                _LOGGER.info("Received request for force arming")
                alarm_entity.async_handle_arm_request(
                    arm_mode, skip_code=True, bypass_open_sensors=True
                )
            elif action == const.EVENT_ACTION_RETRY_ARM:
                _LOGGER.info("Received request for retry arming")
                alarm_entity.async_handle_arm_request(arm_mode, skip_code=True)
            elif action == const.EVENT_ACTION_DISARM:
                _LOGGER.info("Received request for disarming")
                alarm_entity.alarm_disarm(None, skip_code=True)
            else:
                _LOGGER.info(f"Received request for arming with mode {arm_mode}")  # noqa: G004
                alarm_entity.async_handle_arm_request(arm_mode, skip_code=True)

        self._subscriptions.append(
            self.hass.bus.async_listen(const.PUSH_EVENT, async_handle_push_event)
        )

    async def async_remove_entity(self, area_id: str) -> None:
        """Remove entity."""
        entity_registry = er.async_get(self.hass)
        if area_id == "master":
            entity = self.hass.data[const.DOMAIN]["master"]
            entity_registry.async_remove(entity.entity_id)
            self.hass.data[const.DOMAIN]["master"] = None
        else:
            entity = self.hass.data[const.DOMAIN]["areas"][area_id]
            entity_registry.async_remove(entity.entity_id)
            self.hass.data[const.DOMAIN]["areas"].pop(area_id, None)

    def async_get_sensor_groups(self):  # noqa: ANN201
        """Fetch a list of sensor groups (websocket API hook)."""
        groups = self.store.async_get_sensor_groups()
        return list(groups.values())

    def async_get_group_for_sensor(self, entity_id: str):  # noqa: ANN201
        """Get group for sensor."""
        groups = self.async_get_sensor_groups()
        result = next((el for el in groups if entity_id in el[ATTR_ENTITIES]), None)
        return result["group_id"] if result else None

    def assign_sensor_to_group(self, entity_id: str, group_id: str) -> None:
        """Assign sensor to group."""
        updated = False
        old_group = self.async_get_group_for_sensor(entity_id)
        if old_group and group_id != old_group:
            # remove sensor from group
            el = self.store.async_get_sensor_group(old_group)
            if len(el[ATTR_ENTITIES]) > 2:  # noqa: PLR2004
                self.store.async_update_sensor_group(
                    old_group,
                    {ATTR_ENTITIES: [x for x in el[ATTR_ENTITIES] if x != entity_id]},
                )
            else:
                self.store.async_delete_sensor_group(old_group)
            updated = True
        if group_id:
            # add sensor to group
            group = self.store.async_get_sensor_group(group_id)
            if not group:
                _LOGGER.error(
                    f"Failed to assign entity {entity_id} to group {group_id}"  # noqa: G004
                )
            elif entity_id not in group[ATTR_ENTITIES]:
                self.store.async_update_sensor_group(
                    group_id, {ATTR_ENTITIES: group[ATTR_ENTITIES] + [entity_id]}
                )
                updated = True
        if updated:
            async_dispatcher_send(self.hass, "effortlesshome_sensors_updated")

    def async_update_sensor_group_config(  # noqa: D102
        self, group_id: str | None = None, data: dict | None = None
    ) -> None:
        if data is None:
            data = {}
        if const.ATTR_REMOVE in data:
            self.store.async_delete_sensor_group(group_id)
        elif not group_id:
            self.store.async_create_sensor_group(data)
        else:
            self.store.async_update_sensor_group(group_id, data)

        async_dispatcher_send(self.hass, "effortlesshome_sensors_updated")

    async def async_unload(self) -> None:
        """Remove all effortlesshome objects."""
        # remove alarm_control_panel entities
        areas = list(self.hass.data[const.DOMAIN]["areas"].keys())
        for area in areas:
            await self.async_remove_entity(area)
        if self.hass.data[const.DOMAIN]["master"]:
            await self.async_remove_entity("master")

        del self.hass.data[const.DOMAIN]["sensor_handler"]
        del self.hass.data[const.DOMAIN]["automation_handler"]
        del self.hass.data[const.DOMAIN]["mqtt_handler"]
        del self.hass.data[const.DOMAIN]["event_handler"]

        # remove subscriptions for coordinator
        while len(self._subscriptions):
            self._subscriptions.pop()()

    async def async_delete_config(self) -> None:
        """Wipe effortlesshome storage."""
        await self.store.async_delete()
