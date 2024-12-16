"""Switch platform for integration_blueprint."""

from __future__ import annotations

from datetime import timedelta
from functools import cached_property
import logging
import re

import pytz

from homeassistant.components.switch import SwitchDeviceClass, SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity
from homeassistant.helpers.typing import UndefinedType

from .auto_area import AutoArea
from .const import DOMAIN, SWITCH_PLATFORM
from .medication_tracking import MedicationTrackingSwitch
from .motion_notification import MotionNotificationsSwitch
from .renter_occupied import RenterOccupiedSwitch
from .sleep_mode import SleepModeSwitch
from .smart_appliance_conversion import SmartApplianceConversionSwitch

SCAN_INTERVAL = timedelta(seconds=5)

_LOGGER: logging.Logger = logging.getLogger(__package__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up entities."""

    auto_area = AutoArea(hass=hass, areaid="unknown")

    async_add_entities(
        [
            # PresenceLockSwitch(auto_area),
            SleepModeSwitch(auto_area),
            RenterOccupiedSwitch(auto_area),
            MotionNotificationsSwitch(auto_area),
            MedicalAlertAlarmSwitch(auto_area, "medicalalertalarm"),
            MonitoringAlarmSwitch(auto_area, "monitoringalarm"),
            MedicationTrackingSwitch(auto_area, "medicationtracking1"),
            MedicationTrackingSwitch(auto_area, "medicationtracking1"),
            MedicationTrackingSwitch(auto_area, "medicationtracking1"),
            SmartApplianceConversionSwitch(auto_area, "SmartAppliance1"),
            SmartApplianceConversionSwitch(auto_area, "SmartAppliance2"),
            SmartApplianceConversionSwitch(auto_area, "SmartAppliance3"),
        ]
    )

    async_add_entities([PresenceSimulationSwitch(hass)], True)


class MedicalAlertAlarmSwitch(SwitchEntity):
    """Set up a medical alert alarm switch."""

    _attr_should_poll = False

    def __init__(self, auto_area: AutoArea, name) -> None:
        """Initialize switch."""
        self.auto_area = auto_area
        self._is_on: bool = False
        self.name = name
        self.entity_id = "switch." + name

        _LOGGER.info(
            "%s: Initialized medical alert alarm switch (%s)",
            self.auto_area.area_name,
            self.name,
        )

    @cached_property
    def name(self) -> str | UndefinedType | None:
        """Return the name of the entity."""
        return self.name

    @cached_property
    def device_info(self) -> DeviceInfo:
        """Information about this device."""
        return self.auto_area.device_info

    @cached_property
    def device_class(self) -> SwitchDeviceClass | None:
        """Return device class."""
        return SwitchDeviceClass.SWITCH

    @property
    def is_on(self) -> bool | None:
        """Return the state of the switch."""
        return self._is_on

    def turn_on(self, **kwargs) -> None:
        """Turn on switch."""
        _LOGGER.info("%s: medical alert alarm turned on", self.auto_area.area_name)
        self._is_on = True
        self.schedule_update_ha_state()

    def turn_off(self, **kwargs):
        """Turn off switch."""
        _LOGGER.info("%s: medical alert alarm turned off", self.auto_area.area_name)
        self._is_on = False
        self.schedule_update_ha_state()


class MonitoringAlarmSwitch(SwitchEntity):
    """Set up a monitoring alert alarm switch."""

    _attr_should_poll = False

    def __init__(self, auto_area: AutoArea, name) -> None:
        """Initialize switch."""
        self.auto_area = auto_area
        self._is_on: bool = False
        self.name = name
        self.entity_id = "switch." + name

        _LOGGER.info(
            "%s: Initialized monitoring alarm switch (%s)",
            self.auto_area.area_name,
            self.name,
        )

    @cached_property
    def name(self) -> str | UndefinedType | None:
        """Return the name of the entity."""
        return self.name

    @cached_property
    def device_info(self) -> DeviceInfo:
        """Information about this device."""
        return self.auto_area.device_info

    @cached_property
    def device_class(self) -> SwitchDeviceClass | None:
        """Return device class."""
        return SwitchDeviceClass.SWITCH

    @property
    def is_on(self) -> bool | None:
        """Return the state of the switch."""
        return self._is_on

    def turn_on(self, **kwargs) -> None:
        """Turn on switch."""
        _LOGGER.info("%s: mmonitoring alarm turned on", self.auto_area.area_name)
        self._is_on = True
        self.schedule_update_ha_state()

    def turn_off(self, **kwargs):
        """Turn off switch."""
        _LOGGER.info("%s: monitoring alarm turned off", self.auto_area.area_name)
        self._is_on = False
        self.schedule_update_ha_state()


class PresenceSimulationSwitch(SwitchEntity, RestoreEntity):
    def __init__(self, hass, config=None):
        _LOGGER.debug("In init of presence switch")
        self.update_config(config)

        self.hass = hass
        self.attr = {}
        self._attr_name = "Oasira Presence Simulation"
        self.attr["friendly_name"] = "Presence Simulation Toggle"
        # As HA is starting, we don't know the running state of the simulation
        # until restore_state() runs.
        self._attr_available = False
        # State is represented by _attr_is_on, which is initialzied
        # to None by homeassistant/helpers/entity.py:ToggleEntity.
        # State will be initialized when restore_state() runs.
        self._next_events = []
        self.id = (
            SWITCH_PLATFORM + "." + re.sub("[^0-9a-zA-Z]", "_", "presencesimulation")
        )
        _LOGGER.debug("In init of switch - end")

    def update_config(self, config):
        # self.config = config
        _LOGGER.debug("Config data & options %s, %s", config.data, config.options)

        elms = ["light.all_light_group"]

        self._entities = elms
        self._random = 0
        self._interval = 30
        self._delta = 7
        self._restore = True
        self._unavailable_as_off = True
        self.reset_default_values()

    @property
    def unique_id(self):
        return self.id  # UNIQUE_ID + "_" + str(self.instance)

    def internal_turn_on(self, **kwargs):
        """Turn on the presence simulation flag. Does not launch the simulation, this is for the calls from the services, to avoid a loop"""
        self._attr_available = True
        self._attr_is_on = True
        self.async_write_ha_state()

    def internal_turn_off(self, **kwargs):
        """Turn off the presence simulation flag. Does not launch the stop simulation service, this is for the calls from the services, to avoid a loop"""
        self._attr_available = True
        self._attr_is_on = False
        self._next_events = []
        self.async_write_ha_state()

    async def turn_on_async(self, after_ha_restart=False, **kwargs):
        """Turn on the presence simulation"""
        _LOGGER.debug("Turn on of the presence simulation through the switch")
        await self.hass.services.async_call(
            DOMAIN,
            "start",
            {
                "switch_id": self.id,
                "internal": True,
                "after_ha_restart": after_ha_restart,
            },
        )

    def turn_on(self, **kwargs):
        """Turn on the presence simulation"""
        _LOGGER.debug("Turn on of the presence simulation through the switch")
        self.hass.services.call(
            DOMAIN, "start", {"switch_id": self.id, "internal": True}
        )

    def turn_off(self, **kwargs):
        """Turn off the presence simulation"""
        _LOGGER.debug("Turn off of the presence simulation through the switch")
        self.hass.services.call(
            DOMAIN, "stop", {"switch_id": self.id, "internal": True}
        )

    async def async_update(self):
        """Update the attributes in regards to the list of next events"""
        if len(self._next_events) > 0:
            (
                self.attr["next_event_datetime"],
                self.attr["next_entity_id"],
                self.attr["next_entity_state"],
            ) = self._next_events[0]  # list is sorted
            try:
                self.attr["next_event_datetime"] = (
                    self.attr["next_event_datetime"]
                    .astimezone(self.hass.config.time_zone)
                    .strftime("%d/%m/%Y %H:%M:%S")
                )
            except Exception:
                try:
                    self.attr["next_event_datetime"] = (
                        self.attr["next_event_datetime"]
                        .astimezone(pytz.timezone(self.hass.config.time_zone))
                        .strftime("%d/%m/%Y %H:%M:%S")
                    )
                except Exception as e:
                    _LOGGER.warning(
                        "Exception while trying to convert utc to local time: %s", e
                    )
        else:
            for prop in ("next_event_datetime", "next_entity_id", "next_entity_state"):
                if prop in self.attr:
                    del self.attr[prop]

    def update(self):
        """Update the attributes in regards to the list of next events"""
        if len(self._next_events) > 0:
            (
                self.attr["next_event_datetime"],
                self.attr["next_entity_id"],
                self.attr["next_entity_state"],
            ) = self._next_events[0]  # list is sorted
            try:
                self.attr["next_event_datetime"] = (
                    self.attr["next_event_datetime"]
                    .astimezone(self.hass.config.time_zone)
                    .strftime("%d/%m/%Y %H:%M:%S")
                )
            except Exception:
                try:
                    self.attr["next_event_datetime"] = (
                        self.attr["next_event_datetime"]
                        .astimezone(pytz.timezone(self.hass.config.time_zone))
                        .strftime("%d/%m/%Y %H:%M:%S")
                    )
                except Exception as e:
                    _LOGGER.warning(
                        "Exception while trying to convert utc to local time: %s", e
                    )
        else:
            for prop in ("next_event_datetime", "next_entity_id", "next_entity_state"):
                if prop in self.attr:
                    del self.attr[prop]

    @property
    def entities(self):
        return self._entities_overriden

    @property
    def random(self):
        return self._random_overriden

    @property
    def delta(self):
        return self._delta_overriden

    @property
    def restore(self):
        return self._restore_overriden

    @property
    def unavailable_as_off(self):
        return self._unavailable_as_off

    @property
    def interval(self):
        return self._interval

    async def reset_default_values_async(self):
        self._entities_overriden = self._entities
        self._random_overriden = self._random
        self._restore_overriden = self._restore
        self._delta_overriden = self._delta
        self._unavailable_as_off_overriden = self._unavailable_as_off

    def reset_default_values(self):
        self._entities_overriden = self._entities
        self._random_overriden = self._random
        self._restore_overriden = self._restore
        self._delta_overriden = self._delta
        self._unavailable_as_off_overriden = self._unavailable_as_off

    # def device_state_attributes(self):
    @property
    def extra_state_attributes(self):
        """Returns the attributes list"""
        return self.attr

    async def async_added_to_hass(self):
        """When sensor is added to hassio."""
        await super().async_added_to_hass()
        if DOMAIN not in self.hass.data:
            self.hass.data[DOMAIN] = {}
        if SWITCH_PLATFORM not in self.hass.data[DOMAIN]:
            self.hass.data[DOMAIN][SWITCH_PLATFORM] = {}

        # restore stored state
        _LOGGER.debug("Adding %s to %s", self.id, SWITCH_PLATFORM)
        self.hass.data[DOMAIN][SWITCH_PLATFORM][self.id] = self
        if (state := await self.async_get_last_state()) is not None:
            _LOGGER.debug("restore stored state")
            if state.state == "on":
                _LOGGER.debug("State was on")
                if "entity_id" in state.attributes:
                    self._entities_overriden = state.attributes["entity_id"]
                if "random" in state.attributes:
                    self._random_overriden = state.attributes["random"]
                if "delta" in state.attributes:
                    self._delta_overriden = state.attributes["delta"]
                if "restore_sates" in state.attributes:
                    self._restore_overriden = state.attributes["restore_states"]
                if "unavailable_as_off" in state.attributes:
                    self._unavailable_as_off = state.attributes["unavailable_as_off"]
                # just set internally to on, the simulation service will be called later once the HA Start event is fired
                self.internal_turn_on()
            else:
                _LOGGER.debug("State was off")
                self.internal_turn_off()
        else:
            self.internal_turn_off()

    async def async_add_next_event(self, next_datetime, entity_id, state):
        """Add the next event in the the events list and sort them"""
        self._next_events.append((next_datetime, entity_id, state))
        # sort so that the firt element is the next one
        self._next_events = sorted(self._next_events)

    async def async_remove_event(self, entity_id):
        """Remove the next event of an entity"""
        self._next_events = [e for e in self._next_events if e[1] != entity_id]

    async def set_start_datetime(self, start_datetime):
        self.attr["simulation_start"] = start_datetime

    async def set_delta(self, delta):
        self.attr["delta"] = delta
        self._delta_overriden = delta

    async def set_entities(self, entities):
        _LOGGER.debug("overidding entities %s", entities)
        self.attr["entity_id"] = entities
        self._entities_overriden = entities

    async def set_restore(self, restore_states):
        self.attr["restore_states"] = restore_states
        self._restore_overriden = restore_states

    async def set_random(self, random):
        self.attr["random"] = random
        self._random_overriden = random

    async def set_unavailable_as_off(self, random):
        self.attr["unavailable_as_off"] = random
        self._unavailable_as_off = unavailable_as_off

    async def set_interval(self, interval):
        self._interval = interval

    async def reset_start_datetime(self):
        if "simulation_start" in self.attr:
            del self.attr["simulation_start"]

    async def reset_delta(self):
        if "delta" in self.attr:
            del self.attr["delta"]

    async def reset_entities(self):
        if "entity_id" in self.attr:
            del self.attr["entity_id"]

    async def reset_restore_states(self):
        if "restore_states" in self.attr:
            del self.attr["restore_states"]

    async def reset_random(self):
        if "random" in self.attr:
            del self.attr["random"]

    async def reset_unavailable_as_off(self):
        if "unavailable_as_off" in self.attr:
            del self.attr["unavailable_as_off"]
