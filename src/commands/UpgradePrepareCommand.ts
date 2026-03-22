import { CommandEnum } from "src/enums/Commands";
import { Command } from "./Command";

export class UpgradePrepareCommand extends Command {
  public constructor() {
    super(CommandEnum.UPGRADE_PREPARE, new Uint8Array());
  }
}
