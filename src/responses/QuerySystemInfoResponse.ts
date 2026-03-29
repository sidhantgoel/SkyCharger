import { ChargingChannel } from "src/enums/ChargingChannels";

export interface SystemInfo {
  channel: ChargingChannel;
  recycle: number;
  timeEnable: boolean;
  time: number;
  capacityEnable: boolean;
  capacity: number;
  keyDownEnable: boolean;
  systemEnable: boolean;
  keyboardSound: number;
  systemSound: number;
  voltageLow: number;
  balanced: boolean;
  power: number;
  temperature: number;
  newFirmware: boolean;
  dcEnable: boolean;
  dcPower: number;
  dcVoltage: number;
  dcCurrent: number;
  endNotifyBeep: number;
  lcd: number;
  warning: number;
  sleepTime: number;
}

const createSystemInfo = (
  channel: ChargingChannel,
  recycle: number,
  timeEnable: boolean,
  time: number,
  capacityEnable: boolean,
  capacity: number,
  keyDownEnable: boolean,
  systemEnable: boolean,
  keyboardSound: number,
  systemSound: number,
  voltageLow: number,
  balanced: boolean,
  power: number,
  temperature: number,
  newFirmware: boolean,
  dcEnable: boolean,
  dcPower: number,
  dcVoltage: number,
  dcCurrent: number,
  endNotifyBeep: number,
  lcd: number,
  warning: number,
  sleepTime: number,
): SystemInfo => {
  return {
    channel,
    recycle,
    timeEnable,
    time,
    capacityEnable,
    capacity,
    keyDownEnable,
    systemEnable,
    keyboardSound,
    systemSound,
    voltageLow,
    balanced,
    power,
    temperature,
    newFirmware,
    dcEnable,
    dcPower,
    dcVoltage,
    dcCurrent,
    endNotifyBeep,
    lcd,
    warning,
    sleepTime,
  };
};

export const parseSystemInfo = (data: Uint8Array): SystemInfo => {
  const channel = data[0];
  const recycle = data[1];
  const timeEnable = data[2] === 1;
  const time = data[3] * 0x100 + data[4];
  const capacityEnable = data[5] === 1;
  const capacity = data[6] * 0x100 + data[7];
  const keyDownEnable = data[8] !== 0;
  const systemEnable = data[9] !== 0;
  const keyboardSound = data[8];
  const systemSound = data[9];
  const voltageLow = data[10] * 0x100 + data[11];
  const balanced = data[12] === 1;
  const power = data[13];
  const temperature = data[14];
  const newFirmware = data.length >= 37;
  const dcEnable = newFirmware ? data[33] === 1 : null;
  const dcPower = newFirmware ? data[34] : null;
  const dcVoltage = newFirmware ? data[35] : null;
  const dcCurrent = newFirmware ? data[36] : null;
  const endNotifyBeep = data.length >= 41 ? data[37] : null;
  const lcd = data.length >= 0x27 ? data[38] : null;
  const warning = data.length >= 0x27 ? data[39] : null;
  const sleepTime = data.length >= 0x27 ? data[40] : null;
  return createSystemInfo(
    channel,
    recycle,
    timeEnable,
    time,
    capacityEnable,
    capacity,
    keyDownEnable,
    systemEnable,
    keyboardSound,
    systemSound,
    voltageLow,
    balanced,
    power,
    temperature,
    newFirmware,
    dcEnable,
    dcPower,
    dcVoltage,
    dcCurrent,
    endNotifyBeep,
    lcd,
    warning,
    sleepTime,
  );
};
