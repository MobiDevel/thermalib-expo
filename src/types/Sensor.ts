import { Unit } from "./Unit";
import { DateStamp } from ".";
import { Device } from "./Device";
import { GenericType } from "./GenericType";

export interface Sensor {
  readonly NO_VALUE: number;
  getDevice(): Device;
  getName(): string;
  setName(name: string): boolean;
  setTrimValue(value: number): void;
  setTrimSetDate(dateStamp: DateStamp): void;
  getReading(): number;
  getMaxReading(): number;
  getMinReading(): number;
  resetMaxReading(): void;
  resetMinReading(): void;
  getHighAlarm(): number;
  setHighAlarm(value: number): void;
  getLowAlarm(): number;
  setLowAlarm(value: number): void;
  getTrimValue(): number;
  getTrimSetDate(dateStamp: DateStamp): void;
  getType(): Sensor.Type;
  getIndex(): number;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
  getLimitTrimUnit(): Sensor.LimitTrimUnit;
  getState(): Sensor.State;
  isFault(): boolean;
  isHighAlarmEnabled(): boolean;
  isLowAlarmEnabled(): boolean;
  disableHighAlarm(): void;
  disableLowAlarm(): void;
  isHighAlarmBreached(): boolean;
  isLowAlarmBreached(): boolean;
  isHighAlarmSignalled(): boolean;
  isLowAlarmSignalled(): boolean;
  getRange(): Sensor.Range;
  getReadingUnit(): Unit;
  getDisplayUnit(): Unit;
  getReadingTimestamp(): number;
  inCurrentUnits(value: number): number;
  getReadingAsDisplayed(): string;
  getGenericType(): GenericType;
}

export namespace Sensor {
  export const NO_VALUE = -9999.0;

  export class Range {
    constructor(
      public low: number,
      public high: number
    ) {}

    rangeInUnits(unit: Unit): Range {
      // Replace `w.a` with the actual conversion logic
      const convert = (value: number, unit: Unit): number => {
        // Example placeholder logic for conversion
        return value; // Replace with actual conversion logic
      };
      return new Range(
        Math.ceil(convert(this.low, unit)),
        Math.floor(convert(this.high, unit))
      );
    }
  }

  export enum Type {
    INPUT_TYPE_UNKNOWN = "INPUT_TYPE_UNKNOWN",
    INPUT_TYPE_K_THERMOCOUPLE = "INPUT_TYPE_K_THERMOCOUPLE",
    INPUT_TYPE_K_THERMOCOUPLE_FIXED = "INPUT_TYPE_K_THERMOCOUPLE_FIXED",
    INPUT_TYPE_INFRARED_TYPE_1 = "INPUT_TYPE_INFRARED_TYPE_1",
    INPUT_TYPE_SIMULATED = "INPUT_TYPE_SIMULATED",
    INPUT_TYPE_INTERNAL_THERMISTOR = "INPUT_TYPE_INTERNAL_THERMISTOR",
    INPUT_TYPE_EXTERNAL_THERMISTOR = "INPUT_TYPE_EXTERNAL_THERMISTOR",
    INPUT_TYPE_T_THERMOCOUPLE = "INPUT_TYPE_T_THERMOCOUPLE",
    INPUT_TYPE_HUMIDITY_TEMPERATURE = "INPUT_TYPE_HUMIDITY_TEMPERATURE",
    INPUT_TYPE_HUMIDITY = "INPUT_TYPE_HUMIDITY",
    INPUT_TYPE_EXTERNAL_THERMISTOR_CONNECTOR = "INPUT_TYPE_EXTERNAL_THERMISTOR_CONNECTOR",
    INPUT_TYPE_DISHTEMP_BLUE = "INPUT_TYPE_DISHTEMP_BLUE",
  }

  export const TypeProperties: Record<
    Type,
    { description: string; range: Range; genericType: GenericType }
  > = {
    [Type.INPUT_TYPE_UNKNOWN]: {
      description: "(Unknown type)",
      range: new Range(-273.0, 500.0),
      genericType: GenericType.UNKNOWN,
    },
    [Type.INPUT_TYPE_K_THERMOCOUPLE]: {
      description: "Detachable type-K Thermocouple",
      range: new Range(-200.0, 1372.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_K_THERMOCOUPLE_FIXED]: {
      description: "Fixed type-K Thermocouple",
      range: new Range(-50.0, 300.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_INFRARED_TYPE_1]: {
      description: "Infrared (Type 1)",
      range: new Range(-50.0, 350.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_SIMULATED]: {
      description: "Simulated",
      range: new Range(-200.0, 1372.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_INTERNAL_THERMISTOR]: {
      description: "Internal Thermistor",
      range: new Range(0.0, 50.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_EXTERNAL_THERMISTOR]: {
      description: "External Thermistor",
      range: new Range(-40.0, 125.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_T_THERMOCOUPLE]: {
      description: "T Thermocouple",
      range: new Range(-100.0, 400.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_HUMIDITY_TEMPERATURE]: {
      description: "Humidity Temperature",
      range: new Range(-20.0, 85.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_HUMIDITY]: {
      description: "Humidity",
      range: new Range(0.0, 100.0),
      genericType: GenericType.HUMIDITY,
    },
    [Type.INPUT_TYPE_EXTERNAL_THERMISTOR_CONNECTOR]: {
      description: "External Thermistor",
      range: new Range(-40.0, 125.0),
      genericType: GenericType.TEMPERATURE,
    },
    [Type.INPUT_TYPE_DISHTEMP_BLUE]: {
      description: "DishTemp Blue",
      range: new Range(0.0, 90.0),
      genericType: GenericType.TEMPERATURE,
    },
  };

  export enum LimitTrimUnit {
    LIMIT_TRIM_UNIT_UNKNOWN = "(Unknown unit)",
    LIMIT_TRIM_UNIT_DEG_CELSIUS = "°C",
    LIMIT_TRIM_UNIT_DEG_FAHRENHEIT = "°F",
    LIMIT_TRIM_UNIT_PERCENT_RELATIVE_HUMIDITY = "% relative humidity",
    LIMIT_TRIM_UNIT_PH = "(pH)",
  }

  export enum State {
    DISCONNECTED = "disconnected",
    CONNECTING = "connecting",
    OK = "ok",
    LOW_BATTERY = "low battery",
    FAULT = "fault",
    DISABLED = "disabled",
  }
}
