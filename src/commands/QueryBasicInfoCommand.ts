import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";
import { Command } from "./Command";

export class QueryBasicInfoCommand extends Command {
  public constructor(channel: ChargingChannel, password: string) {
    let b1 = parseInt(password.substring(0, 1));
    let b2 = parseInt(password.substring(1, 2));
    let b3 = parseInt(password.substring(2, 3));
    let b4 = parseInt(password.substring(3, 4));
    super(
      CommandEnum.QUERY_BASIC_INFO,
      new Uint8Array([channel, b1, b2, b3, b4]),
    );
  }
}
