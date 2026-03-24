import { OperationMode } from "./OperationModes";

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
}

export const BATTERY_TYPE_ATTR: Record<BatteryType, BatteryTypeAttr> = {
  [BatteryType.LI_PO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Polymer",
  },
  [BatteryType.LI_IO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Ion",
  },
  [BatteryType.LI_FE]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Fe",
  },
  [BatteryType.LI_HV]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium HV",
  },
  [BatteryType.NI_MH]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel MH",
  },
  [BatteryType.NI_CD]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel CD",
  },
  [BatteryType.PB]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead Acid",
  },
  [BatteryType.PB_AGM]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead AGM",
  },
};
