// Reexport the native module. On web, it will be resolved to ThermalibExpoModule.web.ts
// and on native platforms to ThermalibExpoModule.ts
export { default } from './ThermalibExpoModule';
export { default as ThermalibExpoView } from './ThermalibExpoView';
export * from  './ThermalibExpo.types';
