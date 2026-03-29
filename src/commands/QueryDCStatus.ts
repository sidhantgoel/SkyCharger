import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";

export class QueryDCStatusCommand extends Command {
  public constructor() {
    super(CommandEnum.QUERY_DC_STATUS, new Uint8Array([0x00]));
  }
}
