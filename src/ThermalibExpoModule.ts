/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import {NativeModule, requireNativeModule} from 'expo';

import {
  DeviceInfo,
  TemperatureReading,
  ThermalibExpoModuleEvents,
} from './types/index';

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  /**
   * Initialize the ThermaLib runtime.
   */
  initThermaLib(): void;
  /**
   * Get the current list of devices.
   */
  devices(): DeviceInfo[] | null;
  /**
   * Start scanning for devices. After this is called, devices can be fetched.
   */
  startScanning(): Promise<void>;
  /**
   * Connect to the device with the given ID.
   * @param deviceId ID of the device {@link Device.identifier}
   */
  connectDevice(deviceId: string): Promise<void>;
  /**
   * Return the device with the given ID, if found.
   * @param deviceId ID of the device {@link Device.identifier}
   */
  readDevice(deviceId: string): DeviceInfo | null;
  /**
   * Read temperature for given device.
   *
   * Assumes that the device is connected.
   * @param deviceId ID of the device {@link Device.identifier}
   */
  readTemperature(deviceId: string): Promise<TemperatureReading>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>('ThermalibExpo');
