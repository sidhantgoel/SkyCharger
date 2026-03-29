import { Box, Button, Grid, Typography } from "@mui/material";
import * as d3 from "d3";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { BATTERY_TYPE_ATTR } from "src/enums/BatteryTypes";
import { CommandEnum } from "src/enums/Commands";
import {
  getOperationMode,
  OPERATION_MODE_DISPLAY_NAMES,
} from "src/enums/OperationModes";
import { store } from "src/redux/store";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import BatteryAnimation from "./BatteryAnimation";

interface FinishedPanelProps {
  index: number;
  refresh: () => void;
}

type RootState = ReturnType<typeof store.getState>;

export default function FinishedPanel({ index, refresh }: FinishedPanelProps) {
  const channel = useSelector(
    (state: RootState) => state.channels.channels[index],
  );
  const basicInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].basicInfo,
  );
  const workingInfo = useSelector(
    (state: RootState) => state.channels.channelStates[index].workingInfo,
  );
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const voltages = workingInfo.cellVoltages.filter((voltage) => voltage >= 100);
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
  const operationMode = getOperationMode(
    BATTERY_TYPE_ATTR[basicInfo.batteryType].chemistry,
    basicInfo.model,
  );
  const voltage = workingInfo.voltage;
  const batteryPercentage = BATTERY_TYPE_ATTR[
    basicInfo.batteryType
  ].voltsToPersentage(
    voltage / (voltages?.length === 0 ? 1 : voltages?.length) / 1000.0,
  );
  const batteryCell =
    batteryPercentage > 0 ? Math.floor(batteryPercentage / 20) : 0;
  const batteryColour = d3.interpolateRgb(
    "rgb(255,0,0)",
    "rgb(9,175,84)",
  )(batteryPercentage / 100);
  const notify = (command: CommandEnum, data: Uint8Array): void => {
    switch (command) {
      case CommandEnum.STOP_CHARGE:
        refresh();
        break;
      default:
        break;
    }
  };
  useEffect(() => {
    bluetoothHelper.addOnNotifyListener(notify);
    return () => {
      bluetoothHelper.removeOnNotifyListener(notify);
    };
  }, []);
  const stopCharge = () => {
    setButtonDisabled(true);
    const command = new StopChargeCommand(channel);
    bluetoothHelper.sendCommand(command);
  };
  return (
    <Grid
      container
      direction="column"
      spacing={2}
      padding={2}
      size={12}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Grid
        container
        direction={"row"}
        spacing={2}
        size={12}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Typography variant="h5">
          Finished: {BATTERY_TYPE_ATTR[basicInfo.batteryType].displayName} /{" "}
          {basicInfo.cellCount}S /{" "}
          {OPERATION_MODE_DISPLAY_NAMES[operationMode]?.displayName}
        </Typography>
      </Grid>
      <Grid container direction={"row"} spacing={2} size={12}>
        <Grid container direction={"column"} size={6}>
          {basicInfo && workingInfo && (
            <Grid container direction={"column"} spacing={1}>
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
                      barAppearIntervalS={0.5}
                      animateSingleBar={false}
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
                  ></Grid>
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
                    ></Grid>
                  </Grid>
                ))}
            </Grid>
          )}
        </Grid>
        <Grid size={6}>
          <Box
            sx={{ width: "100%", height: "100%", border: "1px dashed grey" }}
            padding={1}
          >
            <Typography variant="h5">
              Capacity: {workingInfo.capacity} mAh
            </Typography>
            <Typography variant="h5">
              Duration: {Math.floor(workingInfo.durationSeconds / 60)}:
              {Math.floor(workingInfo.durationSeconds % 60)
                .toString()
                .padStart(2, "0")}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      <Button
        disabled={buttonDisabled}
        loading={buttonDisabled}
        variant="contained"
        color="success"
        style={{ position: "absolute", bottom: 80, right: 20 }}
        onClick={stopCharge}
      >
        Done
      </Button>
    </Grid>
  );
}
