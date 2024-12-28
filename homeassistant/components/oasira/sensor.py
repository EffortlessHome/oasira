"""Platform for sensor integration."""

from __future__ import annotations

import logging

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import SUN_EVENT_SUNRISE, SUN_EVENT_SUNSET
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import async_get_platforms
from homeassistant.helpers.event import async_track_state_change
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.helpers import entity_registry as er
from .virtualpowersensor import (
    VirtualPowerSensor,
    FakeDeviceVirtualPowerSensor,
    TotalEnergySensor,
)

from .const import DOMAIN

FAKE_DEVICE_TYPES = {
    "Ceiling Fan": (50, 75),
    "Laptop Charger": (30, 60),
    "Desktop Computer": (100, 250),
    "Fridge": (100, 800),
}

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up entities."""

    async_add_entities([AlarmIDSensor()])
    async_add_entities([AlarmCreateMessageSensor()])
    async_add_entities([AlarmOwnerIDSensor()])
    async_add_entities([AlarmStatusSensor()])
    async_add_entities([AlarmLastEventSensor()])
    async_add_entities([AverageHumiditySensor()])
    async_add_entities([AverageTemperatureSensor()])
    async_add_entities([VirtualIlluminanceSensor()])
    async_add_entities([HighTemperatureTomorrowSensor()])

    async_add_entities(
        [
            OasiraConfigSensor(
                "DaysHistoryToKeep", config_entry.options.get("Days History To Keep")
            )
        ]
    )
    async_add_entities(
        [
            OasiraConfigSensor(
                "LowTemperature", config_entry.options.get("Low Temperature")
            )
        ]
    )
    async_add_entities(
        [
            OasiraConfigSensor(
                "HighTemperature", config_entry.options.get("High Temperature")
            )
        ]
    )
    async_add_entities(
        [OasiraConfigSensor("LowHumidity", config_entry.options.get("Low Humidity"))]
    )
    async_add_entities(
        [OasiraConfigSensor("HighHumidity", config_entry.options.get("High Humidity"))]
    )

    # TODO: Jermie replace with configured fake power sensors for total power usage monitoring
    fakeentities = []
    for device_type, (min_wattage, max_wattage) in FAKE_DEVICE_TYPES.items():
        fakeentities.append(
            FakeDeviceVirtualPowerSensor(device_type, min_wattage, max_wattage)
        )

    async_add_entities(fakeentities)

    powerentities = []

    entity_registry = er.async_get(hass)
    all_entities = entity_registry.entities.values()

    for entity in all_entities:
        if entity.entity_id.startswith("climate."):
            virtual_sensor = VirtualPowerSensor(hass, entity.entity_id, 1500.0)
            powerentities.append(virtual_sensor)
        elif entity.entity_id.startswith("light"):
            virtual_sensor = VirtualPowerSensor(hass, entity.entity_id, 20.0)
            powerentities.append(virtual_sensor)
        elif entity.entity_id.startswith("media_player."):
            virtual_sensor = VirtualPowerSensor(hass, entity.entity_id, 100.0)
            powerentities.append(virtual_sensor)

    async_add_entities(powerentities)

    async_add_entities([TotalEnergySensor(hass)])


class AlarmIDSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Alarm ID Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:alarm-light"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        try:
            self._state = self.hass.data[DOMAIN]["alarm_id"]
        except:
            self._state = ""


class AlarmCreateMessageSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Alarm ID Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:alarm-light"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        try:
            self._state = self.hass.data[DOMAIN]["alarmcreatemessage"]
        except:
            self._state = ""


class AlarmOwnerIDSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Alarm Owner ID Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:alarm-light"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        try:
            self._state = self.hass.data[DOMAIN]["alarmownerid"]
        except:
            self._state = ""


class AlarmStatusSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Alarm Status Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:alarm-light"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        try:
            self._state = self.hass.data[DOMAIN]["alarmstatus"]
        except:
            self._state = ""


class AlarmLastEventSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Alarm Last Event Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:alarm-light"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        try:
            self._state = self.hass.data[DOMAIN]["alarmlasteventtype"]
        except:
            self._state = ""


class AverageHumiditySensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Average Humidity Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:water-percent"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        group_entity_id = "group.humidity_sensors_group"

        # Ensure the group exists
        group_state = self.hass.states.get(group_entity_id)
        if not group_state:
            _LOGGER.debug(f"Group {group_entity_id} not found.")
            return

        # Get all entities in the group
        group_entities = group_state.attributes.get("entity_id", [])

        # Get all entities in the group
        group_entities = group_state.attributes.get("entity_id", [])

        numeric_values = []
        for entity_id in group_entities:
            entity_state = self.hass.states.get(entity_id)
            if entity_state:
                current_state = entity_state.state
                try:
                    # Attempt to convert the state to a float
                    numeric_value = float(current_state)
                    numeric_values.append(numeric_value)
                    _LOGGER.debug(
                        f"Entity {entity_id} has a numeric state of {numeric_value}"
                    )
                except ValueError:
                    # Non-numeric state, skip
                    _LOGGER.debug(
                        f"Entity {entity_id} state '{current_state}' is not numeric."
                    )
            else:
                self.hass.logger.warning(f"Entity {entity_id} has no state available.")

        # Calculate the average if we have numeric values
        if numeric_values:
            average_value = sum(numeric_values) / len(numeric_values)
            self._state = round(average_value, 1)
            _LOGGER.debug(
                f"Average numeric state for group {group_entity_id}: {average_value}"
            )
        else:
            _LOGGER.debug(
                f"No numeric values found for entities in group {group_entity_id}."
            )
            self._state = -1


class AverageTemperatureSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "Average Temperature Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:thermometer"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        group_entity_id = "group.temperature_sensors_group"

        # Ensure the group exists
        group_state = self.hass.states.get(group_entity_id)
        if not group_state:
            _LOGGER.debug(f"Group {group_entity_id} not found.")
            return

        # Get all entities in the group
        group_entities = group_state.attributes.get("entity_id", [])

        numeric_values = []
        for entity_id in group_entities:
            entity_state = self.hass.states.get(entity_id)
            if entity_state:
                current_state = entity_state.state
                try:
                    # Attempt to convert the state to a float
                    numeric_value = float(current_state)
                    numeric_values.append(numeric_value)
                    _LOGGER.debug(
                        f"Entity {entity_id} has a numeric state of {numeric_value}"
                    )
                except ValueError:
                    # Non-numeric state, skip
                    _LOGGER.debug(
                        f"Entity {entity_id} state '{current_state}' is not numeric."
                    )
            else:
                self.hass.logger.warning(f"Entity {entity_id} has no state available.")

        # Calculate the average if we have numeric values
        if numeric_values:
            average_value = sum(numeric_values) / len(numeric_values)
            self._state = round(average_value, 1)
            _LOGGER.debug(
                f"Average numeric state for group {group_entity_id}: {average_value}"
            )
        else:
            _LOGGER.debug(
                f"No numeric values found for entities in group {group_entity_id}."
            )
            self._state = -1


class VirtualIlluminanceSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = 1000

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "VirtualIlluminanceSensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:brightness-7"

    @property
    def device_class(self) -> str:
        """Return the device_class of the sensor."""
        return SensorDeviceClass.ILLUMINANCE

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """

        _LOGGER.debug("In virtual illuminance sensor update")

        self._state = 200

        sun_state = self.hass.states.get("sun.sun")
        if not sun_state:
            self._state = 1000
            _LOGGER.debug("In virtual illuminance sensor update. sun_state is None.")
            return  # Exit if sun entity isn't available

        if sun_state.state == "below_horizon":
            self._state = 100
            return

        sunrise_time = get_astral_event_date(self.hass, SUN_EVENT_SUNRISE)

        if not sunrise_time:
            self._state = 1000
            _LOGGER.debug("In virtual illuminance sensor update. sunrise time is None.")
            return  # Exit if sunrise time isn't available

        sunset_time = get_astral_event_date(self.hass, SUN_EVENT_SUNSET)

        if not sunset_time:
            self._state = 1000
            _LOGGER.debug("In virtual illuminance sensor update. sunset time is None.")
            return  # Exit if sunrise time isn't available

        # Convert sunrise/set times to datetime and calculate the time difference

        time_since_sunrise = dt_util.now() - sunrise_time
        secondssincesunrise = time_since_sunrise.total_seconds()

        time_until_sunset = sunset_time - dt_util.now()
        secondsuntilsunset = time_until_sunset.total_seconds()

        _LOGGER.debug(
            f"In virtual illuminance sensor seconds since sunrise: {secondssincesunrise}."
        )
        _LOGGER.debug(
            f"In virtual illuminance sensor seconds until sunset: {secondsuntilsunset}."
        )

        # are we closer to sunrise or sunset?
        if secondssincesunrise < secondsuntilsunset:
            if secondssincesunrise <= 500:
                self._state = 200
            elif secondssincesunrise <= 1000:
                self._state = 400
            elif secondssincesunrise <= 1500:
                self._state = 600
            elif secondssincesunrise <= 2000:
                self._state = 800
            else:
                self._state = 1000
        elif secondsuntilsunset <= 500:
            self._state = 200
        elif secondsuntilsunset <= 1000:
            self._state = 400
        elif secondsuntilsunset <= 1500:
            self._state = 600
        elif secondsuntilsunset <= 2000:
            self._state = 800
        else:
            self._state = 1000


class HighTemperatureTomorrowSensor(SensorEntity):
    """Representation of a sensor."""

    def __init__(self) -> None:
        """Initialize the sensor."""
        self._state = ""

    @property
    def unique_id(self) -> str:
        """Return the unique ID of the sensor."""
        return self.name

    @property
    def name(self) -> str:
        """Return the name of the sensor."""
        return "High Temperature Tomorrow Sensor"

    @property
    def icon(self) -> str:
        """Return the icon of the sensor."""
        return "mdi:thermometer"

    @property
    def state(self):
        """Return the state of the sensor."""
        return self._state

    def update(self) -> None:
        """Fetch new state data for the sensor.

        This is the only method that should fetch new data for Home Assistant.
        """
        _LOGGER.debug("In high temp tomorrow forecast")

        forecasts = self.hass.services.call(
            "weather",
            "get_forecasts",
            {"type": "daily", "entity_id": "weather.forecast_home"},
            blocking=True,
            return_response=True,
        )

        _LOGGER.debug(f"In high temp tomorrow forecasts: {forecasts}")

        forecast = forecasts.get("weather.forecast_home").get("forecast")

        _LOGGER.debug(f"In high temp tomorrow forecast: { forecast }")

        if len(forecast) > 0:
            self._state = forecast[1]["temperature"]


class OasiraConfigSensor(SensorEntity):
    def __init__(self, key, state):
        self._key = key
        self._state = state

    @property
    def name(self):
        return f"Config {self._key}"

    @property
    def state(self):
        return self._state

    @property
    def unique_id(self):
        return f"oasira_config_sensor_{self._key.lower()}"

    @property
    def device_class(self):
        return None

    @property
    def should_poll(self):
        return False
