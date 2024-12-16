from __future__ import annotations  # noqa: D100, EXE002

from functools import cached_property
import logging

from homeassistant.components.group.light import LightGroup
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .auto_area import AutoArea
from .const import LIGHT_GROUP_ENTITY_PREFIX, LIGHT_GROUP_PREFIX
from .ha_helpers import get_all_entities

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up entities."""
    areas = area_registry.async_get(hass)

    # Initialize a list for all light entity IDs across areas
    all_light_entity_ids = []

    # Loop over each area to find associated light entities
    for area_id, area in areas.areas.items():
        auto_area = AutoArea(hass=hass, areaid=area_id)

        light_entity_ids = [
            entity.entity_id
            for entity in get_all_entities(
                auto_area.entity_registry,
                auto_area.device_registry,
                auto_area.area_id,
                [LIGHT_DOMAIN],
            )
            if (
                not entity.entity_id.startswith("light.area_")
                and not entity.entity_id.startswith("light.all_light")
            )
        ]

        if not light_entity_ids:
            _LOGGER.info(
                "%s: No lights found in area. Not creating light group.",
                auto_area.area_name,
            )
        else:
            async_add_entities(
                [AutoLightGroup(hass, auto_area, entity_ids=light_entity_ids)]
            )
            all_light_entity_ids.extend(light_entity_ids)  # Extend instead of append

    # Add an AllLightGroup with all light entities across areas
    async_add_entities([AllLightGroup(hass, entity_ids=all_light_entity_ids)])


class AutoLightGroup(LightGroup):
    """Cover group with area covers."""

    def __init__(self, hass, auto_area: AutoArea, entity_ids: list[str]) -> None:
        """Initialize cover group."""
        self.hass = hass
        self.auto_area = auto_area
        self._name_prefix = LIGHT_GROUP_PREFIX
        self._prefix = LIGHT_GROUP_ENTITY_PREFIX
        self.entity_ids: list[str] = entity_ids

        LightGroup.__init__(
            self,
            unique_id=self._attr_unique_id,
            name=None,
            entity_ids=self.entity_ids,
            mode=None,
        )
        _LOGGER.info(
            "%s (%s): Initialized light group. Entities: %s",
            self.auto_area.area_name,
            self.device_class,
            self.entity_ids,
        )

    @cached_property
    def name(self):
        """Name of this entity."""
        return f"{self._name_prefix}{self.auto_area.area_name}"

    @cached_property
    def device_info(self) -> DeviceInfo:
        """Information about this device."""
        return self.auto_area.device_info

    @cached_property
    def unique_id(self) -> str | None:
        """Return a unique ID."""
        return f"{self.auto_area.area_id}_light_group"


class AllLightGroup(LightGroup):
    """Cover group with area covers."""

    def __init__(self, hass, entity_ids: list[str]) -> None:
        """Initialize cover group."""
        self.hass = hass
        self.entity_ids: list[str] = entity_ids

        LightGroup.__init__(
            self,
            unique_id=self._attr_unique_id,
            name=None,
            entity_ids=self.entity_ids,
            mode=None,
        )

    @cached_property
    def name(self):
        """Name of this entity."""
        return "all_light_group"

    # @cached_property
    # def device_info(self) -> DeviceInfo:
    #    """Information about this device."""
    #    return self.auto_area.device_info

    @cached_property
    def unique_id(self) -> str | None:
        """Return a unique ID."""
        return "all_light_group"
