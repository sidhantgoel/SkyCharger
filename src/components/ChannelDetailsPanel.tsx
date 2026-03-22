import {
  Alert,
  AlertTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { BATTERY_TYPE_ATTR } from "src/enums/BatteryTypes";
import {
  ChannelWorkingState,
  STATE_MESSAGES,
} from "src/enums/ChannelWorkingStates";
import { ChargingChannel } from "src/enums/ChargingChannels";
import { ERROR_MESSAGES } from "src/enums/ErrorCodes";
import {
  getOperationMode,
  OPERATION_MODE_DISPLAY_NAMES,
} from "src/enums/OperationModes";
import { store } from "src/redux/store";
import BatteryAnimation from "./BatteryAnimation";
import { lipoVoltsToPersentage } from "src/utils/BatteryUtils";
import * as d3 from "d3";

interface ChannelDetailsPanelProps {
  channel: ChargingChannel;
}

type RootState = ReturnType<typeof store.getState>;

export default function ChannelDetailsPanel({
  channel,
}: ChannelDetailsPanelProps) {
  const basicInfo = useSelector(
    (state: RootState) =>
      state.channels.channelStates.find((ch) => ch.channel === channel)
        .basicInfo,
  );
  const workingInfo = useSelector(
    (state: RootState) =>
      state.channels.channelStates.find((ch) => ch.channel === channel)
        .workingInfo,
  );
  const voltageInfo = useSelector(
    (state: RootState) =>
      state.channels.channelStates.find((ch) => ch.channel === channel)
        .voltageInfo,
  );
  const deviceType = useSelector(
    (state: RootState) => state.app.machineInfo?.deviceType,
  );
  const batteryPercentages = voltageInfo?.voltages.map((voltage) =>
    lipoVoltsToPersentage(voltage),
  ) ?? [];
  const batteryCells = batteryPercentages.map((percentage) =>
    percentage > 0 ? Math.floor(percentage / 20) : 0,
  );
  const batteryColours = batteryPercentages.map((percentage) => {
        const toColor = "rgb(9,175,84)";
        const fromColor = "rgb(255,0,0)";
        const color = d3.interpolateRgb(fromColor, toColor)(percentage / 100);
        return color;
    }
  );
  return (
    <>
      {basicInfo && workingInfo && voltageInfo && (
        <Grid container direction={"row"} padding={2} spacing={1}>
          <Grid container direction={"row"} spacing={2} size={12}>
            <Grid container direction={"row"} spacing={2} size={3}>
                <Typography variant="h5" align="center">
                {STATE_MESSAGES[basicInfo.workingState]}
                </Typography>
            </Grid>
          </Grid>
          {batteryCells.map((cell, index) => (
            <Grid container direction={"row"} spacing={2} size={12}>
              <Grid size={3}>
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
                <Grid size={3}>
                    <Typography variant="h4" align="center">{voltageInfo.voltages[index] / 1000} V</Typography>
                </Grid>
                <Grid size={3}>
                    <Typography variant="h4" align="center">{voltageInfo.resistances[index]} mΩ</Typography>
                </Grid>
              </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
