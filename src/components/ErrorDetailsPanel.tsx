import { Grid, Typography } from "@mui/material";
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

interface ChannelDetailsPanelProps {
  index: number;
}

type RootState = ReturnType<typeof store.getState>;

export default function ErrorDetailsPanel({ index }: ChannelDetailsPanelProps) {
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

  return (
    <Grid container direction="row" spacing={2}>
      <Grid size={6}>
        {basicInfo &&
          workingInfo &&
          (voltageInfo ||
            workingInfo.workingState !== ChannelWorkingState.IDLE) && (
            <Grid container direction={"row"} padding={2} spacing={1}>
              <Grid container direction={"row"} spacing={2} size={12}>
                <Grid
                  container
                  direction={"row"}
                  spacing={2}
                  size={4}
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
      </Grid>
      <Grid size={6}>
        <ChargingPanel index={index} />
      </Grid>
    </Grid>
  );
}
