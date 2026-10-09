import {
  lifeVoltsToPercentage,
  liioVoltsToPercentage,
  lipoVoltsToPercentage,
  nickelVoltsToPercentage,
} from "src/utils/BatteryUtils";

export enum BatteryChemistry {
  LITHIUM,
  NICKEL,
  LEAD_ACID,
}

export enum BatteryCycleType {
  CHARGE_DISCHARGE = 0x00,
  DISCHARGE_CHARGE = 0x01,
}

export enum BatteryType {
  LI_PO = 0x00,
  LI_IO = 0x01,
  LI_FE = 0x02,
  LI_HV = 0x03,
  NI_MH = 0x04,
  NI_CD = 0x05,
  PB = 0x06,
  PB_AGM = 0x07,
}

interface BatteryChemistryAttr {
  displayName: string;
  minCells: number;
  minBalanceCells: number;
  maxCells: number;
  name: string;
}

export const BATTERY_CHEMISTRY_ATTR: Record<
  BatteryChemistry,
  BatteryChemistryAttr
> = {
  [BatteryChemistry.LITHIUM]: {
    displayName: "Lithium",
    minCells: 1,
    minBalanceCells: 1,
    maxCells: 6,
    name: "Li",
  },
  [BatteryChemistry.NICKEL]: {
    displayName: "Nickel",
    minCells: 1,
    minBalanceCells: 1,
    maxCells: 15,
    name: "Ni",
  },
  [BatteryChemistry.LEAD_ACID]: {
    displayName: "Lead Acid",
    minCells: 1,
    minBalanceCells: 1,
    maxCells: 10,
    name: "Pb",
  },
};

interface BatteryTypeAttr {
  chemistry: BatteryChemistry;
  displayName: string;
  voltsToPercentage: ((volts: number) => number) | null;
}

export const BATTERY_TYPE_ATTR: Record<BatteryType, BatteryTypeAttr> = {
  [BatteryType.LI_PO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Polymer",
    voltsToPercentage: lipoVoltsToPercentage,
  },
  [BatteryType.LI_IO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Ion",
    voltsToPercentage: liioVoltsToPercentage,
  },
  [BatteryType.LI_FE]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Fe",
    voltsToPercentage: lifeVoltsToPercentage,
  },
  [BatteryType.LI_HV]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium HV",
    voltsToPercentage: null,
  },
  [BatteryType.NI_MH]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel MH",
    voltsToPercentage: nickelVoltsToPercentage,
  },
  [BatteryType.NI_CD]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel CD",
    voltsToPercentage: nickelVoltsToPercentage,
  },
  [BatteryType.PB]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead Acid",
    voltsToPercentage: null,
  },
  [BatteryType.PB_AGM]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead AGM",
    voltsToPercentage: null,
  },
};

/**
 * Number of cells to divide the pack voltage by. Uses the per-cell readings
 * when there are several (balance lead connected); otherwise the configured
 * cell count, since nickel packs and unbalanced lithium packs report only the
 * pack total.
 */
export function getPackCellCount(
  cellReadings: number,
  cellCount: number,
): number {
  if (cellReadings > 1) return cellReadings;
  return cellCount > 0 ? cellCount : 1;
}

/** Display text for a getBatteryPercentage result; "–" when unknown. */
export function formatBatteryPercentage(percentage: number): string {
  return percentage >= 0 ? `${percentage.toFixed(2)}%` : "–";
}

/**
 * Approximate state of charge (0–100) for one cell, or -1 when the voltage is
 * out of range or the battery type has no voltage curve.
 */
export function getBatteryPercentage(
  batteryType: BatteryType,
  volts: number,
): number {
  const voltsToPercentage = BATTERY_TYPE_ATTR[batteryType]?.voltsToPercentage;
  if (!voltsToPercentage || !Number.isFinite(volts)) return -1;
  return voltsToPercentage(volts);
}
