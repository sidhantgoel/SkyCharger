import { BatteryChemistry } from "./BatteryTypes";

export enum OperationMode {
  BALANCE_CHARGE,
  CHARGE,
  DISCHARGE,
  STORAGE,
  FAST_CHARGE,
  AUTO_CHARGE,
  RE_PEAK,
  CYCLE,
  AGM,
  COLD,
}

export enum ChargeParameterEnum {
  CHARGE_CURRENT,
  DISCHARGE_CURRENT,
  CHARGE_VOLTAGE,
  DISCHARGE_VOLTAGE,
  CYCLE_MODEL,
  CYCLE_NUMBER,
  REPEAK_NUMBER,
  TRACK_VOLTAGE,
  VOLTAGE,
}

interface ChargeParameterAttr {
  displayName: string;
  unit: string;
}

export const CHARGE_PARAMETER_ATTRS: Record<
  ChargeParameterEnum,
  ChargeParameterAttr
> = {
  [ChargeParameterEnum.CHARGE_CURRENT]: {
    displayName: "Charge Current",
    unit: "mA",
  },
  [ChargeParameterEnum.DISCHARGE_CURRENT]: {
    displayName: "Discharge Current",
    unit: "mA",
  },
  [ChargeParameterEnum.CHARGE_VOLTAGE]: {
    displayName: "Charge Voltage",
    unit: "mV",
  },
  [ChargeParameterEnum.DISCHARGE_VOLTAGE]: {
    displayName: "Discharge Voltage",
    unit: "mV",
  },
  [ChargeParameterEnum.CYCLE_MODEL]: {
    displayName: "Cycle Model",
    unit: "",
  },
  [ChargeParameterEnum.CYCLE_NUMBER]: {
    displayName: "Cycle Number",
    unit: "",
  },
  [ChargeParameterEnum.REPEAK_NUMBER]: {
    displayName: "Repeak Number",
    unit: "",
  },
  [ChargeParameterEnum.TRACK_VOLTAGE]: {
    displayName: "Track Voltage",
    unit: "mV",
  },
  [ChargeParameterEnum.VOLTAGE]: {
    displayName: "Voltage",
    unit: "mV",
  },
};

interface OperationModeAttr {
  displayName: string;
}

export const OPERATION_MODE_DISPLAY_NAMES: Record<
  OperationMode,
  OperationModeAttr
> = {
  [OperationMode.BALANCE_CHARGE]: {
    displayName: "Balance Charge",
  },
  [OperationMode.CHARGE]: {
    displayName: "Charge",
  },
  [OperationMode.DISCHARGE]: {
    displayName: "Discharge",
  },
  [OperationMode.STORAGE]: {
    displayName: "Storage",
  },
  [OperationMode.FAST_CHARGE]: {
    displayName: "Fast Charge",
  },
  [OperationMode.AUTO_CHARGE]: {
    displayName: "Auto Charge",
  },
  [OperationMode.RE_PEAK]: {
    displayName: "Re Peak",
  },
  [OperationMode.CYCLE]: {
    displayName: "Cycle",
  },
  [OperationMode.AGM]: {
    displayName: "AGM",
  },
  [OperationMode.COLD]: {
    displayName: "Cold",
  },
};

/** Operation mode / status code per chemistry. Only lithium is defined for now. */
export const OperationModes: Record<
  BatteryChemistry,
  Partial<Record<OperationMode, number>>
> = {
  [BatteryChemistry.LITHIUM]: {
    [OperationMode.BALANCE_CHARGE]: 0x00,
    [OperationMode.CHARGE]: 0x01,
    [OperationMode.DISCHARGE]: 0x02,
    [OperationMode.STORAGE]: 0x03,
    [OperationMode.FAST_CHARGE]: 0x04,
  },
  [BatteryChemistry.NICKEL]: {
    [OperationMode.CHARGE]: 0x00,
    [OperationMode.AUTO_CHARGE]: 0x01,
    [OperationMode.DISCHARGE]: 0x02,
    [OperationMode.RE_PEAK]: 0x03,
    [OperationMode.CYCLE]: 0x04,
  },
  [BatteryChemistry.LEAD_ACID]: {
    [OperationMode.CHARGE]: 0x00,
    [OperationMode.DISCHARGE]: 0x01,
  },
};

export function getOperationModes(
  chemistry: BatteryChemistry,
): OperationMode[] {
  const map = OperationModes[chemistry] ?? {};
  return Object.keys(map).map((k) => Number(k) as OperationMode);
}

export function getOperationMode(
  chemistry: BatteryChemistry,
  model: number,
): OperationMode {
  const map = OperationModes[chemistry] ?? {};
  return Object.keys(map)
    .map((k) => Number(k) as OperationMode)
    .find((mode) => mode === model);
}

export function getOperationModel(
  chemistry: BatteryChemistry,
  operationMode: OperationMode,
): number {
  const map = OperationModes[chemistry] ?? {};
  return map[operationMode] ?? 0;
}
