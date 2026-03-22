import { BluetoothHelper } from "./BluetoothHelper";
import { CommandEnum } from "src/enums/Commands";
import { UpdateEndCommand } from "src/commands/UpdateEndCommand";
import { UpgradeDataCommand } from "src/commands/UpgradeDataCommand";
import { UpgradePrepareCommand } from "src/commands/UpgradePrepareCommand";

export class FirmwareUpdator {
  private bluetoothHelper: BluetoothHelper;
  private startFirmwareUpdatePromise: PromiseWithResolvers<boolean> | null =
    null;
  private sendFirmwareUpdateDataPromise: PromiseWithResolvers<boolean> | null =
    null;
  private sendUpdateEndPromise: PromiseWithResolvers<boolean> | null = null;
  private sequence: number = 0;
  private dataTimeout: NodeJS.Timeout | null = null;

  public constructor(bluetoothHelper: BluetoothHelper) {
    this.bluetoothHelper = bluetoothHelper;
  }

  private onNotify = (command: CommandEnum, data: Uint8Array) => {
    if (
      this.startFirmwareUpdatePromise &&
      command === CommandEnum.UPGRADE_PREPARE
    ) {
      this.startFirmwareUpdatePromise.resolve(data[0] === 0x01);
    }
    if (this.sendFirmwareUpdateDataPromise && command === CommandEnum.UPGRADE) {
      let success = data[0] === 0x01;
      let sequence = (data[1] << 8) | data[2];
      if (sequence === this.sequence) {
        this.sendFirmwareUpdateDataPromise.resolve(success);
      }
    }
    if (this.sendUpdateEndPromise && command === CommandEnum.UPGRADE_OVER) {
      this.sendUpdateEndPromise.resolve(data[0] === 0x01);
    }
  };

  private startFirmwareUpdate = async (): Promise<boolean> => {
    this.startFirmwareUpdatePromise = Promise.withResolvers<boolean>();
    await this.bluetoothHelper.sendCommand(new UpgradePrepareCommand());
    return await this.startFirmwareUpdatePromise.promise;
  };

  private sendFirmwareUpdateData = async (
    sequence: number,
    data: Uint8Array,
  ) => {
    if (this.dataTimeout) {
      clearTimeout(this.dataTimeout);
      this.dataTimeout = null;
    }
    this.sendFirmwareUpdateDataPromise = Promise.withResolvers<boolean>();
    this.sequence = sequence;
    await this.bluetoothHelper.sendCommand(
      new UpgradeDataCommand(sequence, data),
    );
    this.dataTimeout = setTimeout(() => {
      this.sendFirmwareUpdateDataPromise.reject(new Error("Data timeout"));
    }, 2000);
    return await this.sendFirmwareUpdateDataPromise.promise;
  };

  private sendUpdateEnd = async (checksum: number) => {
    this.sendUpdateEndPromise = Promise.withResolvers<boolean>();
    await this.bluetoothHelper.sendCommand(new UpdateEndCommand(checksum, 56));
    return await this.sendUpdateEndPromise.promise;
  };

  public updateFirmware = async (
    data: Uint8Array,
    checksum: number,
    progressCallback: (message: string, progress: number) => void,
  ) => {
    this.bluetoothHelper.addOnNotifyListener(this.onNotify);
    let result = await this.startFirmwareUpdate();
    if (!result) return false;
    let sequence = 0;
    progressCallback("Firmware update preparing.", 0);
    for (let i = 0; i < 5; i++) {
      try {
        result = await this.sendFirmwareUpdateData(
          sequence,
          new Uint8Array(64),
        );
        if (result) {
          sequence++;
          break;
        }
      } catch (error) {
        console.error(error);
        result = false;
        continue;
      }
    }
    if (!result) return false;
    progressCallback("Firmware update started.", 0);
    for (let i = 0; i < data.length; i += 64) {
      let chunk = data.slice(i, i + 64);
      if (chunk.length < 64) {
        chunk = new Uint8Array(64);
        chunk.set(data.slice(i));
      }
      result = await this.sendFirmwareUpdateData(sequence, chunk);
      if (!result) return false;
      progressCallback("Updating.", Math.floor(((i + 64) / data.length) * 100));
      sequence++;
    }
    progressCallback("Finishing firmware update.", 100);
    result = await this.sendUpdateEnd(checksum);
    if (!result) return false;
    progressCallback("Firmware update completed.", 100);
    return true;
  };
}
