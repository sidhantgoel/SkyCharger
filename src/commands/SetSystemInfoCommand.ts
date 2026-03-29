import { Command } from "./Command";
import { CommandEnum } from "src/enums/Commands";
import { ChargingChannel } from "src/enums/ChargingChannels";
import { SettingType } from "src/enums/SettingTypes";

export class SetSystemInfoCommand extends Command {
  public constructor(
    channel: ChargingChannel,
    byte1: number,
    byte2: number,
    byte3: number,
    byte4: number,
  ) {
    super(
      CommandEnum.SET_SYSTEM_INFO,
      new Uint8Array([channel, byte1, byte2, byte3, byte4]),
    );
  }
}

export class SetRecycleCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.RECYCLE, value, 0, 0);
  }
}

export class SetTimeCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, enable: boolean, time: number) {
    super(
      channel,
      SettingType.TIME,
      enable ? 1 : 0,
      Math.floor(time / 0x100),
      time % 0x100,
    );
  }
}

export class SetCapacityCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, enable: boolean, value: number) {
    super(
      channel,
      SettingType.CAPACITY,
      enable ? 1 : 0,
      Math.floor(value / 0x100),
      value % 0x100,
    );
  }
}

export class SetSoundCommand extends SetSystemInfoCommand {
  public constructor(
    channel: ChargingChannel,
    keyDownEnable: boolean,
    systemEnable: boolean,
  ) {
    super(
      channel,
      SettingType.SOUND,
      keyDownEnable ? 1 : 0,
      systemEnable ? 1 : 0,
      0,
    );
  }
}

export class SetVoltageLowCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(
      channel,
      SettingType.VOLTAGE_LOW,
      Math.floor(value / 0x100),
      value % 0x100,
      0,
    );
  }
}

export class SetTemperatureCommand extends SetSystemInfoCommand {
  public constructor(
    channel: ChargingChannel,
    unit: number,
    temperature: number,
  ) {
    super(channel, SettingType.TEMPERATURE, temperature, 0, 0);
  }
}

export class SetBalancedCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, balanced: boolean) {
    super(channel, SettingType.BALANCED, balanced ? 1 : 0, 0, 0);
  }
}

export class SetPowerCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.POWER, value, 0, 0);
  }
}

export class SetDcEnableCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, enable: boolean) {
    super(channel, SettingType.DC_ENABLE, enable ? 1 : 0, 0, 0);
  }
}

export class SetDcPowerCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.DC_POWER, value, 0, 0);
  }
}

export class SetDcVoltageCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.DC_VOLTAGE, value, 0, 0);
  }
}

export class SetDcCurrentCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.DC_CURRENT, value, 0, 0);
  }
}

export class SetLcdCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.LCD, value, 0, 0);
  }
}

export class SetWarningCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.WARNING, value, 0, 0);
  }
}

export class SetSleepTimeCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel, value: number) {
    super(channel, SettingType.SLEEP_TIME, value, 0, 0);
  }
}

export class SetResetCommand extends SetSystemInfoCommand {
  public constructor(channel: ChargingChannel) {
    super(channel, SettingType.RESET, 0, 0, 0);
  }
}
