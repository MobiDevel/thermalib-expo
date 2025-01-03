import { Unit } from "./Unit";

export enum GenericType {
  UNKNOWN = "UNKNOWN",
  TEMPERATURE = "TEMPERATURE",
  HUMIDITY = "HUMIDITY",
  ACIDITY = "ACIDITY",
}

export const GenericTypeUnits: Record<GenericType, Unit> = {
  [GenericType.UNKNOWN]: Unit.UNKNOWN,
  [GenericType.TEMPERATURE]: Unit.CELSIUS,
  [GenericType.HUMIDITY]: Unit.RELATIVE_HUMIDITY,
  [GenericType.ACIDITY]: Unit.PH,
};
