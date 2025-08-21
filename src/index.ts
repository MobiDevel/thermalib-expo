// Reexport the native module. On web, it will be resolved to ExpoNativeConfigurationModule.web.ts
// and on native platforms to ThermalibExpoModule.ts
export * from './types';
export * from './requestBluetoothPermission';

export {default} from './ThermalibExpoModule';
