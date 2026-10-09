import { Mutex } from "async-mutex";
import { Command } from "src/commands/Command";
import { CommandEnum } from "src/enums/Commands";
import { ResponseParser } from "src/utils/ResponseParser";
import { Buffer } from "buffer";
const responseParser = new ResponseParser();
const logEnabled = true;

type OnNotifyListener = (command: CommandEnum, data: Uint8Array) => void;

export class BluetoothHelper {
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  public onNotifyListeners: OnNotifyListener[] = [];

  public static SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
  public static CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

  private mutex = new Mutex();

  private characteristicCallback = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target?.value;
    if (!value) return;
    const data = new Uint8Array(
      value.buffer,
      value.byteOffset,
      value.byteLength,
    );
    if (logEnabled) {
      console.log("received data", Buffer.from(data).toString("hex"));
    }
    for (const byte of data) {
      let isValid = responseParser.consume(byte);
      if (isValid) {
        const response = responseParser.getResponse();
        if (response) {
          for (const listener of this.onNotifyListeners) {
            listener(response[0], response.slice(1));
          }
        }
      }
    }
  };

  public connect = async (device: BluetoothDevice): Promise<boolean> => {
    if (!device.gatt) return false;
    const release = await this.mutex.acquire();
    try {
      responseParser.reset();
      this.server = await device.gatt.connect();
      const service = await this.server.getPrimaryService(
        BluetoothHelper.SERVICE_UUID,
      );
      this.characteristic = await service.getCharacteristic(
        BluetoothHelper.CHARACTERISTIC_UUID,
      );
      this.characteristic.addEventListener(
        "characteristicvaluechanged",
        this.characteristicCallback,
      );
      await this.characteristic.startNotifications();
    } catch (error) {
      console.error("error connecting to device", error);
      return false;
    } finally {
      release();
    }
    return true;
  };

  public disconnectDevice = async () => {
    const release = await this.mutex.acquire();
    try {
      await this.closeConnection();
    } finally {
      release();
    }
  };

  private closeConnection = async () => {
    console.log("disconnecting from device");
    // Drop any half-received frame so it can't corrupt the next session.
    responseParser.reset();
    if (this.characteristic) {
      try {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener(
          "characteristicvaluechanged",
          this.characteristicCallback,
        );
      } catch (error) {
        console.log("error stopping notifications");
      }
      this.characteristic = null;
    }
    if (this.server) {
      try {
        await this.server.disconnect();
      } catch (error) {
        console.log("error disconnecting server");
      }
      this.server = null;
    }
  };

  public get isConnected(): boolean {
    return !!this.server?.connected && !!this.characteristic;
  }

  /** Returns false when not connected or the write failed. */
  public sendCommand = async (command: Command): Promise<boolean> => {
    const release = await this.mutex.acquire();
    if (!this.isConnected) {
      release();
      return false;
    }
    try {
      const encodedCommand = command.encode();
      if (logEnabled) {
        console.log(
          "sending command",
          Buffer.from(encodedCommand).toString("hex"),
        );
      }
      await this.characteristic.writeValueWithResponse(
        encodedCommand as BufferSource,
      );
      return true;
    } catch (error) {
      console.log("error sending command");
      return false;
    } finally {
      release();
    }
  };

  public addOnNotifyListener = (listener: OnNotifyListener) => {
    this.onNotifyListeners.push(listener);
  };

  public removeOnNotifyListener = (listener: OnNotifyListener) => {
    this.onNotifyListeners = this.onNotifyListeners.filter(
      (l) => l !== listener,
    );
  };
}

export const bluetoothHelper = new BluetoothHelper();
