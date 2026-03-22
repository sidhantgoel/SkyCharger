import { CommandEnum } from "src/enums/Commands";
import { Command } from "./Command";

export class CheckNewVersionCommand extends Command {
  public constructor(haveNewVersion: boolean) {
    super(
      CommandEnum.CHECK_NEW_VERSION,
      new Uint8Array([0, haveNewVersion ? 1 : 0]),
    );
  }
}
