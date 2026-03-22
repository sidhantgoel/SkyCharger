import { CommandEnum } from "src/enums/Commands";
import { Command } from "./Command";

export class UpdateEndCommand extends Command {
  public constructor(checksum: number, step: number) {
    let dataBytes = new Uint8Array(step == 56 ? 60 : 4);
    dataBytes[0] = checksum & 0xff;
    dataBytes[1] = (checksum >> 8) & 0xff;
    dataBytes[2] = (checksum >> 16) & 0xff;
    dataBytes[3] = (checksum >> 24) & 0xff;
    super(CommandEnum.UPGRADE_OVER, dataBytes);
  }
}
