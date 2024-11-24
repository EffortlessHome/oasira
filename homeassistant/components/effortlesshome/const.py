"""Store constants."""

import datetime

import voluptuous as vol
from homeassistant.components.alarm_control_panel import AlarmControlPanelEntityFeature
from homeassistant.const import (
    ATTR_ENTITY_ID,
    ATTR_NAME,
    CONF_CODE,
    CONF_MODE,
    STATE_ALARM_ARMED_AWAY,
    STATE_ALARM_ARMED_CUSTOM_BYPASS,
    STATE_ALARM_ARMED_HOME,
    STATE_ALARM_ARMED_NIGHT,
    STATE_ALARM_ARMED_VACATION,
    STATE_ALARM_ARMING,
    STATE_ALARM_DISARMED,
    STATE_ALARM_PENDING,
    STATE_ALARM_TRIGGERED,
)
from homeassistant.helpers import config_validation as cv

import logging

_LOGGER: logging.Logger = logging.getLogger(__package__)

from homeassistant.components.binary_sensor import (
    DOMAIN as BINARY_SENSOR_DOMAIN,
)
from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
)
from homeassistant.components.light import DOMAIN as LIGHT_DOMAIN
from homeassistant.components.sensor.const import DOMAIN as SENSOR_DOMAIN
from homeassistant.components.group.const import DOMAIN as GROUP_DOMAIN
from homeassistant.components.switch.const import DOMAIN as SWITCH_DOMAIN
from homeassistant.components.cover import DOMAIN as COVER_DOMAIN
from homeassistant.const import STATE_HOME, STATE_ON, STATE_PLAYING
from dataclasses import dataclass

VERSION = "1.4.1"
NAME = "effortlesshome"
MANUFACTURER = "@effortlesshome"

DOMAIN = "effortlesshome"

EH_INITIALIZE_API = "https://initialize.effortlesshome.co/"
EH_SECURITY_API = "https://securityapi.effortlesshome.co/"

# Configuration and options
CONF_ENABLED = "enabled"
CONF_USERNAME = "username"
PLATFORMS = []
CONF_SYSTEMID = "systemid"

CUSTOM_COMPONENTS = "custom_components"
INTEGRATION_FOLDER = DOMAIN
PANEL_FOLDER = "frontend"
PANEL_FILENAME = "dist/alarm-panel.js"

PANEL_URL = "/api/panel_custom/effortlesshome"
PANEL_TITLE = "EffortlessHome"
PANEL_ICON = "mdi:alpha-e-box-outline"
PANEL_NAME = "alarm-panel"

INITIALIZATION_TIME = datetime.timedelta(seconds=60)
SENSOR_ARM_TIME = datetime.timedelta(seconds=5)

STATES = [
    STATE_ALARM_ARMED_AWAY,
    STATE_ALARM_ARMED_HOME,
    STATE_ALARM_ARMED_NIGHT,
    STATE_ALARM_ARMED_CUSTOM_BYPASS,
    STATE_ALARM_ARMED_VACATION,
    STATE_ALARM_DISARMED,
    STATE_ALARM_TRIGGERED,
    STATE_ALARM_PENDING,
    STATE_ALARM_ARMING,
]

ARM_MODES = [
    STATE_ALARM_ARMED_AWAY,
    STATE_ALARM_ARMED_HOME,
    STATE_ALARM_ARMED_NIGHT,
    STATE_ALARM_ARMED_CUSTOM_BYPASS,
    STATE_ALARM_ARMED_VACATION,
]

ARM_MODE_TO_STATE = {
    "away": STATE_ALARM_ARMED_AWAY,
    "home": STATE_ALARM_ARMED_HOME,
    "night": STATE_ALARM_ARMED_NIGHT,
    "custom": STATE_ALARM_ARMED_CUSTOM_BYPASS,
    "vacation": STATE_ALARM_ARMED_VACATION,
}

STATE_TO_ARM_MODE = {
    STATE_ALARM_ARMED_AWAY: "away",
    STATE_ALARM_ARMED_HOME: "home",
    STATE_ALARM_ARMED_NIGHT: "night",
    STATE_ALARM_ARMED_CUSTOM_BYPASS: "custom",
    STATE_ALARM_ARMED_VACATION: "vacation",
}

COMMAND_ARM_NIGHT = "arm_night"
COMMAND_ARM_AWAY = "arm_away"
COMMAND_ARM_HOME = "arm_home"
COMMAND_ARM_CUSTOM_BYPASS = "arm_custom_bypass"
COMMAND_ARM_VACATION = "arm_vacation"
COMMAND_DISARM = "disarm"

COMMANDS = [
    COMMAND_DISARM,
    COMMAND_ARM_AWAY,
    COMMAND_ARM_NIGHT,
    COMMAND_ARM_HOME,
    COMMAND_ARM_CUSTOM_BYPASS,
    COMMAND_ARM_VACATION,
]

EVENT_DISARM = "disarm"
EVENT_LEAVE = "leave"
EVENT_ARM = "arm"
EVENT_ENTRY = "entry"
EVENT_TRIGGER = "trigger"
EVENT_FAILED_TO_ARM = "failed_to_arm"
EVENT_COMMAND_NOT_ALLOWED = "command_not_allowed"
EVENT_INVALID_CODE_PROVIDED = "invalid_code_provided"
EVENT_NO_CODE_PROVIDED = "no_code_provided"
EVENT_TRIGGER_TIME_EXPIRED = "trigger_time_expired"
EVENT_READY_TO_ARM_MODES_CHANGED = "ready_to_arm_modes_changed"

ATTR_MODES = "modes"
ATTR_ARM_MODE = "arm_mode"
ATTR_CODE_DISARM_REQUIRED = "code_disarm_required"
ATTR_CODE_MODE_CHANGE_REQUIRED = "code_mode_change_required"
ATTR_REMOVE = "remove"
ATTR_OLD_CODE = "old_code"

ATTR_TRIGGER_TIME = "trigger_time"
ATTR_EXIT_TIME = "exit_time"
ATTR_ENTRY_TIME = "entry_time"

ATTR_ENABLED = "enabled"
ATTR_USER_ID = "user_id"

ATTR_CAN_ARM = "can_arm"
ATTR_CAN_DISARM = "can_disarm"
ATTR_DISARM_AFTER_TRIGGER = "disarm_after_trigger"

ATTR_REMOVE = "remove"
ATTR_IS_OVERRIDE_CODE = "is_override_code"
ATTR_AREA_LIMIT = "area_limit"
ATTR_CODE_FORMAT = "code_format"
ATTR_CODE_LENGTH = "code_length"

ATTR_AUTOMATION_ID = "automation_id"

ATTR_TYPE = "type"
ATTR_AREA = "area"
ATTR_MASTER = "master"

ATTR_TRIGGERS = "triggers"
ATTR_ACTIONS = "actions"
ATTR_EVENT = "event"
ATTR_REQUIRE_CODE = "require_code"

ATTR_NOTIFICATION = "notification"
ATTR_VERSION = "version"
ATTR_STATE_PAYLOAD = "state_payload"
ATTR_COMMAND_PAYLOAD = "command_payload"

ATTR_FORCE = "force"
ATTR_SKIP_DELAY = "skip_delay"
ATTR_CONTEXT_ID = "context_id"

PUSH_EVENT = "mobile_app_notification_action"

EVENT_ACTION_FORCE_ARM = "effortlesshome_FORCE_ARM"
EVENT_ACTION_RETRY_ARM = "effortlesshome_RETRY_ARM"
EVENT_ACTION_DISARM = "effortlesshome_DISARM"
EVENT_ACTION_ARM_AWAY = "effortlesshome_ARM_AWAY"
EVENT_ACTION_ARM_HOME = "effortlesshome_ARM_HOME"
EVENT_ACTION_ARM_NIGHT = "effortlesshome_ARM_NIGHT"
EVENT_ACTION_ARM_VACATION = "effortlesshome_ARM_VACATION"
EVENT_ACTION_ARM_CUSTOM_BYPASS = "effortlesshome_ARM_CUSTOM_BYPASS"

EVENT_ACTIONS = [
    EVENT_ACTION_FORCE_ARM,
    EVENT_ACTION_RETRY_ARM,
    EVENT_ACTION_DISARM,
    EVENT_ACTION_ARM_AWAY,
    EVENT_ACTION_ARM_HOME,
    EVENT_ACTION_ARM_NIGHT,
    EVENT_ACTION_ARM_VACATION,
    EVENT_ACTION_ARM_CUSTOM_BYPASS,
]

MODES_TO_SUPPORTED_FEATURES = {
    STATE_ALARM_ARMED_AWAY: AlarmControlPanelEntityFeature.ARM_AWAY,
    STATE_ALARM_ARMED_HOME: AlarmControlPanelEntityFeature.ARM_HOME,
    STATE_ALARM_ARMED_NIGHT: AlarmControlPanelEntityFeature.ARM_NIGHT,
    STATE_ALARM_ARMED_CUSTOM_BYPASS: AlarmControlPanelEntityFeature.ARM_CUSTOM_BYPASS,
    STATE_ALARM_ARMED_VACATION: AlarmControlPanelEntityFeature.ARM_VACATION,
}

SERVICE_ARM = "arm"
SERVICE_DISARM = "disarm"

SERVICE_ARM_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Optional(CONF_CODE, default=""): cv.string,
        vol.Optional(CONF_MODE, default=STATE_ALARM_ARMED_AWAY): vol.In(
            [
                "away",
                "home",
                "night",
                "custom",
                "vacation",
                STATE_ALARM_ARMED_AWAY,
                STATE_ALARM_ARMED_HOME,
                STATE_ALARM_ARMED_NIGHT,
                STATE_ALARM_ARMED_CUSTOM_BYPASS,
                STATE_ALARM_ARMED_VACATION,
            ]
        ),
        vol.Optional(ATTR_SKIP_DELAY, default=False): cv.boolean,
        vol.Optional(ATTR_FORCE, default=False): cv.boolean,
        vol.Optional(ATTR_CONTEXT_ID): int,
    }
)

SERVICE_DISARM_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_ENTITY_ID): cv.entity_id,
        vol.Optional(CONF_CODE, default=""): cv.string,
        vol.Optional(ATTR_CONTEXT_ID): int,
    }
)

SERVICE_ENABLE_USER = "enable_user"
SERVICE_DISABLE_USER = "disable_user"
SERVICE_TOGGLE_USER_SCHEMA = vol.Schema(
    {
        vol.Required(ATTR_NAME, default=""): cv.string,
    }
)


ISSUE_TYPE_YAML_DETECTED = "issue_yaml_detected"
ISSUE_TYPE_INVALID_AREA = "invalid_area_config"
#
PRESENCE_LOCK_SWITCH_PREFIX = "Area Presence Lock "
PRESENCE_LOCK_SWITCH_ENTITY_PREFIX = "switch.area_presence_lock_"

SLEEP_MODE_SWITCH_PREFIX = "Area Sleep Mode "
SLEEP_MODE_SWITCH_ENTITY_PREFIX = "switch.area_sleep_mode_"

PRESENCE_BINARY_SENSOR_PREFIX = "Area Presence "
PRESENCE_BINARY_SENSOR_ENTITY_PREFIX = "binary_sensor.area_presence_"

ILLUMINANCE_SENSOR_PREFIX = "Area Illuminance "
ILLUMINANCE_SENSOR_ENTITY_PREFIX = "sensor.area_illuminance_"

TEMPERATURE_SENSOR_PREFIX = "Area Temperature "
TEMPERATURE_SENSOR_ENTITY_PREFIX = "sensor.area_temperature_"

HUMIDITY_SENSOR_PREFIX = "Area Humidity "
HUMIDITY_SENSOR_ENTITY_PREFIX = "sensor.area_humidity_"

COVER_GROUP_PREFIX = "Area Covers "
COVER_GROUP_ENTITY_PREFIX = "cover.area_covers_"

LIGHT_GROUP_PREFIX = "Area Lights "
LIGHT_GROUP_ENTITY_PREFIX = "light.area_lights_"
#
# Config flow constants
#
CONFIG_AREA = "area"
CONFIG_IS_SLEEPING_AREA = "is_sleeping_area"
CONFIG_EXCLUDED_LIGHT_ENTITIES = "excluded_light_entities"
CONFIG_AUTO_LIGHTS_MAX_ILLUMINANCE = "auto_lights_illuminance_threshold"
CONFIG_HUMIDITY_CALCULATION = "humidity_calculation"
CONFIG_TEMPERATURE_CALCULATION = "temperature_calculation"
CONFIG_ILLUMINANCE_CALCULATION = "illuminance_calculation"


# Fetch entities from these domains:
RELEVANT_DOMAINS = [
    BINARY_SENSOR_DOMAIN,
    SENSOR_DOMAIN,
    SWITCH_DOMAIN,
    LIGHT_DOMAIN,
    COVER_DOMAIN,
]

EXCLUDED_DOMAINS = [
    DOMAIN,
    GROUP_DOMAIN,
]

# Presence entities
PRESENCE_BINARY_SENSOR_DEVICE_CLASSES = (
    BinarySensorDeviceClass.MOTION,
    BinarySensorDeviceClass.OCCUPANCY,
    BinarySensorDeviceClass.PRESENCE,
)

# Presence states
PRESENCE_ON_STATES = [
    STATE_ON,
    STATE_HOME,
    STATE_PLAYING,
]


"""Constants for the Google Translate text-to-speech integration."""

CONF_TLD = "tld"
DEFAULT_LANG = "en"
DEFAULT_TLD = "com"

# INSTRUCTIONS TO UPDATE LIST:
#
# Removal:
# Removal is as simple as deleting the line containing the language code no longer
# supported.
#
# Addition:
# In order to add to this list, follow the below steps:
# 1. Find out if the language is supported: Go to Google Translate website and try
#    translating any word from English into your desired language.
#    If the "speech" icon is grayed out or no speech is generated, the language is
#    not supported and cannot be added. Otherwise, proceed:
# 2. Grab the language code from https://cloud.google.com/translate/docs/languages
# 3. Add the language code in SUPPORT_LANGUAGES, making sure to not disturb the
#    alphabetical nature of the list.

SUPPORT_LANGUAGES = [
    "af",
    "am",
    "ar",
    "bg",
    "bn",
    "bs",
    "ca",
    "cs",
    "cy",
    "da",
    "de",
    "el",
    "en",
    "es",
    "et",
    "eu",
    "fi",
    "fil",
    "fr",
    "gl",
    "gu",
    "ha",
    "hi",
    "hr",
    "hu",
    "id",
    "is",
    "it",
    "iw",
    "ja",
    "jw",
    "km",
    "kn",
    "ko",
    "la",
    "lt",
    "lv",
    "ml",
    "mr",
    "ms",
    "my",
    "ne",
    "nl",
    "no",
    "pa",
    "pl",
    "pt",
    "ro",
    "ru",
    "si",
    "sk",
    "sq",
    "sr",
    "su",
    "sv",
    "sw",
    "ta",
    "te",  # codespell:ignore te
    "th",
    "tl",
    "tr",
    "uk",
    "ur",
    "vi",
    # dialects
    "zh-CN",
    "zh-cn",
    "zh-tw",
    "en-us",
    "en-ca",
    "en-uk",
    "en-gb",
    "en-au",
    "en-gh",
    "en-in",
    "en-ie",
    "en-nz",
    "en-ng",
    "en-ph",
    "en-za",
    "en-tz",
    "fr-ca",
    "fr-fr",
    "pt-br",
    "pt-pt",
    "es-es",
    "es-us",
]

SUPPORT_TLD = [
    "com",
    "ad",
    "ae",
    "com.af",
    "com.ag",
    "com.ai",
    "al",
    "am",
    "co.ao",
    "com.ar",
    "as",
    "at",
    "com.au",
    "az",
    "ba",
    "com.bd",
    "be",
    "bf",
    "bg",
    "com.bh",
    "bi",
    "bj",
    "com.bn",
    "com.bo",
    "com.br",
    "bs",
    "bt",
    "co.bw",
    "by",
    "com.bz",
    "ca",
    "cd",
    "cf",
    "cg",
    "ch",
    "ci",
    "co.ck",
    "cl",
    "cm",
    "cn",
    "com.co",
    "co.cr",
    "com.cu",
    "cv",
    "com.cy",
    "cz",
    "de",
    "dj",
    "dk",
    "dm",
    "com.do",
    "dz",
    "com.ec",
    "ee",
    "com.eg",
    "es",
    "com.et",
    "fi",
    "com.fj",
    "fm",
    "fr",
    "ga",
    "ge",
    "gg",
    "com.gh",
    "com.gi",
    "gl",
    "gm",
    "gr",
    "com.gt",
    "gy",
    "com.hk",
    "hn",
    "hr",
    "ht",
    "hu",
    "co.id",
    "ie",
    "co.il",
    "im",
    "co.in",
    "iq",
    "is",
    "it",
    "je",
    "com.jm",
    "jo",
    "co.jp",
    "co.ke",
    "com.kh",
    "ki",
    "kg",
    "co.kr",
    "com.kw",
    "kz",
    "la",
    "com.lb",
    "li",
    "lk",
    "co.ls",
    "lt",
    "lu",
    "lv",
    "com.ly",
    "co.ma",
    "md",
    "me",
    "mg",
    "mk",
    "ml",
    "com.mm",
    "mn",
    "ms",
    "com.mt",
    "mu",
    "mv",
    "mw",
    "com.mx",
    "com.my",
    "co.mz",
    "com.na",
    "com.ng",
    "com.ni",
    "ne",
    "nl",
    "no",
    "com.np",
    "nr",
    "nu",
    "co.nz",
    "com.om",
    "com.pa",
    "com.pe",
    "com.pg",
    "com.ph",
    "com.pk",
    "pl",
    "pn",
    "com.pr",
    "ps",
    "pt",
    "com.py",
    "com.qa",
    "ro",
    "ru",
    "rw",
    "com.sa",
    "com.sb",
    "sc",
    "se",
    "com.sg",
    "sh",
    "si",
    "sk",
    "com.sl",
    "sn",
    "so",
    "sm",
    "sr",
    "st",
    "com.sv",
    "td",
    "tg",
    "co.th",
    "com.tj",
    "tl",
    "tm",
    "tn",
    "to",
    "com.tr",
    "tt",
    "com.tw",
    "co.tz",
    "com.ua",
    "co.ug",
    "co.uk",
    "com.uy",
    "co.uz",
    "com.vc",
    "co.ve",
    "vg",
    "co.vi",
    "com.vn",
    "vu",
    "ws",
    "rs",
    "co.za",
    "co.zm",
    "co.zw",
    "cat",
]


@dataclass
class Dialect:
    """Language and TLD for a dialect supported by Google Translate."""

    lang: str
    tld: str


MAP_LANG_TLD: dict[str, Dialect] = {
    "en-us": Dialect("en", "com"),
    "en-gb": Dialect("en", "co.uk"),
    "en-uk": Dialect("en", "co.uk"),
    "en-au": Dialect("en", "com.au"),
    "en-ca": Dialect("en", "ca"),
    "en-in": Dialect("en", "co.in"),
    "en-ie": Dialect("en", "ie"),
    "en-za": Dialect("en", "co.za"),
    "fr-ca": Dialect("fr", "ca"),
    "fr-fr": Dialect("fr", "fr"),
    "pt-br": Dialect("pt", "com.br"),
    "pt-pt": Dialect("pt", "pt"),
    "es-es": Dialect("es", "es"),
    "es-us": Dialect("es", "com"),
}


"""Constants for the Google Generative AI Conversation integration."""

CONF_PROMPT = "prompt"
CONF_RECOMMENDED = "recommended"
CONF_CHAT_MODEL = "chat_model"
RECOMMENDED_CHAT_MODEL = "models/gemini-1.5-flash-latest"
CONF_TEMPERATURE = "temperature"
RECOMMENDED_TEMPERATURE = 1.0
CONF_TOP_P = "top_p"
RECOMMENDED_TOP_P = 0.95
CONF_TOP_K = "top_k"
RECOMMENDED_TOP_K = 64
CONF_MAX_TOKENS = "max_tokens"
RECOMMENDED_MAX_TOKENS = 150
CONF_HARASSMENT_BLOCK_THRESHOLD = "harassment_block_threshold"
CONF_HATE_BLOCK_THRESHOLD = "hate_block_threshold"
CONF_SEXUAL_BLOCK_THRESHOLD = "sexual_block_threshold"
CONF_DANGEROUS_BLOCK_THRESHOLD = "dangerous_block_threshold"
RECOMMENDED_HARM_BLOCK_THRESHOLD = "BLOCK_MEDIUM_AND_ABOVE"
