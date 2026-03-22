import { ipcRenderer } from "electron";
import { contextBridge, IpcRendererEvent } from "electron/renderer";

contextBridge.exposeInMainWorld("electronAPI", {
  bluetoothSelectDevice: (
    callback: (event: IpcRendererEvent, devices: BluetoothDevice[]) => void,
  ) =>
    ipcRenderer.on("bluetooth-select-device", (event, devices) =>
      callback(event, devices),
    ),
  bluetoothCallback: (deviceId: string) =>
    ipcRenderer.send("bluetooth-callback", deviceId),
});
