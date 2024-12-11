import { NativeModule, requireNativeModule } from "expo";

import { ThermalibExpoModuleEvents } from "./ThermalibExpo.types";

declare class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  checkBluetooth(): Promise<boolean>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ThermalibExpoModule>("ThermalibExpo");
