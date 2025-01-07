/* eslint-disable no-unused-vars */
export enum Unit {
  FAHRENHEIT = 'FAHRENHEIT',
  CELSIUS = 'CELSIUS',
  RELATIVE_HUMIDITY = 'RELATIVE_HUMIDITY',
  UNKNOWN = 'UNKNOWN',
  PH = 'PH',
}

// Additional properties for description and unit strings
export const UnitProperties: Record<
  Unit,
  {description: string; unitString: string}
> = {
  [Unit.FAHRENHEIT]: {description: 'Fahrenheit', unitString: '°F'},
  [Unit.CELSIUS]: {description: 'Celsius', unitString: '°C'},
  [Unit.RELATIVE_HUMIDITY]: {
    description: 'Relative Humidity',
    unitString: '%rh',
  },
  [Unit.UNKNOWN]: {description: 'Unknown', unitString: '(Unknown unit)'},
  [Unit.PH]: {description: 'Acidity', unitString: 'pH'},
};
