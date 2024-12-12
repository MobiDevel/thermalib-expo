import { NativeModule, requireNativeModule } from "expo";

import { ThermalibExpoModuleEvents, ThermDevice } from "./ThermalibExpo.types";

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  setValueAsync(value: string): Promise<void>;
  getDevices(): Promise<ThermDevice[]>;
  startScanning(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>("ThermalibExpo");
