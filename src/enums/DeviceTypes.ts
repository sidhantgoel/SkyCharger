import { ChargingChannel } from "./ChargingChannels";
// import battery from './assets/battery.json';
// import battery_196_197_info from './assets/battery_196_197_info.json';

/** Device model identifier. */
export enum DeviceType {
  ACC6,
  B6EVO,
  B6NANO,
  B6NAX,
  D100,
  D1001,
  D200NEX,
  D200NEXMETAL,
  D200S,
  D260,
  NC2200,
  Q200,
  Q200NEO,
  Q200V2,
  T1000,
}

interface ChargeCurrentAttr {
  min: number;
  max: number;
  step: number;
  default: number;
}

interface DischargeCurrentAttr {
  min: number;
  max: number;
  step: number;
  default: number;
}

interface DeviceAttr {
  bytes: Uint8Array;
  name: string;
  channels: ChargingChannel[];
  passwordEnable: boolean;
  chargeCurrentAttr: ChargeCurrentAttr;
  dischargeCurrentAttr: DischargeCurrentAttr;
}

/** Signature bytes (6) and optional display name for each device type. */
export const DEVICE_ATTR: Record<DeviceType, DeviceAttr> = {
  [DeviceType.ACC6]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x33, 0x32]),
    name: "ACC6",
    channels: [ChargingChannel.A],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.B6EVO]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x36, 0x38]),
    name: "B6EVO",
    channels: [ChargingChannel.A],
    passwordEnable: false,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.B6NANO]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x33, 0x34]),
    name: "B6NANO",
    channels: [ChargingChannel.A],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.B6NAX]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x37, 0x34]),
    name: "B6NAX",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D100]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x33, 0x31]),
    name: "D100",
    channels: [ChargingChannel.A, ChargingChannel.B],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D1001]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x33, 0x32]),
    name: "D1001",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D200NEX]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x39, 0x36]),
    name: "D200NEX",
    channels: [ChargingChannel.A, ChargingChannel.B],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D200NEXMETAL]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x32, 0x30, 0x33]),
    name: "D200NEXMETAL",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D200S]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x34, 0x36]),
    name: "D200S",
    channels: [ChargingChannel.A, ChargingChannel.B],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.D260]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x37, 0x35]),
    name: "D260",
    channels: [ChargingChannel.A, ChargingChannel.B],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.NC2200]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x38, 0x31]),
    name: "NC2200",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.Q200]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x30, 0x34]),
    name: "Q200",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.Q200NEO]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x39, 0x37]),
    name: "Q200NEO",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.Q200V2]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x35, 0x38]),
    name: "Q200V2",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
  [DeviceType.T1000]: {
    bytes: new Uint8Array([0x31, 0x30, 0x30, 0x31, 0x38, 0x32]),
    name: "T1000",
    channels: [
      ChargingChannel.A,
      ChargingChannel.B,
      ChargingChannel.C,
      ChargingChannel.D,
    ],
    passwordEnable: true,
    chargeCurrentAttr: { min: 100, max: 10000, step: 100, default: 3000 },
    dischargeCurrentAttr: { min: 100, max: 2000, step: 100, default: 1000 },
  },
};

export function getDeviceTypeFromBytes(bytes: Uint8Array): DeviceType | null {
  for (let [deviceType, deviceAttr] of Object.entries(DEVICE_ATTR)) {
    if (bytes.every((b, index) => b === deviceAttr.bytes[index]))
      return deviceType as unknown as DeviceType;
  }
  return null;
}

// export const getDeviceJson = (deviceType: DeviceType, version: number) => {
//   let bytes = Buffer.from(DEVICE_ATTR[deviceType].bytes).toString('hex');
//   let json = battery;
//   if(deviceType == DeviceType.Q200NEO && version >= 3.21) {
//     json = battery_196_197_info;
//   }
//   return json.find((item) => item.DeviceType === bytes);
// };
