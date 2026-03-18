import fs from 'fs';
import path from 'path';

describe('public packaging contract', () => {
  it('uses explicit file paths for type re-exports', () => {
    const indexPath = path.join(__dirname, '..', 'index.ts');
    const source = fs.readFileSync(indexPath, 'utf8');

    expect(source).toContain("export * from './types/index';");
    expect(source).not.toContain("export * from './types';");
  });

  it('declares the runtime methods used by the app', () => {
    const modulePath = path.join(__dirname, '..', 'ThermalibExpoModule.ts');
    const source = fs.readFileSync(modulePath, 'utf8');

    expect(source).toContain('initThermaLib(): void;');
    expect(source).toContain('connectDevice(deviceId: string): Promise<void>;');
    expect(source).toContain('devices(): DeviceInfo[] | null;');
    expect(source).toContain(
      'readDevice(deviceId: string): DeviceInfo | null;',
    );
    expect(source).toContain(
      'readTemperature(deviceId: string): Promise<TemperatureReading>;',
    );
  });

  it('defines a DTO for serialized device payloads', () => {
    const devicePath = path.join(__dirname, '..', 'types', 'Device.ts');
    const source = fs.readFileSync(devicePath, 'utf8');

    expect(source).toContain('export type DeviceInfo = {');
    expect(source).toContain('identifier: string;');
    expect(source).toContain('deviceName: string;');
    expect(source).toContain('batteryLevel: number;');
  });
});
