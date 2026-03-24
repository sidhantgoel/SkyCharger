import { Fab, Grid, Typography } from "@mui/material";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import {
  ChannelWorkingState,
  STATE_MESSAGES,
} from "src/enums/ChannelWorkingStates";
import { store } from "src/redux/store";
import { lipoVoltsToPersentage } from "src/utils/BatteryUtils";
import BatteryAnimation from "./BatteryAnimation";
import ChargingPanel from "./ChargingPanel";
import { BATTERY_TYPE_ATTR } from "src/enums/BatteryTypes";
import {
  getOperationMode,
  OPERATION_MODE_DISPLAY_NAMES,
} from "src/enums/OperationModes";
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { bluetoothHelper } from "src/utils/BluetoothHelper";

interface ChannelDetailsPanelProps {
  index: number;
}

type RootState = ReturnType<typeof store.getState>;

export default function WorkingDetailsPanel({
  index,
}: ChannelDetailsPanelProps) {
  const channel = useSelector(
    (state: RootState) => state.channels.channels[index],
  );
  const basicInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].basicInfo,
  );
  const workingInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].workingInfo,
  );
  const voltageInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].voltageInfo,
  );
  const voltages =
    workingInfo?.workingState !== ChannelWorkingState.IDLE
      ? workingInfo.cellVoltages.filter((voltage) => voltage >= 100)
      : voltageInfo?.voltages;
  const resistances =
    workingInfo?.workingState !== ChannelWorkingState.IDLE
      ? []
      : voltageInfo?.resistances;
  const batteryPercentages =
    voltages?.map((voltage) => lipoVoltsToPersentage(voltage / 1000.0)) ?? [];
  const batteryCells = batteryPercentages.map((percentage) =>
    percentage > 0 ? Math.floor(percentage / 20) : 0,
  );
  const batteryColours = batteryPercentages.map((percentage) => {
    const toColor = "rgb(9,175,84)";
    const fromColor = "rgb(255,0,0)";
    const color = d3.interpolateRgb(fromColor, toColor)(percentage / 100);
    return color;
  });
  const stopCharge = () => {
    const command = new StopChargeCommand(channel);
    bluetoothHelper.sendCommand(command);
  };
  return (
    <Grid container direction="row" spacing={2} size={12}>
      {basicInfo &&
        workingInfo &&
        (voltageInfo ||
          workingInfo.workingState !== ChannelWorkingState.IDLE) && (
          <Grid container direction={"row"} padding={2} spacing={1} size={12}>
            <Grid container direction={"row"} spacing={2} size={12}>
              <Grid
                container
                direction={"row"}
                spacing={2}
                size={12}
                alignItems={"center"}
                justifyContent={"center"}
              >
                <Typography variant="h5">
                  {BATTERY_TYPE_ATTR[basicInfo.batteryType].displayName} /{" "}
                  {basicInfo.cellCount}S /{" "}
                  {
                    OPERATION_MODE_DISPLAY_NAMES[
                      getOperationMode(
                        BATTERY_TYPE_ATTR[basicInfo.batteryType].chemistry,
                        basicInfo.model,
                      )
                    ]?.displayName
                  }
                </Typography>
              </Grid>
            </Grid>
            {batteryCells.map((cell, index) => (
              <Grid
                container
                direction={"row"}
                spacing={2}
                size={12}
                key={index}
              >
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <BatteryAnimation
                    height={50}
                    width={100}
                    charging={
                      basicInfo.workingState === ChannelWorkingState.WORKING
                    }
                    startFromBar={cell}
                    barColor={batteryColours[index]}
                  />
                </Grid>
                <Grid
                  container
                  direction={"row"}
                  spacing={2}
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">
                    {Number(batteryPercentages[index]).toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">
                    {Number(voltages[index] / 1000).toFixed(3)} V
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  {resistances && resistances.length > index && (
                    <Typography variant="h5">
                      {resistances[index]} mΩ
                    </Typography>
                  )}
                </Grid>
              </Grid>
            ))}
          </Grid>
        )}
      <Fab
        variant="extended"
        color="primary"
        style={{ position: "absolute", bottom: 80, right: 20 }}
        onClick={stopCharge}
      >
        Stop
      </Fab>
    </Grid>
  );
}
