import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScanState {
  scanning: boolean;
  devices: Electron.BluetoothDevice[];
}

const initialState: ScanState = {
  scanning: false,
  devices: [],
};

const scanSlice = createSlice({
  name: "scan",
  initialState,
  reducers: {
    updateScanning: (state) => {
      state.scanning = true;
    },
    updateDevices: (
      state,
      action: PayloadAction<Electron.BluetoothDevice[]>,
    ) => {
      state.devices = action.payload;
    },
    stopScanning: (state) => {
      state.scanning = false;
    },
    resetDevices: (state) => {
      state.devices = [];
      state.scanning = false;
    },
  },
});

export const { updateScanning, updateDevices, stopScanning, resetDevices } =
  scanSlice.actions;
export default scanSlice;
