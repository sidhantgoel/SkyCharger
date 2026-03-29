import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";

export class SetTemperatureCommand extends Command {
  public constructor(
    channel: ChargingChannel,
    unit: number,
    highTemperature: number,
    lowTemperature: number,
  ) {
    super(
      CommandEnum.SET_TEMPERATURE,
      new Uint8Array([channel, unit, highTemperature, lowTemperature]),
    );
  }
}
