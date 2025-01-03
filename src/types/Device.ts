import {DeviceType} from './DeviceType';
import {GenericType} from './GenericType';
import {Sensor} from './Sensor';
import {Unit} from './Unit';

export type Device = {
  RSSI_UNAVAIL: number; // Integer.MIN_VALUE equivalent

  transportType: number;

  manufacturerName: string | null;

  serialNumber: string | null;

  modelNumber: string | null;

  protocolVersion: string;

  hardwareRevision: string;

  softwareRevision: string;

  firmwareRevision: string | null;

  deviceName: string;

  setDeviceName(name: string): void;

  /**
   * @deprecated
   */
  deviceAddress: string;

  identifier: string;

  connectionState: string;

  batteryWarningLevel: string;

  isConnected: boolean;

  isReady: boolean;

  deviceType: DeviceType;

  maxSensorCount: number;

  sensors: Sensor[];

  sensor(index: number): Sensor;

  batteryLevel: number;

  updateRssi: void;

  rssi: number;

  emissivity: number;

  setEmissivity(emissivity: number): void;

  /**
   * @deprecated
   */
  unit: Unit; // Deprecated

  /**
   * @deprecated
   */
  setUnit(unit: Unit): void; // Deprecated

  temperatureDisplayUnit: Unit;

  setTemperatureDisplayUnit(unit: Unit): void;

  displayedUnitForGenericSensorType(genericType: GenericType): Unit;

  setDisplayedUnitForGenericSensorType(
    genericType: GenericType,
    unit: Unit,
  ): void;

  measurementInterval: number;

  setMeasurementInterval(interval: number): void;

  transmissionInterval: number;

  setTransmissionInterval(interval: number): void;

  autoOffInterval: number;

  setAutoOffInterval(interval: number): void;

  isSensorEnabled(index: number): boolean;

  sendCommand(command: number, data: Uint8Array): void;

  isSupportedCommand(command: number): boolean;

  requestConnection(retryCount?: number): void;

  requestDisconnection: void;

  description: string;

  refresh: void;

  /**
   * @deprecated
   */
  inCurrentUnits(value: number): number; // Deprecated

  /**
   * @deprecated
   */
  highAutoScaleValue: number; // Deprecated

  /**
   * @deprecated
   */
  lowAutoScaleValue: number; // Deprecated

  remoteSettings: void;

  nextTransmissionTime: number;

  lastTransmissionTime: number;

  lastSettingsUpdateTime: number;

  setPollInterval(interval: number): void;

  pollInterval: number;

  features: number;

  hasFeature(feature: number): boolean;

  alarmSettingsAreLimits: boolean;

  setAlarmSettingsAreLimits(value: boolean): void;
};
