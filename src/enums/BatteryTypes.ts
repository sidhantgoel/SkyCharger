/** Battery chemistry category. */
export enum BatteryChemistry {
  LITHIUM,
  NICKEL,
  LEAD_ACID,
}

export enum BatteryCycleType {
  CHARGE_DISCHARGE = 0x00,
  DISCHARGE_CHARGE = 0x01,
}

/** Battery type (matches device byte values 0–7). */
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

interface ChargeVoltageAttr {
  min: number;
  max: number;
  step: number;
  default: number;
}

interface BatteryTypeAttr {
  chemistry: BatteryChemistry;
  displayName: string;
  names: string[];
  chargeVoltageAttr: ChargeVoltageAttr;
}

export const BATTERY_TYPE_ATTR: Record<BatteryType, BatteryTypeAttr> = {
  [BatteryType.LI_PO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Polymer",
    names: ["lipo"],
    chargeVoltageAttr: { min: 4150, max: 4250, step: 10, default: 4200 },
  },
  [BatteryType.LI_IO]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Ion",
    names: ["liio", "liLon"],
    chargeVoltageAttr: { min: 4050, max: 4250, step: 10, default: 4100 },
  },
  [BatteryType.LI_FE]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium Fe",
    names: ["life"],
    chargeVoltageAttr: { min: 3580, max: 3700, step: 10, default: 3650 },
  },
  [BatteryType.LI_HV]: {
    chemistry: BatteryChemistry.LITHIUM,
    displayName: "Lithium HV",
    names: ["lihv"],
    chargeVoltageAttr: { min: 4250, max: 4500, step: 10, default: 4350 },
  },
  [BatteryType.NI_MH]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel MH",
    names: ["nimh"],
    chargeVoltageAttr: { min: -3, max: -12, step: -1, default: -6 },
  },
  [BatteryType.NI_CD]: {
    chemistry: BatteryChemistry.NICKEL,
    displayName: "Nickel CD",
    names: ["nicd"],
    chargeVoltageAttr: { min: -3, max: -12, step: -1, default: -6 },
  },
  [BatteryType.PB]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead Acid",
    names: ["pb"],
    chargeVoltageAttr: { min: 2300, max: 2750, step: 10, default: 2400 },
  },
  [BatteryType.PB_AGM]: {
    chemistry: BatteryChemistry.LEAD_ACID,
    displayName: "Lead AGM",
    names: ["pb_agm"],
    chargeVoltageAttr: { min: 2300, max: 2750, step: 10, default: 2400 },
  },
};
