export enum Unit {
  FAHRENHEIT = "FAHRENHEIT",
  CELSIUS = "CELSIUS",
  RELATIVE_HUMIDITY = "RELATIVE_HUMIDITY",
  UNKNOWN = "UNKNOWN",
  PH = "PH",
}

// Additional properties for description and unit strings
export const UnitProperties: Record<
  Unit,
  { description: string; unitString: string }
> = {
  [Unit.FAHRENHEIT]: { description: "Fahrenheit", unitString: "°F" },
  [Unit.CELSIUS]: { description: "Celsius", unitString: "°C" },
  [Unit.RELATIVE_HUMIDITY]: {
    description: "Relative Humidity",
    unitString: "%rh",
  },
  [Unit.UNKNOWN]: { description: "Unknown", unitString: "(Unknown unit)" },
  [Unit.PH]: { description: "Acidity", unitString: "pH" },
};

// Utility functions to mimic Java methods
export namespace UnitUtils {
  /**
   * Get the description for a given Unit.
   */
  export function getDesc(unit: Unit): string {
    return UnitProperties[unit].description;
  }

  /**
   * Get the unit string for a given Unit.
   */
  export function getUnitString(unit: Unit): string {
    return UnitProperties[unit].unitString;
  }
}
