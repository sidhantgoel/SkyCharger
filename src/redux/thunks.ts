import { ChannelBasicInfo } from "src/responses/ChannelBasicInfoResponse";
import {
  resetChannels,
  updateBasicInfo as updateBasicInfoAction,
} from "./slices/channelsSlice";
import { RootState, store } from "./store";
import { ThunkAction, ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import { resetDevices } from "./slices/scanSlice";
import { resetMachineInfo, resetSelectedTab } from "./slices/appSlice";
import { updateDisconnected } from "./slices/connectionSlice";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { resetAuthentication } from "./slices/authenticationSlice";

export const updateBasicInfo =
  (
    index: number,
    basicInfo: ChannelBasicInfo,
  ): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async (
    dispatch: ThunkDispatch<RootState, undefined, UnknownAction>,
    getState: () => RootState,
  ) => {
    const state = getState() as RootState;
    const deviceType = state.app.machineInfo?.deviceType;
    // DeviceType.ACC6 is 0, so check for null/undefined rather than falsy.
    if (deviceType == null) {
      // Can happen when a late reply arrives after disconnecting; nothing to update.
      console.warn("Ignoring basic info: device type not known");
      return;
    }
    dispatch(
      updateBasicInfoAction({
        index: index,
        basicInfo: basicInfo,
        deviceType: deviceType,
        version: state.app.machineInfo.version,
      }),
    );
  };

export const disconnectDevice =
  (): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async (
    dispatch: ThunkDispatch<RootState, undefined, UnknownAction>,
    getState: () => RootState,
  ) => {
    try {
      await bluetoothHelper.disconnectDevice();
    } catch (error) {
      console.error("Error while disconnecting:", error);
    } finally {
      // Always reset the UI, even if the link was already gone.
      dispatch(updateDisconnected());
      dispatch(resetChannels());
      dispatch(resetDevices());
      dispatch(resetMachineInfo());
      dispatch(resetSelectedTab());
      dispatch(resetAuthentication());
    }
  };
