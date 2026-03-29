import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import {
  ChargingChannel,
  findChannelForMask,
} from "src/enums/ChargingChannels";
import { ErrorCode, getErrorCodeForValue } from "src/enums/ErrorCodes";

export interface ChannelWorkingInfo {
  channel: ChargingChannel;
  workingState: ChannelWorkingState;
  systemErrorCode: ErrorCode;
  chargeErrorCode: ErrorCode;
  capacity: number;
  durationSeconds: number;
  voltage: number;
  electricity: number;
  externalTemperature: number;
  internalTemperature: number;
  internalResistance: number;
  inUsb: boolean;
  status: number;
  setVoltage: number;
  setCurrent: number;
  realVoltage: number;
  realCurrent: number;
  realPower: number;
  dcErrorCode: number;
  cellVoltages: number[];
}

function createChannelStatus(
  channel: ChargingChannel,
  workingState: ChannelWorkingState,
  systemErrorCode: ErrorCode,
  chargeErrorCode: ErrorCode,
  capacity: number,
  durationSeconds: number,
  voltage: number,
  electricity: number,
  externalTemperature: number,
  internalTemperature: number,
  internalResistance: number,
  inUsb: boolean,
  status: number,
  setVoltage: number,
  setCurrent: number,
  realVoltage: number,
  realCurrent: number,
  realPower: number,
  dcErrorCode: number,
  cellVoltages: number[],
): ChannelWorkingInfo {
  return {
    channel,
    workingState,
    systemErrorCode,
    chargeErrorCode,
    capacity,
    durationSeconds,
    voltage,
    electricity,
    externalTemperature,
    internalTemperature,
    internalResistance,
    inUsb,
    status,
    setVoltage,
    setCurrent,
    realVoltage,
    realCurrent,
    realPower,
    dcErrorCode,
    cellVoltages,
  };
}

/**
 * Parse channel status from device response bytes.
 * Returns null if data is too short (need at least 26 bytes for cell voltages).
 */
export function parseChannelWorkingInfo(
  data: Uint8Array | number[],
): ChannelWorkingInfo | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 26) return null;

  const channel = findChannelForMask(d[0]);
  const workingState = d[1];
  let systemErrorCode: ErrorCode = 0;
  let chargeErrorCode: ErrorCode = 0;
  let capacity = 0;
  let duration = 0;
  let voltage = 0;
  let electricity = 0;
  let externalTemperature = 0;
  let internalTemperature = 0;
  let internalResistance = 0;
  let inUsb = false;
  let status = 0;
  let setVoltage = 0;
  let setCurrent = 0;
  let realVoltage = 0;
  let realCurrent = 0;
  let realPower = 0;
  let dcErrorCode = 0;
  const cellVoltages = [0, 0, 0, 0, 0, 0, 0, 0];

  if (workingState === ChannelWorkingState.ERROR) {
    systemErrorCode = d[2];
    chargeErrorCode = d[3];
  } else if (
    workingState === ChannelWorkingState.WORKING ||
    workingState === ChannelWorkingState.DONE
  ) {
    capacity = (d[2] << 8) + d[3];
    duration = (d[4] << 8) + d[5];
    if (d[6] !== 0xff && d[7] !== 0xff) {
      voltage = (d[6] << 8) + d[7];
    }
    if (d[8] !== 0xff && d[9] !== 0xff) {
      electricity = (d[8] << 8) + d[9];
    }
    externalTemperature = d[10];
    internalTemperature = d[11];
    internalResistance = (d[12] << 8) + d[13];
    // if(step != 16) {
    //   status = d[14];
    // }
    inUsb = d[30] === 1;
    status = d[31];
  } else if (workingState === ChannelWorkingState.READY) {
    chargeErrorCode = d[3];
  } else if (workingState === ChannelWorkingState.STATE_7) {
    if (d[2] == 0) {
      if (d.length > 12) {
        setVoltage = (d[3] << 8) + d[4];
        setCurrent = (d[5] << 8) + d[6];
        realVoltage = (d[7] << 8) + d[8];
        realCurrent = (d[9] << 8) + d[10];
        realPower = (d[11] << 8) + d[12];
      }
    } else {
      dcErrorCode = d[2];
      systemErrorCode = d[2];
      chargeErrorCode = d[3];
    }
  }

  //if(BATTERY_TYPE_ATTR[batteryType].chemistry == BatteryChemistry.LITHIUM) {
  if (true) {
    cellVoltages[0] = (d[14] << 8) + d[15];
    cellVoltages[1] = (d[16] << 8) + d[17];
    cellVoltages[2] = (d[18] << 8) + d[19];
    cellVoltages[3] = (d[20] << 8) + d[21];
    cellVoltages[4] = (d[22] << 8) + d[23];
    cellVoltages[5] = (d[24] << 8) + d[25];
    if (d.length > 29) {
      cellVoltages[6] = (d[26] << 8) + d[27];
      cellVoltages[7] = (d[28] << 8) + d[29];
    }
  }

  return createChannelStatus(
    channel,
    workingState,
    getErrorCodeForValue(systemErrorCode),
    getErrorCodeForValue(chargeErrorCode),
    capacity,
    duration,
    voltage,
    electricity,
    externalTemperature,
    internalTemperature,
    internalResistance,
    inUsb,
    status,
    setVoltage,
    setCurrent,
    realVoltage,
    realCurrent,
    realPower,
    dcErrorCode,
    cellVoltages,
  );
}
