/* eslint-disable @typescript-eslint/no-wrapper-object-types */
import {NativeModule, requireNativeModule} from 'expo';

import {Device, ThermalibExpoModuleEvents} from './types';

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  /**
   * Get the current list of devices.
   */
  devices(): Device[] | null;
  /**
   * Start scanning for devices. After this is called, devices can be fetched.
   */
  startScanning(): Promise<void>;
  /**
   * Connect to the device with the given ID.
   * @param deviceId ID of the device {@link Device.identifier}
   */
  readDevice(deviceId: string): Object;
  /**
   * Read temperature for given device.
   *
   * Assumes that the device is connected.
   * @param deviceId ID of the device {@link Device.identifier}
   */
  readTemperature(deviceId: string): Promise<Object>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>('ThermalibExpo');
