import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";

export class QueryChannelStatusCommand extends Command {
  public constructor(channel: ChargingChannel) {
    super(CommandEnum.QUERY_CHANNEL_STATUS, new Uint8Array([channel]));
  }
}
