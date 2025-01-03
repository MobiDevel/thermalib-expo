import { NativeModule, requireNativeModule } from "expo";

import { Device, ThermalibExpoModuleEvents } from "./types";

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  /**
   * Get the current list of devices.
   */
  devices(): Device[] | null;
  /**
   * Start scanning for devices. After this is called, devices can be fetched.
   */
  startScanning(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>("ThermalibExpo");
