import { encodeCommand } from "src/utils/CommandUtils";
import { CommandEnum } from "src/enums/Commands";

export class Command {
  private command: CommandEnum;
  private args: Uint8Array;

  public constructor(command: CommandEnum, args: Uint8Array) {
    this.command = command;
    this.args = args;
  }

  public encode = (): Uint8Array => {
    return encodeCommand(this.command, this.args);
  };
}
