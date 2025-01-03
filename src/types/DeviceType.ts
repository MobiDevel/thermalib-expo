export enum DeviceType {
  UNKNOWN = "Unknown",
  BT_ONE = "BlueTherm® One",
  Q_BLUE = "ThermaQ® Blue",
  PEN_BLUE = "Thermapen® Blue",
  WIFI_Q = "ThermaQ® WiFi",
  WIFI_TD = "ThermaData® WiFi",
  RT_BLUE = "RayTemp Blue",
  TEMPTEST_BLUE = "TempTest Blue",
  DISHTEMP_BLUE = "DishTemp Blue",
  SIMULATED = "Simulated",
}

// Define a map to store transport and feature values for each DeviceType
const DeviceTypeProperties: Record<
  DeviceType,
  { transport: number; features: number }
> = {
  [DeviceType.UNKNOWN]: { transport: 255, features: 0 },
  [DeviceType.BT_ONE]: { transport: 1, features: 73 },
  [DeviceType.Q_BLUE]: { transport: 1, features: 105 },
  [DeviceType.PEN_BLUE]: { transport: 1, features: 65 },
  [DeviceType.WIFI_Q]: { transport: 2, features: 506 },
  [DeviceType.WIFI_TD]: { transport: 2, features: 506 },
  [DeviceType.RT_BLUE]: { transport: 1, features: 77 },
  [DeviceType.TEMPTEST_BLUE]: { transport: 1, features: 73 },
  [DeviceType.DISHTEMP_BLUE]: { transport: 1, features: 136 },
  [DeviceType.SIMULATED]: { transport: 128, features: 0 },
};

// Add utility functions to mimic Java's methods
export namespace DeviceTypeUtils {
  /**
   * Get the transport value for a given DeviceType.
   */
  export function getTransport(type: DeviceType): number {
    return DeviceTypeProperties[type].transport;
  }

  /**
   * Get the features value for a given DeviceType.
   */
  export function getFeatures(type: DeviceType): number {
    return DeviceTypeProperties[type].features;
  }

  /**
   * Get the string representation for a given DeviceType.
   */
  export function toString(type: DeviceType): string {
    return type; // Since the enum values are already strings.
  }
}
