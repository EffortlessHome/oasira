"""Platform for sensor integration."""  # noqa: EXE002

from __future__ import annotations

import logging

from homeassistant.components.binary_sensor import BinarySensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .alarm_common import async_cancelalarm, async_creatependingalarm
from .const import OASIRA_ALARM_TYPE_MED_ALERT, OASIRA_ALARM_TYPE_MONITORING

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up entities."""
    HASSComponent.set_hass(hass)

    async_add_entities([BinaryMedAlertSensor()])
    async_add_entities([MonitoringAlarm()])
    async_add_entities([SleepingSensor()])
    async_add_entities([SomeoneHomeSensor()])
    async_add_entities([RenterOccupiedSensor()])
    async_add_entities([SmokeGroup()])
    async_add_entities([MoistureGroup()])
    async_add_entities([CarbonMonoxideGroup()])
    async_add_entities([DoorGroup()])
    async_add_entities([WindowGroup()])
    async_add_entities([SecurityMotionGroup()])
    async_add_entities([MedicationTrackingSensor("medicationtracking1")])
    async_add_entities([MedicationTrackingSensor("medicationtracking2")])
    async_add_entities([MedicationTrackingSensor("medicationtracking3")])
    async_add_entities([MotionNotifcationSensor()])
    async_add_entities([SmartApplianceSensor("smartappliance1")])
    async_add_entities([SmartApplianceSensor("smartappliance2")])
    async_add_entities([SmartApplianceSensor("smartappliance3")])


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


class SecurityMotionGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "motion"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Security Motion Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:motion-sensor"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.security_motion_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class WindowGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "window"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Window Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:window-closed"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.window_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class DoorGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "door"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Door Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:door"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.door_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class CarbonMonoxideGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "carbon_monoxide"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Carbon Monoxide Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:molecule-co"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.carbon_monoxide_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class MoistureGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "moisture"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Moisture Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:water"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.moisture_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class SmokeGroup(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "smoke"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Smoke Group Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:smoke-detector"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "group.smokealarm_sensors_group"
        sensor_state = self.hass.states.get(entity_id)

        if sensor_state != None:
            self._state = sensor_state.state  # type: ignore  # noqa: PGH003
        else:
            sensor_state = "unknown"


class BinaryMedAlertSensor(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "safety"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Medical Alert Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:ambulance"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    async def async_update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        entity_id = "switch.medicalalertalarm"
        switch_state = self.hass.states.get(entity_id)

        turnOn = self._state == "off" and switch_state.state == "on"
        turnOff = self._state == "on" and switch_state.state == "off"

        self._state = switch_state.state

        if turnOn:
            await async_creatependingalarm(self.hass, OASIRA_ALARM_TYPE_MED_ALERT, None)
        elif turnOff:
            hass = HASSComponent.get_hass()
            await async_cancelalarm(hass)


class MonitoringAlarm(BinarySensorEntity):
    """Representation of a sensor."""

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "safety"

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Monitoring Alarm Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:fire"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    async def async_update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "switch.monitoringalarm"
        switch_state = self.hass.states.get(entity_id)

        turnOn = self._state == "off" and switch_state.state == "on"
        turnOff = self._state == "on" and switch_state.state == "off"

        self._state = switch_state.state

        if turnOn:
            await async_creatependingalarm(
                self.hass, OASIRA_ALARM_TYPE_MONITORING, None
            )
        elif turnOff:
            hass = HASSComponent.get_hass()
            await async_cancelalarm(hass)


class SleepingSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Sleeping Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:chat-sleep"

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "switch.switch_sleep_mode"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            switch_state = state.state
            _LOGGER.info(f"The state of {entity_id} is: {switch_state}")
            self._state = switch_state
        else:
            self._state = "off"


class SomeoneHomeSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Someone Home Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:account-check"

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        home = 0
        for entity_id in self.hass.states.entity_ids("device_tracker"):
            state = self.hass.states.get(entity_id)
            if state.state == "home":  # type: ignore  # noqa: PGH003
                home = home + 1

        entity_id = "group.security_motion_sensors_group"
        motion_sensor_state = self.hass.states.get(entity_id)

        motion_sensor_state_val = "Unknown"

        if motion_sensor_state != None:
            motion_sensor_state_val = motion_sensor_state.state  # type: ignore  # noqa: PGH003

        entity_id = "switch.switch_renter_occupied"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        renter_occupied_state = "off"

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            renter_occupied_state = state.state

        if (
            home > 0
            or motion_sensor_state_val.lower() == "on"  # type: ignore  # noqa: PGH003
            or renter_occupied_state.lower() == "on"
        ):
            self._state = "on"
        else:
            self._state = "off"


class RenterOccupiedSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "off"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Renter Occupied Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:bag-suitcase"

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "switch.switch_renter_occupied"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            switch_state = state.state
            _LOGGER.info(f"The state of {entity_id} is: {switch_state}")
            self._state = switch_state
        else:
            self._state = "off"


class MedicationTrackingSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self, entityname) -> None:
        """Initialize the sensor."""
        self._state = "off"
        self._name = entityname

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return self._name

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:pill"

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = f"switch.{self._name}"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            switch_state = state.state
            _LOGGER.info(f"The state of {entity_id} is: {switch_state}")
            self._state = switch_state
        else:
            _LOGGER.info(f"The state of {entity_id} cannnot be determined")
            self._state = "off"


class MotionNotifcationSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = "on"

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Motion Notification Sensor"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:email-check"

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = "switch.switch_motion_notifications"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            switch_state = state.state
            _LOGGER.info(f"The state of {entity_id} is: {switch_state}")
            self._state = switch_state
        else:
            self._state = "off"


class SmartApplianceSensor(BinarySensorEntity):
    """Representation of a sensor."""

    def __init__(self, entityname) -> None:
        """Initialize the sensor."""
        self._state = "off"
        self._name = entityname

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return self._name

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return "running"

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def state(self):  # noqa: ANN201
        """Return the state of the sensor."""
        return self._state

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:washing-machine"

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        entity_id = f"switch.{self._name}"

        # Get the state of the entity
        state = self.hass.states.get(entity_id)

        if state is not None:
            # Get the state value (e.g., "on" or "off")
            switch_state = state.state
            _LOGGER.info(f"The state of {entity_id} is: {switch_state}")
            self._state = switch_state
        else:
            _LOGGER.info(f"The state of {entity_id} cannnot be determined")
            self._state = "off"
