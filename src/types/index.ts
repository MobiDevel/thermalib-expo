export type {Device} from './Device';
export type OnLoadEventPayload = {
  url: string;
};

export type ThermalibExpoModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = {
  value: string;
};

export const RSSI_UNAVAIL = Number.MIN_SAFE_INTEGER; // Integer.MIN_VALUE equivalent in JS

export type Feature = {
  AUTO_OFF: 1;
  POLLED_DEVICE: 2;
  EMISSIVITY: 4;
  DISPLAY: 8;
  ASYNCHRONOUS_SETTINGS: 16;
  ALARM: 32;
  SETTABLE_ALARMS: 64;
  MAX_READING: 128;
  MIN_READING: 256;
};

export type NotificationType = {
  NONE: 0;
  BUTTON_PRESSED: 1;
  SHUTDOWN: 2;
  INVALID_SETTING: 3;
  INVALID_COMMAND: 4;
  COMMUNICATION_ERROR: 5;
  UNKNOWN: 6;
  CHECKPOINT: 7;
  REQUEST_REFRESH: 8;
  toString(type: number): string;
};

export type CommandType = {
  NONE: -1;
  MEASURE: 0;
  IDENTIFY: 1;
  SET_DEFAULTS: 2;
  FACTORY_RESET: 3;
};

export enum ConnectionState {
  UNKNOWN = 'Unknown',
  UNAVAILABLE = 'Unavailable',
  AVAILABLE = 'Available',
  DISCONNECTED = 'Disconnected',
  DISCONNECTING = 'Disconnecting',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  UNSUPPORTED = 'Unsupported',
  UNREGISTERED = 'Unregistered',
}

export enum BatteryWarningLevel {
  CRITICAL,
  LOW,
  HALF,
  FULL,
}

export type DateStamp = {
  year: number;
  month: number;
  day: number;
  toString(): string;
  compareTo(date: DateStamp): number;
};
