import logging

from homeassistant.components.alarm_control_panel import (
    AlarmControlPanelEntity,
    AlarmControlPanelEntityFeature,
)
from homeassistant.components.alarm_control_panel.const import (
    SUPPORT_ALARM_ARM_AWAY,
    SUPPORT_ALARM_ARM_HOME,
    SUPPORT_ALARM_TRIGGER,
)
from homeassistant.const import (
    STATE_ALARM_ARMED_AWAY,
    STATE_ALARM_ARMED_HOME,
    STATE_ALARM_DISARMED,
    STATE_ALARM_TRIGGERED,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo

from .alarm_common import async_cancelalarm, async_creatependingalarm
from .const import DOMAIN, OASIRA_ALARM_TYPE_SECURITY, VERSION

CONF_HOME_MODE_NAME = "home"
CONF_AWAY_MODE_NAME = "away"
CONF_NIGHT_MODE_NAME = "night"

CONST_ALARM_CONTROL_PANEL_NAME = "Alarm Panel"

_LOGGER = logging.getLogger(__name__)
hass = None


async def async_setup_entry(hass: HomeAssistant, config_entry, async_add_entities):
    """Set up the Oasira alarm control panel."""
    hass = hass
    async_add_entities([OasiraAlarmControlPanel(hass)], True)


class OasiraAlarmControlPanel(AlarmControlPanelEntity):
    """Representation of an Oasira alarm control panel."""

    _attr_supported_features = (
        AlarmControlPanelEntityFeature.ARM_HOME
        | AlarmControlPanelEntityFeature.ARM_AWAY
        | AlarmControlPanelEntityFeature.TRIGGER
    )
    _attr_code_arm_required = False
    _attr_has_entity_name = True
    _attr_name = None

    def __init__(self, hass: HomeAssistant):
        """Initialize the alarm control panel."""
        # self._client = client
        # self._attr_unique_id = f"{client.unique}_CP"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, "OasiraSecurityAlarm")},
            name=f"{DOMAIN} {CONST_ALARM_CONTROL_PANEL_NAME}",
            manufacturer="Oasira",
            model=CONST_ALARM_CONTROL_PANEL_NAME,
            sw_version=VERSION,
        )

        self.hass = hass
        self._state = STATE_ALARM_DISARMED
        self.hass.data[DOMAIN]["alarm_id"] = ""

    # async def async_update(self) -> None:
    #    """Update the state of the device."""
    # print("in alarm async update")

    @property
    def name(self):
        """Return the name of the alarm control panel."""
        return "Oasira Security Alarm"

    @property
    def state(self):
        """Return the state of the alarm control panel."""
        return self._state

    @property
    def supported_features(self):
        """Return the supported features of the alarm control panel."""
        return SUPPORT_ALARM_ARM_HOME | SUPPORT_ALARM_ARM_AWAY | SUPPORT_ALARM_TRIGGER

    @property
    def unique_id(self):
        """Return a unique ID for this entity."""
        return "oasira_alarm_control_panel"

    async def async_alarm_disarm(self, code=None):
        """Send disarm command."""
        self.hass.data[DOMAIN]["alarm_id"] = ""
        self._state = STATE_ALARM_DISARMED
        self.async_write_ha_state()

        await async_cancelalarm(self.hass)

    async def async_alarm_arm_home(self, code=None):
        """Send arm home command."""
        self.hass.data[DOMAIN]["alarm_id"] = ""
        self._state = STATE_ALARM_ARMED_HOME
        self.async_write_ha_state()

    async def async_alarm_arm_away(self, code=None):
        """Send arm away command."""
        self.hass.data[DOMAIN]["alarm_id"] = ""
        self._state = STATE_ALARM_ARMED_AWAY
        self.async_write_ha_state()

    async def async_alarm_trigger(self, code=None):
        """Trigger the alarm."""
        self.hass.data[DOMAIN]["alarm_id"] = ""
        self._state = STATE_ALARM_TRIGGERED
        await async_creatependingalarm(self.hass, OASIRA_ALARM_TYPE_SECURITY, None)
