import { ChannelBasicInfo } from "src/responses/ChannelBasicInfo";
import {
  resetChannels,
  updateBasicInfo as updateBasicInfoAction,
} from "./slices/channelsSlice";
import { RootState, store } from "./store";
import { ThunkAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { resetDevices } from "./slices/scanSlice";
import { resetMachineInfo } from "./slices/appSlice";
import { updateDisconnected } from "./slices/connectionSlice";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { resetAuthentication } from "./slices/authenticationSlice";

export const updateBasicInfo =
  (
    basicInfo: ChannelBasicInfo,
  ): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async (
    dispatch: ThunkDispatch<RootState, undefined, UnknownAction>,
    getState: () => RootState,
  ) => {
    const state = getState() as RootState;
    const deviceType = state.app.machineInfo?.deviceType;
    if (!deviceType) {
      throw new Error("Device type not found");
    }
    dispatch(
      updateBasicInfoAction({ basicInfo: basicInfo, deviceType: deviceType }),
    );
  };

export const disconnectDevice =
  (): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async (
    dispatch: ThunkDispatch<RootState, undefined, UnknownAction>,
    getState: () => RootState,
  ) => {
    await bluetoothHelper.disconnectDevice();
    dispatch(updateDisconnected());
    dispatch(resetChannels());
    dispatch(resetDevices());
    dispatch(resetMachineInfo());
    dispatch(resetAuthentication());
  };
