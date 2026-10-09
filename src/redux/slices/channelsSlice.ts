import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BATTERY_TYPE_ATTR,
  BatteryChemistry,
  BatteryType,
} from "src/enums/BatteryTypes";
import {
  ChargingChannel,
  findChannelForMask,
} from "src/enums/ChargingChannels";
import {
  DeviceType,
  getSupportedBatteryTypes,
  MinMaxStepDefaultAttr,
} from "src/enums/DeviceTypes";
import {
  ChargeParameterEnum,
  getOperationMode,
  getOperationModes,
  OperationMode,
} from "src/enums/OperationModes";
import { ChannelBasicInfo } from "src/responses/ChannelBasicInfoResponse";
import { ChannelWorkingInfo } from "src/responses/ChannelWorkingInfoResponse";
import { SystemInfo } from "src/responses/QuerySystemInfoResponse";
import { VoltageInfo } from "src/responses/QueryVoltageInfoResponse";

interface ChargeParameterOption {
  value: number;
  default: boolean;
}

interface ChargeParameter {
  value: number;
  options: ChargeParameterOption[];
}

interface ChargingOptionsState {
  batteryType: BatteryType;
  batteryChemistry: BatteryChemistry;
  operationModes: OperationMode[];
  operationMode: OperationMode;
  cellCount: number;
  parameters: ChargeParameter[];
}

interface ChannelState {
  basicInfo: ChannelBasicInfo | null;
  workingInfo: ChannelWorkingInfo | null;
  workingInfoTimestamp: number;
  voltageInfo: VoltageInfo | null;
}

interface ChannelsState {
  channels: ChargingChannel[];
  channelStates: ChannelState[];
  chargingOptions: ChargingOptionsState[];
  systemInfos: (SystemInfo | null)[];
}

const initialState: ChannelsState = {
  channels: [],
  channelStates: [],
  chargingOptions: [],
  systemInfos: [],
};

const getOptions = (attr: MinMaxStepDefaultAttr): ChargeParameter | null => {
  if (attr) {
    const parameter: ChargeParameter = {
      value: 0,
      options: [],
    };
    for (let i = attr.min; i <= attr.max; i += attr.step) {
      parameter.options.push({ value: i, default: i === attr.default });
    }
    parameter.value =
      parameter.options.find((option) => option.default)?.value ?? 0;
    return parameter;
  }
  return null;
};

const channelsSlice = createSlice({
  name: "channels",
  initialState,
  reducers: {
    createChannels: (state, action: PayloadAction<ChargingChannel[]>) => {
      state.channels = [...action.payload];
      state.channelStates = action.payload.map((channel): ChannelState => ({
        basicInfo: null,
        workingInfo: null,
        voltageInfo: null,
        workingInfoTimestamp: null,
      }));
      state.chargingOptions = action.payload.map(
        (channel): ChargingOptionsState => ({
          batteryType: null,
          batteryChemistry: null,
          operationModes: [],
          operationMode: null,
          cellCount: 0,
          parameters: [],
        }),
      );
      state.systemInfos = action.payload.map((channel): SystemInfo => null);
    },
    updateBasicInfo: (
      state,
      action: PayloadAction<{
        index: number;
        basicInfo: ChannelBasicInfo;
        deviceType: DeviceType;
        version: number;
      }>,
    ) => {
      const { index, basicInfo, deviceType, version } = action.payload;
      const channelData = state.channelStates[index];
      if (basicInfo.channel !== state.channels[index]) {
        return;
      }
      if (!channelData.basicInfo) {
        channelsSlice.caseReducers.updateBatteryType(state, {
          type: "channels/updateBatteryType",
          payload: {
            index: index,
            batteryType: basicInfo.batteryType,
            deviceType: deviceType,
            version: version,
          },
        });
        channelsSlice.caseReducers.updateOperationMode(state, {
          type: "channels/updateOperationMode",
          payload: {
            index: index,
            operationMode: getOperationMode(
              BATTERY_TYPE_ATTR[basicInfo.batteryType]?.chemistry,
              basicInfo.model,
            ),
            deviceType: deviceType,
            version: version,
          },
        });
        channelsSlice.caseReducers.updateCellCount(state, {
          type: "channels/updateCellCount",
          payload: {
            index: index,
            cellCount: basicInfo.cellCount,
          },
        });
        channelsSlice.caseReducers.updateChargeParameter(state, {
          type: "channels/updateChargeParameter",
          payload: {
            index: index,
            parameter: ChargeParameterEnum.CHARGE_CURRENT,
            value: basicInfo.chargeMax,
          },
        });
        channelsSlice.caseReducers.updateChargeParameter(state, {
          type: "channels/updateChargeParameter",
          payload: {
            index: index,
            parameter: ChargeParameterEnum.DISCHARGE_CURRENT,
            value: basicInfo.dischargeMax,
          },
        });
      }
      channelData.basicInfo = basicInfo;
    },
    updateWorkingInfo: (
      state,
      action: PayloadAction<{
        index: number;
        workingInfo: ChannelWorkingInfo;
      }>,
    ) => {
      const { index, workingInfo } = action.payload;
      if (workingInfo.channel !== state.channels[index]) {
        return;
      }
      const channelData = state.channelStates[index];
      channelData.workingInfo = workingInfo;
      channelData.workingInfoTimestamp = Math.floor(
        new Date().getTime() / 1000,
      );
    },
    updateSystemInfo: (state, action: PayloadAction<SystemInfo>) => {
      // Store by the channel the reply is for, not by whoever dispatched it.
      const systemInfo = action.payload;
      const index = state.channels.indexOf(
        findChannelForMask(systemInfo.channel),
      );
      if (index === -1) return;
      state.systemInfos[index] = systemInfo;
    },
    updateVoltageInfo: (
      state,
      action: PayloadAction<{
        index: number;
        voltageInfo: VoltageInfo;
      }>,
    ) => {
      const { index, voltageInfo } = action.payload;
      if (voltageInfo.channel !== state.channels[index]) {
        return;
      }
      const channelData = state.channelStates[index];
      channelData.voltageInfo = voltageInfo;
    },
    resetChannels: (state) => {
      state.channels = [];
      state.channelStates = [];
      state.chargingOptions = [];
      state.systemInfos = [];
    },
    updateBatteryType: (
      state,
      action: PayloadAction<{
        index: number;
        batteryType: BatteryType;
        deviceType: DeviceType;
        version: number;
      }>,
    ) => {
      const { index, batteryType, deviceType, version } = action.payload;
      const newChemistry =
        BATTERY_TYPE_ATTR[batteryType]?.chemistry ?? BatteryChemistry.LITHIUM;
      // Only offer modes the device has settings for; if the device lists no
      // settings for this battery type, fall back to every mode of the chemistry.
      const supportedModes = getSupportedBatteryTypes(deviceType, version)?.[
        batteryType
      ];
      const chemistryModes = getOperationModes(newChemistry);
      const filteredModes = chemistryModes.filter(
        (mode) => !supportedModes || supportedModes[mode],
      );
      const newModes =
        filteredModes.length > 0 ? filteredModes : chemistryModes;
      const chargingOptions = state.chargingOptions[index];
      const newChargingOptions = {
        ...chargingOptions,
        batteryType: batteryType,
        batteryChemistry: newChemistry,
        operationModes: newModes,
        cellCount: 1,
      };
      state.chargingOptions[index] = newChargingOptions;
      channelsSlice.caseReducers.updateOperationMode(state, {
        type: "channels/updateOperationMode",
        payload: {
          index: index,
          operationMode: newModes[0],
          deviceType: deviceType,
          version: version,
        },
      });
    },
    updateOperationMode: (
      state,
      action: PayloadAction<{
        index: number;
        operationMode: OperationMode;
        deviceType: DeviceType;
        version: number;
      }>,
    ) => {
      const { index, operationMode, deviceType, version } = action.payload;
      const chargingOptions = state.chargingOptions[index];
      const attr = getSupportedBatteryTypes(deviceType, version)?.[
        chargingOptions.batteryType
      ]?.[operationMode];
      const parameters = [];
      parameters[ChargeParameterEnum.CHARGE_CURRENT] = getOptions(
        attr?.chargeCurrent,
      );
      parameters[ChargeParameterEnum.DISCHARGE_CURRENT] = getOptions(
        attr?.dischargeCurrent,
      );
      parameters[ChargeParameterEnum.CHARGE_VOLTAGE] = getOptions(
        attr?.chargeVoltage,
      );
      parameters[ChargeParameterEnum.DISCHARGE_VOLTAGE] = getOptions(
        attr?.dischargeVoltage,
      );
      parameters[ChargeParameterEnum.CYCLE_MODEL] = getOptions(
        attr?.cycleModel,
      );
      parameters[ChargeParameterEnum.CYCLE_NUMBER] = getOptions(
        attr?.cycleNumber,
      );
      parameters[ChargeParameterEnum.REPEAK_NUMBER] = getOptions(
        attr?.repeakNumber,
      );
      parameters[ChargeParameterEnum.TRACK_VOLTAGE] = getOptions(
        attr?.trackVoltage,
      );
      parameters[ChargeParameterEnum.VOLTAGE] = getOptions(attr?.voltage);
      const newChargingOptions: ChargingOptionsState = {
        ...chargingOptions,
        operationMode: operationMode,
        parameters: parameters,
      };
      state.chargingOptions[index] = newChargingOptions;
    },
    updateCellCount: (
      state,
      action: PayloadAction<{ index: number; cellCount: number }>,
    ) => {
      const { index, cellCount } = action.payload;
      const chargingOptions = state.chargingOptions[index];
      const newChargingOptions = {
        ...chargingOptions,
        cellCount: cellCount,
      };
      state.chargingOptions[index] = newChargingOptions;
    },
    updateChargeParameter: (
      state,
      action: PayloadAction<{
        index: number;
        parameter: number;
        value: number;
      }>,
    ) => {
      const { index, parameter, value } = action.payload;
      const chargingOptions = state.chargingOptions[index];
      if (!chargingOptions.parameters[parameter]) {
        return;
      }
      chargingOptions.parameters[parameter].value = value;
      state.chargingOptions[index] = chargingOptions;
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
  updateChargeParameter,
  updateSystemInfo,
} = channelsSlice.actions;
export default channelsSlice;
