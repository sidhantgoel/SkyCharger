import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";

export class QuerySystemSettingCommand extends Command {
  public constructor() {
    super(CommandEnum.QUERY_SYSTEM_SETTING, new Uint8Array([0x04]));
  }
}
