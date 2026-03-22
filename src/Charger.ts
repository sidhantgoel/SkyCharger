import { CommandEnum } from "./enums/Commands";
import { DEVICE_ATTR, DeviceType } from "./enums/DeviceTypes";
import {
  resetMachineInfo,
  updateMachineInfo,
  updateSelectedTab,
} from "./redux/slices/appSlice";
import {
  createChannels,
  resetChannels,
  updateWorkingInfo,
} from "./redux/slices/channelsSlice";
import {
  updateConnected,
  updateConnecting,
  updateDisconnected,
} from "./redux/slices/connectionSlice";
import {
  updateScanning,
  stopScanning,
  updateDevices,
  resetDevices,
} from "./redux/slices/scanSlice";
import { parseBasicInfo } from "./responses/ChannelBasicInfo";
import { parseChannelWorkingInfo } from "./responses/ChannelWorkingInfo";
import { parseMachineInfo } from "./responses/MachineInfo";
import { bluetoothHelper, BluetoothHelper } from "./utils/BluetoothHelper";
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { updateBasicInfo } from "./redux/thunks";
import { MachineInfoCommand } from "./commands/MachineInfoCommand";
import { ChargingChannel } from "./enums/ChargingChannels";
import { QueryBasicInfoCommand } from "./commands/QueryBasicInfoCommand";
import { QueryChannelStatusCommand } from "./commands/QueryChannelStatusCommand";
import { IpcRendererEvent } from "electron/renderer";

const dispatch = useDispatch<AppDispatch>();

declare const window: Window & {
  electronAPI: {
    bluetoothSelectDevice: (
      callback: (
        event: IpcRendererEvent,
        devices: Electron.BluetoothDevice[],
      ) => void,
    ) => void;
    bluetoothCallback: (deviceId: string) => void;
  };
};

class Charger {
  private deviceType: DeviceType;
  private timeout: NodeJS.Timeout | null = null;

  public constructor() {}

  notify(command: CommandEnum, data: Uint8Array) {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = null;
    switch (command) {
      case CommandEnum.INFO:
        const machineInfo = parseMachineInfo(data);
        if (machineInfo) {
          dispatch(updateMachineInfo(machineInfo));
          dispatch(
            createChannels(DEVICE_ATTR[machineInfo.deviceType].channels),
          );
          dispatch(updateSelectedTab(0));
          dispatch(updateConnected());
        }
        break;
      case CommandEnum.QUERY_BASIC_INFO:
        const basicInfo = parseBasicInfo(data);
        if (basicInfo) {
          dispatch(updateBasicInfo(basicInfo));
        }
        break;
      case CommandEnum.QUERY_CHANNEL_STATUS:
        const workingInfo = parseChannelWorkingInfo(data);
        if (workingInfo) {
          dispatch(updateWorkingInfo(workingInfo));
        }
        break;
      default:
        break;
    }
  }

  async sendInfoCommand() {
    await bluetoothHelper.sendCommand(new MachineInfoCommand());
    this.timeout = setTimeout(this.sendInfoCommand, 100);
  }

  async discoverDevices() {
    dispatch(updateScanning());
    const selectedDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [BluetoothHelper.SERVICE_UUID],
    });
    dispatch(stopScanning());
    await bluetoothHelper.connect(selectedDevice);
    bluetoothHelper.addOnNotifyListener(this.notify);
    await this.sendInfoCommand();
  }

  begin() {
    window.electronAPI.bluetoothSelectDevice((event, devices) => {
      dispatch(updateDevices(devices));
    });
  }

  async disconnectDevice() {
    await bluetoothHelper.disconnectDevice();
    dispatch(updateDisconnected());
    dispatch(resetChannels());
    dispatch(resetDevices());
    dispatch(resetMachineInfo());
  }

  async connectDevice(deviceId: string) {
    dispatch(updateConnecting());
    window.electronAPI.bluetoothCallback(deviceId);
  }

  async getChannelInfo(channel: ChargingChannel, password: string) {
    await bluetoothHelper.sendCommand(
      new QueryBasicInfoCommand(channel, password),
    );
    await bluetoothHelper.sendCommand(new QueryChannelStatusCommand(channel));
  }
}

export default new Charger();
