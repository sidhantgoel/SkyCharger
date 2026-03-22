import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";

export class StopChargeCommand extends Command {
  public constructor(channel: ChargingChannel) {
    super(CommandEnum.STOP_CHARGE, new Uint8Array([channel]));
  }
}
