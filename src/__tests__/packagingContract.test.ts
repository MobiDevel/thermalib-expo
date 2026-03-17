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
    expect(source).toContain('readDevice(deviceId: string): Device | null;');
    expect(source).toContain(
      'readTemperature(deviceId: string): Promise<TemperatureReading>;',
    );
  });
});
