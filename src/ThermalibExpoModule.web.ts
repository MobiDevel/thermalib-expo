import { registerWebModule, NativeModule } from "expo";

import { ThermalibExpoModuleEvents } from "./ThermalibExpo.types";

class ThermalibExpoModule extends NativeModule<ThermalibExpoModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit("onChange", { value });
  }
  hello() {
    return "Hello world! 👋";
  }
}

export default registerWebModule(ThermalibExpoModule);
