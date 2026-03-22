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
}

interface OperationModeAttr {
  displayName: string;
  balance: boolean;
  requireChargeCurrent: boolean;
  requireDischargeCurrent: boolean;
}

export const OPERATION_MODE_DISPLAY_NAMES: Record<
  OperationMode,
  OperationModeAttr
> = {
  [OperationMode.BALANCE_CHARGE]: {
    displayName: "Balance Charge",
    balance: true,
    requireChargeCurrent: true,
    requireDischargeCurrent: false,
  },
  [OperationMode.CHARGE]: {
    displayName: "Charge",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: false,
  },
  [OperationMode.DISCHARGE]: {
    displayName: "Discharge",
    balance: false,
    requireChargeCurrent: false,
    requireDischargeCurrent: true,
  },
  [OperationMode.STORAGE]: {
    displayName: "Storage",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: true,
  },
  [OperationMode.FAST_CHARGE]: {
    displayName: "Fast Charge",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: false,
  },
  [OperationMode.AUTO_CHARGE]: {
    displayName: "Auto Charge",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: false,
  },
  [OperationMode.RE_PEAK]: {
    displayName: "Re Peak",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: false,
  },
  [OperationMode.CYCLE]: {
    displayName: "Cycle",
    balance: false,
    requireChargeCurrent: true,
    requireDischargeCurrent: true,
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
