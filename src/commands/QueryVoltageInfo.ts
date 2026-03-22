import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";

export class QueryVoltageInfoCommand extends Command {
  public constructor(channel: ChargingChannel) {
    super(CommandEnum.QUERY_VOLTAGE_INFO, new Uint8Array([channel]));
  }
}
