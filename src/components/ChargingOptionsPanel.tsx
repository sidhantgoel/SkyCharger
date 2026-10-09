import Favorite from "@mui/icons-material/Favorite";
import { FormControl, Grid, InputLabel, MenuItem, Select } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  BATTERY_CHEMISTRY_ATTR,
  BATTERY_TYPE_ATTR,
  BatteryType,
} from "src/enums/BatteryTypes";
import { getSupportedBatteryTypes } from "src/enums/DeviceTypes";
import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import {
  CHARGE_PARAMETER_ATTRS,
  ChargeParameterEnum,
  formatChargeParameterValue,
  OPERATION_MODE_DISPLAY_NAMES,
  OperationMode,
} from "src/enums/OperationModes";
import {
  updateBatteryType,
  updateCellCount,
  updateChargeParameter,
  updateOperationMode,
} from "src/redux/slices/channelsSlice";
import { RootState } from "src/redux/store";

interface ChargingOptionsPanelProps {
  index: number;
}

export default function ChargingOptionsPanel({
  index,
}: ChargingOptionsPanelProps) {
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
  const version = useSelector(
    (state: RootState) => state.app.machineInfo?.version,
  );

  // Only offer battery types this device supports at its firmware version.
  // Keep the current type listed so the Select never holds an unknown value.
  const supportedTypes = getSupportedBatteryTypes(deviceType, version);
  const allTypes = Object.keys(BATTERY_TYPE_ATTR).map(
    (k) => Number(k) as BatteryType,
  );
  const batteryTypes = allTypes.filter(
    (type) =>
      !supportedTypes ||
      supportedTypes[type] ||
      type === chargingOptions?.batteryType,
  );
  const maxCells =
    BATTERY_CHEMISTRY_ATTR[chargingOptions?.batteryChemistry]?.maxCells ?? 10;

  const dispatch = useDispatch();

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
            <Grid container direction="row" spacing={2} paddingTop={2}>
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
                          version,
                        }),
                      )
                    }
                  >
                    {batteryTypes.map((batteryType) => (
                      <MenuItem key={batteryType} value={batteryType}>
                        {BATTERY_TYPE_ATTR[batteryType].displayName}
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
                          version,
                        }),
                      )
                    }
                  >
                    {chargingOptions?.operationModes.map((mode) => (
                      <MenuItem key={mode} value={mode}>
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
                    {Array.from({ length: maxCells }, (_, index) => (
                      <MenuItem key={index + 1} value={index + 1}>
                        {index + 1}
                      </MenuItem>
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
                            formatChargeParameterValue(
                              parameterIndex as ChargeParameterEnum,
                              selected,
                              chargingOptions.batteryChemistry,
                            )
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
                              {formatChargeParameterValue(
                                parameterIndex as ChargeParameterEnum,
                                option.value,
                                chargingOptions.batteryChemistry,
                              )}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  ),
              )}
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
}
