import { Fab, Grid, Typography, Zoom } from "@mui/material";
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
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { bluetoothHelper } from "src/utils/BluetoothHelper";

interface ChannelDetailsPanelProps {
  index: number;
}

const transitionDuration = {
  enter: 500,
  exit: 500,
};
type RootState = ReturnType<typeof store.getState>;

export default function FinishedDetailsPanel({
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
    const color = d3.interpolateRgb(fromColor, toColor)(percentage / 100.0);
    return color;
  });

  const finishChannel = () => {
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
                  {STATE_MESSAGES[basicInfo.workingState]}
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
                  size={4}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <BatteryAnimation
                    height={50}
                    width={100}
                    barAppearIntervalS={0.5}
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
                  size={4}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">
                    {Number(batteryPercentages[index]).toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={4}
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
      <Zoom
        key="finish"
        in={true}
        timeout={transitionDuration}
        style={{
          transitionDelay: `${transitionDuration.enter}ms`,
        }}
        unmountOnExit
      >
        <Fab
          variant="extended"
          color="primary"
          style={{ position: "absolute", bottom: 80, right: 20 }}
          onClick={finishChannel}
        >
          Finish
        </Fab>
      </Zoom>
    </Grid>
  );
}
