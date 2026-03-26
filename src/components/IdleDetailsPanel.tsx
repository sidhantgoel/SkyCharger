import { Grid, Typography } from "@mui/material";
import * as d3 from "d3";
import { useSelector } from "react-redux";
import { BATTERY_TYPE_ATTR } from "src/enums/BatteryTypes";
import { RootState } from "src/redux/store";
import BatteryAnimation from "./BatteryAnimation";
import ChargingPanel from "./ChargingPanel";

interface ChannelDetailsPanelProps {
  index: number;
  refresh: () => void;
}

export default function ChannelDetailsPanel({
  index,
  refresh,
}: ChannelDetailsPanelProps) {
  const basicInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].basicInfo,
  );
  const workingInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].workingInfo,
  );
  const voltageInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].voltageInfo,
  );
  const voltages = voltageInfo?.voltages;
  const resistances = voltageInfo?.resistances;
  const batteryPercentages =
    voltages?.map((voltage) =>
      BATTERY_TYPE_ATTR[basicInfo.batteryType].voltsToPersentage(
        voltage / 1000.0,
      ),
    ) ?? [];
  const batteryCells = batteryPercentages.map((percentage) =>
    percentage > 0 ? Math.floor(percentage / 20) : 0,
  );
  const batteryColours = batteryPercentages.map((percentage) => {
    const toColor = "rgb(9,175,84)";
    const fromColor = "rgb(255,0,0)";
    const color = d3.interpolateRgb(fromColor, toColor)(percentage / 100);
    return color;
  });
  const voltage = voltageInfo?.totalVoltage;
  const resistance = voltageInfo?.totalResistance;
  const batteryPercentage = BATTERY_TYPE_ATTR[
    basicInfo.batteryType
  ].voltsToPersentage(voltage / voltages?.length / 1000.0);
  const batteryCell =
    batteryPercentage > 0 ? Math.floor(batteryPercentage / 20) : 0;
  const batteryColour = d3.interpolateRgb(
    "rgb(255,0,0)",
    "rgb(9,175,84)",
  )(batteryPercentage / 100);

  return (
    <Grid container direction="row" spacing={2}>
      <Grid container direction={"column"} size={6}>
        {basicInfo && workingInfo && voltageInfo && (
          <Grid container direction={"row"} padding={2} spacing={1}>
            {voltage > 0 && (
              <Grid container direction={"row"} spacing={2} size={12}>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <BatteryAnimation
                    height={40}
                    width={76}
                    charging={false}
                    startFromBar={batteryCell}
                    barColor={batteryColour}
                  />
                </Grid>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">
                    {Number(batteryPercentage).toFixed(2)}%
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">
                    {Number(voltage / 1000).toFixed(3)} V
                  </Typography>
                </Grid>
                <Grid
                  container
                  size={3}
                  alignItems={"center"}
                  justifyContent={"center"}
                >
                  <Typography variant="h5">{resistance} mΩ</Typography>
                </Grid>
              </Grid>
            )}
            {voltages &&
              voltages.length > 1 &&
              batteryCells.map((cell, index) => (
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
                      height={36}
                      width={64}
                      charging={false}
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
        <ChargingPanel index={index} refresh={refresh} />
      </Grid>
    </Grid>
  );
}
