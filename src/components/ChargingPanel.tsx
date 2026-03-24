import Favorite from "@mui/icons-material/Favorite";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { StartChargeCommand } from "src/commands/StartChargeCommand";
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { BATTERY_TYPE_ATTR, BatteryType } from "src/enums/BatteryTypes";
import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import {
  CHARGE_PARAMETER_ATTRS,
  ChargeParameterEnum,
  OPERATION_MODE_DISPLAY_NAMES,
  OperationMode,
} from "src/enums/OperationModes";
import {
  updateBatteryType,
  updateCellCount,
  updateChargeParameter,
  updateOperationMode,
} from "src/redux/slices/channelsSlice";
import { store } from "src/redux/store";
import { bluetoothHelper } from "src/utils/BluetoothHelper";

interface ChargingPanelProps {
  index: number;
}

type RootState = ReturnType<typeof store.getState>;

export default function ChargingPanel({ index }: ChargingPanelProps) {
  const channel = useSelector(
    (state: RootState) => state.channels.channels[index],
  );
  const chargingOptions = useSelector(
    (state: RootState) => state.channels.chargingOptions[index],
  );
  const workingState = useSelector(
    (state: RootState) =>
      state.channels.channelStates[index].workingInfo?.workingState,
  );
  const deviceType = useSelector(
    (state: RootState) => state.app.machineInfo?.deviceType,
  );
  const dispatch = useDispatch();

  const startCharge = () => {
    const command = new StartChargeCommand(
      channel,
      deviceType,
      chargingOptions?.batteryType,
      chargingOptions?.cellCount,
      chargingOptions?.operationMode,
      chargingOptions?.parameters[ChargeParameterEnum.CHARGE_CURRENT]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.DISCHARGE_CURRENT]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.CHARGE_VOLTAGE]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.DISCHARGE_VOLTAGE]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.CYCLE_MODEL]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.CYCLE_NUMBER]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.REPEAK_NUMBER]?.value,
      chargingOptions?.parameters[ChargeParameterEnum.TRACK_VOLTAGE]?.value,
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
                <FormControl
                  fullWidth
                  disabled={workingState === ChannelWorkingState.WORKING}
                >
                  <InputLabel id="battery-type-select-label">
                    Battery Type
                  </InputLabel>
                  <Select
                    label="Battery Type"
                    value={chargingOptions?.batteryType ?? ""}
                    onChange={(e) =>
                      dispatch(
                        updateBatteryType({
                          index: index,
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
                <FormControl
                  fullWidth
                  disabled={workingState === ChannelWorkingState.WORKING}
                >
                  <InputLabel id="operation-mode-select-label">
                    Operation Mode
                  </InputLabel>
                  <Select
                    label="Operation Mode"
                    value={chargingOptions?.operationMode ?? ""}
                    onChange={(e) =>
                      dispatch(
                        updateOperationMode({
                          index: index,
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
                <FormControl
                  fullWidth
                  disabled={workingState === ChannelWorkingState.WORKING}
                >
                  <InputLabel id="cell-count-select-label">
                    Cell Count
                  </InputLabel>
                  <Select
                    label="Cell Count"
                    value={
                      chargingOptions?.cellCount == 0
                        ? ""
                        : chargingOptions?.cellCount
                    }
                    onChange={(e) =>
                      dispatch(
                        updateCellCount({
                          index: index,
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
              {chargingOptions?.parameters.map(
                (parameter, parameterIndex) =>
                  parameter && (
                    <Grid size={4} key={parameterIndex}>
                      <FormControl
                        fullWidth
                        disabled={workingState === ChannelWorkingState.WORKING}
                      >
                        <InputLabel id={`${parameterIndex}-select-label`}>
                          {
                            CHARGE_PARAMETER_ATTRS[
                              parameterIndex as ChargeParameterEnum
                            ].displayName
                          }
                        </InputLabel>
                        <Select
                          labelId={`${parameterIndex}-select-label`}
                          label={
                            CHARGE_PARAMETER_ATTRS[
                              parameterIndex as ChargeParameterEnum
                            ].displayName
                          }
                          value={parameter.value}
                          renderValue={(selected) =>
                            selected +
                            " " +
                            CHARGE_PARAMETER_ATTRS[
                              parameterIndex as ChargeParameterEnum
                            ].unit
                          }
                          onChange={(e) =>
                            dispatch(
                              updateChargeParameter({
                                index: index,
                                parameter: parameterIndex,
                                value: e.target.value as number,
                              }),
                            )
                          }
                        >
                          {parameter.options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              <Favorite
                                fontSize="small"
                                style={{
                                  marginRight: 8,
                                  padding: 9,
                                  boxSizing: "content-box",
                                  visibility: option.default
                                    ? "visible"
                                    : "hidden",
                                }}
                              />
                              {option.value}{" "}
                              {
                                CHARGE_PARAMETER_ATTRS[
                                  parameterIndex as ChargeParameterEnum
                                ].unit
                              }
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ),
              )}
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
