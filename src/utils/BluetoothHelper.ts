import { Mutex } from "async-mutex";
import { Command } from "src/commands/Command";
import { CommandEnum } from "src/enums/Commands";
import { ResponseParser } from "src/utils/ResponseParser";
import { Buffer } from "buffer";
const responseParser = new ResponseParser();

type OnNotifyListener = (command: CommandEnum, data: Uint8Array) => void;

export class BluetoothHelper {
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  public onNotifyListeners: OnNotifyListener[] = [];

  public static SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
  public static CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";

  private mutex = new Mutex();

  private charecteristicCallback = (event: Event) => {
    const target = event.target as BluetoothRemoteGATTCharacteristic;
    const value = target?.value;
    if (!value) return;
    const data = new Uint8Array(
      value.buffer,
      value.byteOffset,
      value.byteLength,
    );
    console.log("Received data: " + Buffer.from(data).toString("hex"));
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
    if (!device.gatt) return;
    const release = await this.mutex.acquire();
    try {
      this.server = await device.gatt.connect();
      const service = await this.server.getPrimaryService(
        BluetoothHelper.SERVICE_UUID,
      );
      this.characteristic = await service.getCharacteristic(
        BluetoothHelper.CHARACTERISTIC_UUID,
      );
      this.characteristic.addEventListener(
        "characteristicvaluechanged",
        this.charecteristicCallback,
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
    console.log("disconnecting from device");
    if (this.characteristic) {
      try {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener(
          "characteristicvaluechanged",
          this.charecteristicCallback,
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
    release();
  };

  public sendCommand = async (command: Command) => {
    const release = await this.mutex.acquire();
    if (!this.server?.connected || !this.characteristic) {
      release();
      return;
    }
    try {
      const encodedCommand = command.encode();
      console.log(
        "Sending command: " + Buffer.from(encodedCommand).toString("hex"),
      );
      await this.characteristic.writeValueWithResponse(
        encodedCommand as BufferSource,
      );
    } catch (error) {
      console.log("error sending command");
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
