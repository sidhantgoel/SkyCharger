import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MachineInfo } from "src/responses/MachineInfoResponse";

interface ConnectionState {
  deviceId: string;
  connected: boolean;
  connecting: boolean;
}

const initialState: ConnectionState = {
  deviceId: "",
  connected: false,
  connecting: false,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    selectDevice: (state, action: PayloadAction<string>) => {
      state.deviceId = action.payload;
    },
    updateConnecting: (state) => {
      state.connecting = true;
      state.connected = false;
    },
    updateConnected: (state) => {
      state.connecting = false;
      state.connected = true;
    },
    updateDisconnected: (state) => {
      state.connecting = false;
      state.connected = false;
      state.deviceId = "";
    },
  },
});

export const {
  selectDevice,
  updateConnecting,
  updateConnected,
  updateDisconnected,
} = connectionSlice.actions;
export default connectionSlice;
