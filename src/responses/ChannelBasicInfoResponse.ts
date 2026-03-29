import { BatteryType } from "src/enums/BatteryTypes";
import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import {
  ChargingChannel,
  findChannelForMask,
} from "src/enums/ChargingChannels";

export interface ChannelBasicInfo {
  channel: ChargingChannel;
  workingState: ChannelWorkingState;
  batteryType: BatteryType;
  cellCount: number;
  model: number;
  chargeMax: number;
  dischargeMax: number;
  version: number;
  checkPassword: boolean;
}

function createBasicInfo(
  channel: ChargingChannel,
  workingState: ChannelWorkingState,
  batteryType: BatteryType,
  cellCount: number,
  model: number,
  chargeMax: number,
  dischargeMax: number,
  version: number,
  checkPassword: boolean,
): ChannelBasicInfo {
  return {
    channel,
    workingState,
    batteryType,
    cellCount,
    model,
    chargeMax,
    dischargeMax,
    version,
    checkPassword,
  };
}

/**
 * Parse basic info from device response bytes.
 * Returns null if data is too short.
 */
export function parseBasicInfo(
  data: Uint8Array | number[],
): ChannelBasicInfo | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 10) return null;

  const channel = findChannelForMask(d[0]);
  const workingState = d[1];
  const batteryType = d[2];
  const cells = d[3];
  const model = d[4];
  const chargeMax = d[5] * 100;
  const dischargeMax = d[6] * 100;
  const version = d[7] + d[8] / 100;
  const checkPassword = d[9] === 1;

  return createBasicInfo(
    channel,
    workingState,
    batteryType,
    cells,
    model,
    chargeMax,
    dischargeMax,
    version,
    checkPassword,
  );
}
