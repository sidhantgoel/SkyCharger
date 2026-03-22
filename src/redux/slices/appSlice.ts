import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MachineInfo } from "src/responses/MachineInfo";

interface AppState {
  machineInfo: MachineInfo | null;
  selectedTab: number | null;
}

const initialState: AppState = {
  machineInfo: null,
  selectedTab: 0,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    updateMachineInfo: (state, action: PayloadAction<MachineInfo>) => {
      state.machineInfo = action.payload;
    },
    resetMachineInfo: (state) => {
      state.machineInfo = null;
    },
    updateSelectedTab: (state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    },
    resetSelectedTab: (state) => {
      state.selectedTab = 0;
    },
  },
});

export const {
  updateMachineInfo,
  resetMachineInfo,
  updateSelectedTab,
  resetSelectedTab,
} = appSlice.actions;
export default appSlice;
