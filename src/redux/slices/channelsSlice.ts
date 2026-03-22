import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChannelBasicInfo } from "src/responses/ChannelBasicInfo";
import {
  BATTERY_TYPE_ATTR,
  BatteryChemistry,
  BatteryType,
} from "src/enums/BatteryTypes";
import { ChannelWorkingInfo } from "src/responses/ChannelWorkingInfo";
import { ChargingChannel } from "src/enums/ChargingChannels";
import {
  getOperationModes,
  OPERATION_MODE_DISPLAY_NAMES,
  OperationMode,
} from "src/enums/OperationModes";
import { DEVICE_ATTR, DeviceType } from "src/enums/DeviceTypes";
import { VoltageInfo } from "src/responses/QueryVoltageInfoResponse";

interface ChargeParameterOption {
  value: number;
  default: boolean;
}

interface ChargingOptionsState {
  batteryType: BatteryType;
  batteryChemistry: BatteryChemistry;
  operationModes: OperationMode[];
  operationMode: OperationMode;
  cellCount: number;
  chargeVoltageOptions: ChargeParameterOption[];
  chargeCurrentOptions: ChargeParameterOption[];
  dischargeCurrentOptions: ChargeParameterOption[];
  chargeVoltage: number;
  chargeCurrent: number;
  dischargeCurrent: number;
  chargeCurrentVisible: boolean;
  dischargeCurrentVisible: boolean;
}

interface ChannelState {
  channel: ChargingChannel;
  basicInfo: ChannelBasicInfo | null;
  workingInfo: ChannelWorkingInfo | null;
  voltageInfo: VoltageInfo | null;
  chargingOptions: ChargingOptionsState;
}

interface ChannelsState {
  channels: ChargingChannel[];
  channelStates: ChannelState[];
  passwordRequired: boolean;
}

const initialState: ChannelsState = {
  channels: [],
  channelStates: [],
  passwordRequired: false,
};

const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    createChannels: (state, action: PayloadAction<ChargingChannel[]>) => {
      state.channels = [...action.payload];
      state.channelStates = action.payload.map(
        (channel): ChannelState => ({
          channel: channel,
          basicInfo: null,
          workingInfo: null,
          voltageInfo: null,
          chargingOptions: null,
        }),
      );
    },
    updateBasicInfo: (
      state,
      action: PayloadAction<{
        basicInfo: ChannelBasicInfo;
        deviceType: DeviceType;
      }>,
    ) => {
      const { basicInfo, deviceType } = action.payload;
      if (!basicInfo.checkPassword) {
        state.passwordRequired = true;
        return;
      }
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === basicInfo.channel,
      );
      if (!channelData) return;
      if (!channelData.basicInfo) {
        channelsSlice.caseReducers.updateBatteryType(state, {
          type: "channels/updateBatteryType",
          payload: {
            channel: basicInfo.channel,
            batteryType: basicInfo.batteryType,
            deviceType: deviceType,
          },
        });
      }
      channelData.basicInfo = basicInfo;
    },
    updateWorkingInfo: (state, action: PayloadAction<ChannelWorkingInfo>) => {
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === action.payload.channel,
      );
      if (!channelData) return;
      channelData.workingInfo = action.payload;
    },
    updateVoltageInfo: (state, action: PayloadAction<VoltageInfo>) => {
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === action.payload.channel,
      );
      if (!channelData) return;
      channelData.voltageInfo = action.payload;
    },
    resetChannels: (state) => {
      state.channels = [];
      state.passwordRequired = false;
    },
    updateBatteryType: (
      state,
      action: PayloadAction<{
        channel: ChargingChannel;
        batteryType: BatteryType;
        deviceType: DeviceType;
      }>,
    ) => {
      const { channel, batteryType, deviceType } = action.payload;
      const newChemistry =
        BATTERY_TYPE_ATTR[batteryType]?.chemistry ?? BatteryChemistry.LITHIUM;
      const newModes = getOperationModes(newChemistry);
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const chargeVoltageAttr =
        BATTERY_TYPE_ATTR[batteryType]?.chargeVoltageAttr;
      let chargeVoltageRows: ChargeParameterOption[] = [];
      if (chargeVoltageAttr) {
        for (
          let i = chargeVoltageAttr.min;
          chargeVoltageAttr.max < 0
            ? i >= chargeVoltageAttr.max
            : i <= chargeVoltageAttr.max;
          i += chargeVoltageAttr.step
        ) {
          chargeVoltageRows.push({
            value: i,
            default: i === chargeVoltageAttr.default,
          });
        }
      }
      const defaultChargeVoltage =
        chargeVoltageRows.find((row) => row.default)?.value ?? 0;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        batteryType: batteryType,
        batteryChemistry: newChemistry,
        operationModes: newModes,
        cellCount: 1,
        chargeVoltageOptions: chargeVoltageRows,
        chargeVoltage: defaultChargeVoltage,
      };
      channelData.chargingOptions = newChargingOptions;
      channelsSlice.caseReducers.updateOperationMode(state, {
        type: "channels/updateOperationMode",
        payload: {
          channel: channel,
          operationMode: newModes[0],
          deviceType: deviceType,
        },
      });
    },
    updateOperationMode: (
      state,
      action: PayloadAction<{
        channel: ChargingChannel;
        operationMode: OperationMode;
        deviceType: DeviceType;
      }>,
    ) => {
      const { channel, operationMode, deviceType } = action.payload;
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const operationModeAttr = OPERATION_MODE_DISPLAY_NAMES[operationMode];
      const chargeCurrentAttr = DEVICE_ATTR[deviceType]?.chargeCurrentAttr;
      let chargeCurrentRows: ChargeParameterOption[] = [];
      if (chargeCurrentAttr) {
        for (
          let i = chargeCurrentAttr.min;
          i <= chargeCurrentAttr.max;
          i += chargeCurrentAttr.step
        ) {
          chargeCurrentRows.push({
            value: i,
            default: i === chargeCurrentAttr.default,
          });
        }
      }
      const defaultChargeCurrent =
        chargeCurrentRows.find((row) => row.default)?.value ?? 0;
      const dischargeCurrentAttr =
        DEVICE_ATTR[deviceType]?.dischargeCurrentAttr;
      let dischargeCurrentRows: ChargeParameterOption[] = [];
      if (dischargeCurrentAttr) {
        for (
          let i = dischargeCurrentAttr.min;
          i <= dischargeCurrentAttr.max;
          i += dischargeCurrentAttr.step
        ) {
          dischargeCurrentRows.push({
            value: i,
            default: i === dischargeCurrentAttr.default,
          });
        }
      }
      const defaultDischargeCurrent =
        dischargeCurrentRows.find((row) => row.default)?.value ?? 0;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        operationMode: operationMode,
        chargeCurrentVisible: operationModeAttr.requireChargeCurrent,
        dischargeCurrentVisible: operationModeAttr.requireDischargeCurrent,
        chargeCurrentOptions: chargeCurrentRows,
        dischargeCurrentOptions: dischargeCurrentRows,
        chargeCurrent: defaultChargeCurrent,
        dischargeCurrent: defaultDischargeCurrent,
      };
      channelData.chargingOptions = newChargingOptions;
    },
    updateCellCount: (
      state,
      action: PayloadAction<{ channel: ChargingChannel; cellCount: number }>,
    ) => {
      const { channel, cellCount } = action.payload;
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        cellCount: cellCount,
      };
      channelData.chargingOptions = newChargingOptions;
    },
    updateChargeVoltage: (
      state,
      action: PayloadAction<{
        channel: ChargingChannel;
        chargeVoltage: number;
      }>,
    ) => {
      const { channel, chargeVoltage } = action.payload;
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        chargeVoltage: chargeVoltage,
      };
      channelData.chargingOptions = newChargingOptions;
    },
    updateChargeCurrent: (
      state,
      action: PayloadAction<{
        channel: ChargingChannel;
        chargeCurrent: number;
      }>,
    ) => {
      const { channel, chargeCurrent } = action.payload;
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        chargeCurrent: chargeCurrent,
      };
      channelData.chargingOptions = newChargingOptions;
    },
    updateDischargeCurrent: (
      state,
      action: PayloadAction<{
        channel: ChargingChannel;
        dischargeCurrent: number;
      }>,
    ) => {
      const { channel, dischargeCurrent } = action.payload;
      const channelData = state.channelStates.find(
        (channelData) => channelData.channel === channel,
      );
      if (!channelData) return;
      const newChargingOptions = {
        ...channelData.chargingOptions,
        dischargeCurrent: dischargeCurrent,
      };
      channelData.chargingOptions = newChargingOptions;
    },
  },
});

export const {
  createChannels,
  updateBasicInfo,
  updateWorkingInfo,
  updateVoltageInfo,
  resetChannels,
  updateBatteryType,
  updateOperationMode,
  updateCellCount,
  updateChargeVoltage,
  updateChargeCurrent,
  updateDischargeCurrent,
} = channelsSlice.actions;
export default channelsSlice;
