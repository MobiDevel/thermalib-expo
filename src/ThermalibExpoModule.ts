import { NativeModule, requireNativeModule } from "expo";

import { ThermalibExpoModuleEvents, ThermDevice } from "./ThermalibExpo.types";

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  checkBluetooth(): void;
  getDevices(): ThermDevice[];
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>("ThermalibExpo");
