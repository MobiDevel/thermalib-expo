import { NativeModule, requireNativeModule } from "expo";

import { Device, ThermalibExpoModuleEvents } from "./types";

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  setValueAsync(value: string): Promise<void>;
  devices(): Device[] | null;
  startScanning(): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>("ThermalibExpo");
