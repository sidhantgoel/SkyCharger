import { ipcRenderer } from "electron";
import { contextBridge, IpcRendererEvent } from "electron/renderer";

contextBridge.exposeInMainWorld("electronAPI", {
  // Returns an unsubscribe function so the renderer can remove its listener.
  bluetoothSelectDevice: (
    callback: (event: IpcRendererEvent, devices: BluetoothDevice[]) => void,
  ) => {
    const listener = (event: IpcRendererEvent, devices: BluetoothDevice[]) =>
      callback(event, devices);
    ipcRenderer.on("bluetooth-select-device", listener);
    return () => {
      ipcRenderer.removeListener("bluetooth-select-device", listener);
    };
  },
  bluetoothCallback: (deviceId: string) =>
    ipcRenderer.send("bluetooth-callback", deviceId),
});
