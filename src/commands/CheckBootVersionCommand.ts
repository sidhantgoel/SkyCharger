import { CommandEnum } from "src/enums/Commands";
import { Command } from "./Command";

export class CheckBootVersionCommand extends Command {
  public constructor() {
    super(CommandEnum.CHECK_BOOT_VERSION, new Uint8Array([1]));
  }
}
