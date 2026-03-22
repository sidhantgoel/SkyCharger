import { CommandEnum } from "src/enums/Commands";
import { Command } from "./Command";

export class UpgradeDataCommand extends Command {
  public constructor(sequence: number, data: Uint8Array) {
    let dataBytes = new Uint8Array(data.length + 4);
    dataBytes[0] = (sequence / 0x100) & 0xff;
    dataBytes[1] = sequence & 0xff;
    dataBytes[2] = 0x00;
    dataBytes[3] = 0x00;
    dataBytes.set(data, 4);
    super(CommandEnum.UPGRADE, dataBytes);
  }
}
