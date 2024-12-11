import type { StyleProp, ViewStyle } from "react-native";

export type OnLoadEventPayload = {
  url: string;
};

export type ThermalibExpoModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export type ThermNotificationType = {
  NONE: 0;
  BUTTON_PRESSED: 1;
  SHUTDOWN: 2;
  INVALID_SETTING: 3;
  INVALID_COMMAND: 4;
  COMMUNICATION_ERROR: 5;
  UNKNOWN: 6;
  CHECKPOINT: 7;
  REQUEST_REFRESH: 8;
};

export type ThermConnectionStatus = {
  UNKNOWN: "Unknown";
  AVAILABLE: "Available";
  CONNECTING: "Connecting";
  CONNECTED: "Connected";
  DISCONNECTING: "Disconnecting";
  DISCONNECTED: "Disconnected";
  UNAVAILABLE: "Unavailable";
  UNSUPPORTED: "Unsupported";
  UNREGISTERED: "Unregistered";
};

export type ThermUnit = {
  FAHRENHEIT: "°F";
  CELSIUS: "°C";
  PH: "pH";
  RELATIVEHUMIDITY: "%rh";
  UNKNOWN: "Unknown";
};

export type ThermBlueToothErrorCode = {
  UNAVAILABLE: 1;
  DISABLED: 2;
  LE_DISABLED: 3;
};

export type ThermDevice = {
  id: string;
  name?: string;
  UUID?: string;
};
