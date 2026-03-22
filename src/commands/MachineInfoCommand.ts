import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";

export class MachineInfoCommand extends Command {
  public constructor() {
    super(
      CommandEnum.INFO,
      new Uint8Array([
        0x00, 0x45, 0x98, 0xc7, 0x4f, 0x23, 0xdc, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00,
      ]),
    );
  }
}
