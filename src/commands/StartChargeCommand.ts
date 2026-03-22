import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";
import {
  BATTERY_TYPE_ATTR,
  BatteryChemistry,
  BatteryType,
} from "src/enums/BatteryTypes";
import { getOperationModel, OperationMode } from "src/enums/OperationModes";
import { DeviceType } from "src/enums/DeviceTypes";

export class StartChargeCommand extends Command {
  public constructor(
    channel: ChargingChannel,
    deviceType: DeviceType,
    batteryType: BatteryType,
    cellCount: number,
    operationMode: OperationMode,
    chargeCurrent: number,
    dischargeCurrent: number,
    voltageCharge: number,
    voltageDischarge: number,
    repeakNumber: number,
    cycleModel: number,
    cycleNumber: number,
    trickleCurrent: number,
  ) {
    const commandBytes = new Uint8Array(16);

    let chemistry = BATTERY_TYPE_ATTR[batteryType].chemistry;
    commandBytes[0] = channel;
    commandBytes[1] = batteryType;
    commandBytes[2] = cellCount;
    commandBytes[3] = getOperationModel(chemistry, operationMode);
    commandBytes[4] = (chargeCurrent / 100) & 0xff;
    commandBytes[5] = (dischargeCurrent / 100) & 0xff;
    commandBytes[6] = (voltageDischarge / 0x100) & 0xff;
    commandBytes[7] = (voltageDischarge % 0x100) & 0xff;
    commandBytes[8] = (voltageCharge / 0x100) & 0xff;
    commandBytes[9] = (voltageCharge % 0x100) & 0xff;
    if (chemistry === BatteryChemistry.NICKEL) {
      if (operationMode === OperationMode.RE_PEAK) {
        commandBytes[10] = repeakNumber;
        commandBytes[11] = 0;
      } else if (operationMode === OperationMode.CYCLE) {
        commandBytes[10] = deviceType === DeviceType.B6EVO ? 1 : cycleModel;
        commandBytes[11] = cycleNumber;
      }
    }
    commandBytes[12] = (trickleCurrent / 0x100) & 0xff;
    commandBytes[13] = (trickleCurrent % 0x100) & 0xff;
    if (
      deviceType === DeviceType.D200NEX ||
      deviceType === DeviceType.D200NEXMETAL
    ) {
      commandBytes[14] = ((chargeCurrent / 100) >> 8) & 0xff;
      commandBytes[15] = ((dischargeCurrent / 100) >> 8) & 0xff;
    }
    super(CommandEnum.START_CHARGE, commandBytes);
  }
}
