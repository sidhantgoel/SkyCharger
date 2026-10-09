import { BluetoothHelper } from "./BluetoothHelper";
import { CommandEnum } from "src/enums/Commands";
import { Command } from "src/commands/Command";
import { UpdateEndCommand } from "src/commands/UpdateEndCommand";
import { UpgradeDataCommand } from "src/commands/UpgradeDataCommand";
import { UpgradePrepareCommand } from "src/commands/UpgradePrepareCommand";

const DATA_TIMEOUT_MS = 2000;
const PREPARE_TIMEOUT_MS = 10000;
const END_TIMEOUT_MS = 10000;

export class FirmwareUpdater {
  private bluetoothHelper: BluetoothHelper;
  private startFirmwareUpdatePromise: PromiseWithResolvers<boolean> | null =
    null;
  private sendFirmwareUpdateDataPromise: PromiseWithResolvers<boolean> | null =
    null;
  private sendUpdateEndPromise: PromiseWithResolvers<boolean> | null = null;
  private sequence: number = 0;

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
      // The sequence is sent as 16 bits, so compare modulo 0x10000.
      if (sequence === (this.sequence & 0xffff)) {
        this.sendFirmwareUpdateDataPromise.resolve(success);
      }
    }
    if (this.sendUpdateEndPromise && command === CommandEnum.UPGRADE_OVER) {
      this.sendUpdateEndPromise.resolve(data[0] === 0x01);
    }
  };

  /**
   * Send a command and wait for its reply. Resolves false when the write
   * fails or no reply arrives within timeoutMs, so callers never hang.
   */
  private sendAndWait = async (
    command: Command,
    pending: PromiseWithResolvers<boolean>,
    timeoutMs: number,
  ): Promise<boolean> => {
    const timeout = setTimeout(() => pending.resolve(false), timeoutMs);
    try {
      if (!(await this.bluetoothHelper.sendCommand(command))) return false;
      return await pending.promise;
    } finally {
      clearTimeout(timeout);
    }
  };

  private startFirmwareUpdate = async (): Promise<boolean> => {
    this.startFirmwareUpdatePromise = Promise.withResolvers<boolean>();
    return this.sendAndWait(
      new UpgradePrepareCommand(),
      this.startFirmwareUpdatePromise,
      PREPARE_TIMEOUT_MS,
    );
  };

  private sendFirmwareUpdateData = async (
    sequence: number,
    data: Uint8Array,
  ): Promise<boolean> => {
    this.sendFirmwareUpdateDataPromise = Promise.withResolvers<boolean>();
    this.sequence = sequence;
    return this.sendAndWait(
      new UpgradeDataCommand(sequence, data),
      this.sendFirmwareUpdateDataPromise,
      DATA_TIMEOUT_MS,
    );
  };

  private sendUpdateEnd = async (checksum: number): Promise<boolean> => {
    this.sendUpdateEndPromise = Promise.withResolvers<boolean>();
    return this.sendAndWait(
      new UpdateEndCommand(checksum, 56),
      this.sendUpdateEndPromise,
      END_TIMEOUT_MS,
    );
  };

  public updateFirmware = async (
    data: Uint8Array,
    checksum: number,
    progressCallback: (message: string, progress: number) => void,
  ): Promise<boolean> => {
    this.bluetoothHelper.addOnNotifyListener(this.onNotify);
    try {
      let result = await this.startFirmwareUpdate();
      if (!result) return false;
      let sequence = 0;
      progressCallback("Firmware update preparing.", 0);
      for (let i = 0; i < 5; i++) {
        result = await this.sendFirmwareUpdateData(
          sequence,
          new Uint8Array(64),
        );
        if (result) {
          sequence++;
          break;
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
        progressCallback(
          "Updating.",
          Math.min(100, Math.floor(((i + 64) / data.length) * 100)),
        );
        sequence++;
      }
      progressCallback("Finishing firmware update.", 100);
      result = await this.sendUpdateEnd(checksum);
      if (!result) return false;
      progressCallback("Firmware update completed.", 100);
      return true;
    } finally {
      this.bluetoothHelper.removeOnNotifyListener(this.onNotify);
      this.startFirmwareUpdatePromise = null;
      this.sendFirmwareUpdateDataPromise = null;
      this.sendUpdateEndPromise = null;
    }
  };
}
