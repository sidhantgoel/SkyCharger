import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { CHANNEL_LABELS, ChargingChannel } from "src/enums/ChargingChannels";
import {
  ChannelWorkingState,
  STATE_MESSAGES,
} from "src/enums/ChannelWorkingStates";
import {
  BATTERY_CHEMISTRY_ATTR,
  BATTERY_TYPE_ATTR,
  BatteryChemistry,
  BatteryType,
} from "src/enums/BatteryTypes";
import { ERROR_MESSAGES } from "src/enums/ErrorCodes";
import { useEffect, useState, type ReactElement } from "react";
import {
  getOperationMode,
  getOperationModes,
  OPERATION_MODE_DISPLAY_NAMES,
  OperationMode,
} from "src/enums/OperationModes";
import { useDispatch, useSelector } from "react-redux";
import { store } from "src/redux/store";
import {
  updateBatteryType,
  updateCellCount,
  updateChargeCurrent,
  updateChargeVoltage,
  updateDischargeCurrent,
  updateOperationMode,
} from "src/redux/slices/channelsSlice";
import Favorite from "@mui/icons-material/Favorite";
import { StartChargeCommand } from "src/commands/StartChargeCommand";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { QueryChannelStatusCommand } from "src/commands/QueryChannelStatusCommand";
import { QueryBasicInfoCommand } from "src/commands/QueryBasicInfoCommand";

interface ChargingPanelProps {
  channel: ChargingChannel;
}

type RootState = ReturnType<typeof store.getState>;

export default function ChargingPanel({ channel }: ChargingPanelProps) {
  const chargingOptions = useSelector(
    (state: RootState) =>
      state.channels.channelStates.find((ch) => ch.channel === channel)
        .chargingOptions,
  );
  const workingState = useSelector(
    (state: RootState) =>
      state.channels.channelStates.find((ch) => ch.channel === channel)
        .workingInfo?.workingState,
  );
  const deviceType = useSelector(
    (state: RootState) => state.app.machineInfo?.deviceType,
  );
  const password = useSelector(
    (state: RootState) => state.authentication.password,
  );
  const dispatch = useDispatch();

  const startCharge = () => {
    const command = new StartChargeCommand(
      channel,
      deviceType,
      chargingOptions?.batteryType,
      chargingOptions?.cellCount,
      chargingOptions?.operationMode,
      chargingOptions?.chargeCurrent,
      chargingOptions?.dischargeCurrent,
      chargingOptions?.chargeVoltage,
      0,
      0,
      0,
      0,
      0,
    );
    bluetoothHelper.sendCommand(command);
  };
  const stopCharge = () => {
    const command = new StopChargeCommand(channel);
    bluetoothHelper.sendCommand(command);
  };
  return (
    <>
      {chargingOptions && (
        <Grid container direction={"row"} spacing={2}>
          <Grid
            container
            size={12}
            direction="column"
            spacing={2}
            paddingRight={2}
          >
            <Grid container direction="row" spacing={2} paddingTop={6}>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel id="battery-type-select-label">
                    Battery Type
                  </InputLabel>
                  <Select
                    label="Battery Type"
                    value={chargingOptions?.batteryType}
                    onChange={(e) =>
                      dispatch(
                        updateBatteryType({
                          channel,
                          batteryType: e.target.value as BatteryType,
                          deviceType,
                        }),
                      )
                    }
                  >
                    {Object.values(BATTERY_TYPE_ATTR).map((attr, index) => (
                      <MenuItem value={index}>{attr.displayName}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel id="operation-mode-select-label">
                    Operation Mode
                  </InputLabel>
                  <Select
                    label="Operation Mode"
                    value={chargingOptions?.operationMode}
                    onChange={(e) =>
                      dispatch(
                        updateOperationMode({
                          channel,
                          operationMode: e.target.value as OperationMode,
                          deviceType,
                        }),
                      )
                    }
                  >
                    {chargingOptions?.operationModes.map((mode) => (
                      <MenuItem value={mode}>
                        {OPERATION_MODE_DISPLAY_NAMES[mode]?.displayName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel id="cell-count-select-label">
                    Cell Count
                  </InputLabel>
                  <Select
                    label="Cell Count"
                    value={chargingOptions?.cellCount}
                    onChange={(e) =>
                      dispatch(
                        updateCellCount({
                          channel,
                          cellCount: e.target.value as number,
                        }),
                      )
                    }
                  >
                    {Array.from({ length: 10 }, (_, index) => (
                      <MenuItem value={index + 1}>{index + 1}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={2}>
              {chargingOptions?.chargeCurrentVisible && (
                <Grid size={4}>
                  <FormControl fullWidth>
                    <InputLabel id="charge-current-select-label">
                      Charge Current
                    </InputLabel>
                    <Select
                      labelId="charge-current-select-label"
                      label="Charge Current"
                      variant="outlined"
                      value={chargingOptions?.chargeCurrent}
                      onChange={(e) =>
                        dispatch(
                          updateChargeCurrent({
                            channel,
                            chargeCurrent: e.target.value as number,
                          }),
                        )
                      }
                    >
                      {chargingOptions?.chargeCurrentOptions.map((row) => (
                        <MenuItem key={row.value} value={row.value}>
                          <ListItemText primary={`${row.value} mA`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {chargingOptions?.dischargeCurrentVisible && (
                <Grid size={4}>
                  <FormControl fullWidth>
                    <InputLabel id="discharge-current-select-label">
                      Discharge Current
                    </InputLabel>
                    <Select
                      labelId="discharge-current-select-label"
                      label="Discharge Current"
                      variant="outlined"
                      value={chargingOptions?.dischargeCurrent}
                      onChange={(e) =>
                        dispatch(
                          updateDischargeCurrent({
                            channel,
                            dischargeCurrent: e.target.value as number,
                          }),
                        )
                      }
                    >
                      {chargingOptions?.dischargeCurrentOptions.map((row) => (
                        <MenuItem key={row.value} value={row.value}>
                          <ListItemText primary={`${row.value} mA`} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Grid size={4}>
                <FormControl fullWidth>
                  <InputLabel id="charge-voltage-select-label">
                    Charge Voltage
                  </InputLabel>
                  <Select
                    labelId="charge-voltage-select-label"
                    label="Charge Voltage"
                    variant="outlined"
                    renderValue={(selected) => (
                      <ListItemText>{selected + " mV"}</ListItemText>
                    )}
                    value={chargingOptions?.chargeVoltage}
                    onChange={(e) =>
                      dispatch(
                        updateChargeVoltage({
                          channel,
                          chargeVoltage: e.target.value as number,
                        }),
                      )
                    }
                  >
                    {chargingOptions?.chargeVoltageOptions.map((row) => (
                      <MenuItem key={row.value} value={row.value}>
                        <Favorite
                          fontSize="small"
                          style={{
                            marginRight: 8,
                            padding: 9,
                            boxSizing: "content-box",
                            visibility: row.default ? "visible" : "hidden",
                          }}
                        />
                        <ListItemText primary={`${row.value} mV`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={2}>
              <Grid size={4}></Grid>
              <Grid size={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={startCharge}
                  disabled={workingState === ChannelWorkingState.WORKING}
                >
                  Start Charge
                </Button>
              </Grid>
              <Grid size={4}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={stopCharge}
                  disabled={workingState !== ChannelWorkingState.WORKING}
                >
                  Stop Charge
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
}
