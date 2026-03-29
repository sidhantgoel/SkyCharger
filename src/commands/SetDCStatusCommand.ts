import { ChargingChannel } from "src/enums/ChargingChannels";
import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";

export class SetDCStatusCommand extends Command {
  public constructor(
    channel: ChargingChannel,
    byte1: number,
    byte2: number,
    byte3: number,
    byte4: number,
  ) {
    super(
      CommandEnum.SET_DC_STATUS,
      new Uint8Array([channel, byte1, byte2, byte3, byte4]),
    );
  }
}
