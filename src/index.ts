// Reexport the native module. On web, it will be resolved to ThermalibExpoModule.web.ts
// and on native platforms to ThermalibExpoModule.ts
import mod from "./ThermalibExpoModule";
export { mod as thermalib };
export * from "./types";
export * from "./requestBluetoothPermission";

export default mod;
