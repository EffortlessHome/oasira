export const VERSION = '1.3.9';
export const platform = 'effortlesshome';
export const editConfigService = 'edit_config';
export var EArmModeIcons;
(function (EArmModeIcons) {
    EArmModeIcons["ArmedAway"] = "mdi:lock";
    EArmModeIcons["ArmedHome"] = "mdi:home";
    EArmModeIcons["ArmedNight"] = "mdi:moon-waning-crescent";
    EArmModeIcons["ArmedCustom"] = "mdi:shield";
    EArmModeIcons["ArmedVacation"] = "mdi:airplane";
})(EArmModeIcons || (EArmModeIcons = {}));
export var AlarmStates;
(function (AlarmStates) {
    AlarmStates["STATE_ALARM_DISARMED"] = "disarmed";
    AlarmStates["STATE_ALARM_ARMED_HOME"] = "armed_home";
    AlarmStates["STATE_ALARM_ARMED_AWAY"] = "armed_away";
    AlarmStates["STATE_ALARM_ARMED_NIGHT"] = "armed_night";
    AlarmStates["STATE_ALARM_ARMED_CUSTOM_BYPASS"] = "armed_custom_bypass";
    AlarmStates["STATE_ALARM_ARMED_VACATION"] = "armed_vacation";
    AlarmStates["STATE_ALARM_PENDING"] = "pending";
    AlarmStates["STATE_ALARM_ARMING"] = "arming";
    AlarmStates["STATE_ALARM_DISARMING"] = "disarming";
    AlarmStates["STATE_ALARM_TRIGGERED"] = "triggered";
})(AlarmStates || (AlarmStates = {}));
export var AlarmCommands;
(function (AlarmCommands) {
    AlarmCommands["COMMAND_ALARM_DISARM"] = "disarm";
    AlarmCommands["COMMAND_ALARM_ARM_HOME"] = "arm_home";
    AlarmCommands["COMMAND_ALARM_ARM_AWAY"] = "arm_away";
    AlarmCommands["COMMAND_ALARM_ARM_NIGHT"] = "arm_night";
    AlarmCommands["COMMAND_ALARM_ARM_CUSTOM_BYPASS"] = "arm_custom_bypass";
    AlarmCommands["COMMAND_ALARM_ARM_VACATION"] = "arm_vacation";
})(AlarmCommands || (AlarmCommands = {}));
export var ESensorTypes;
(function (ESensorTypes) {
    ESensorTypes["Door"] = "door";
    ESensorTypes["Window"] = "window";
    ESensorTypes["Motion"] = "motion";
    ESensorTypes["Tamper"] = "tamper";
    ESensorTypes["Environmental"] = "environmental";
    ESensorTypes["Other"] = "other";
})(ESensorTypes || (ESensorTypes = {}));
export var ESensorIcons;
(function (ESensorIcons) {
    ESensorIcons["Door"] = "mdi:door-closed";
    ESensorIcons["Window"] = "mdi:window-closed";
    ESensorIcons["Motion"] = "mdi:motion-sensor-off";
    ESensorIcons["Tamper"] = "mdi:crop-portrait";
    ESensorIcons["Environmental"] = "mdi:fire";
    ESensorIcons["Other"] = "mdi:check-circle";
})(ESensorIcons || (ESensorIcons = {}));
export var ESensorIconsActive;
(function (ESensorIconsActive) {
    ESensorIconsActive["Door"] = "mdi:door-open";
    ESensorIconsActive["Window"] = "mdi:window-open";
    ESensorIconsActive["Motion"] = "mdi:motion-sensor";
    ESensorIconsActive["Tamper"] = "mdi:vibrate";
    ESensorIconsActive["Environmental"] = "mdi:fire-alert";
    ESensorIconsActive["Other"] = "mdi:alert-circle";
})(ESensorIconsActive || (ESensorIconsActive = {}));
export var EAutomationTypes;
(function (EAutomationTypes) {
    EAutomationTypes["Notification"] = "notification";
    EAutomationTypes["Action"] = "action";
})(EAutomationTypes || (EAutomationTypes = {}));
