import { Alert, AlertTitle, Button, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { StopChargeCommand } from "src/commands/StopChargeCommand";
import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import { CommandEnum } from "src/enums/Commands";
import { ERROR_MESSAGES, ErrorCode } from "src/enums/ErrorCodes";
import { RootState } from "src/redux/store";
import { bluetoothHelper } from "src/utils/BluetoothHelper";

interface ErrorPanelProps {
  index: number;
  refresh: () => void;
}

export default function ErrorPanel({ index, refresh }: ErrorPanelProps) {
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
  const [buttonDisabled, setButtonDisabled] = useState(false);

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

  const finishChannel = () => {
    setButtonDisabled(true);
    const command = new StopChargeCommand(channel);
    bluetoothHelper.sendCommand(command);
  };

  return (
    <Grid container direction="row" spacing={2} size={12}>
      <Grid container size={12}>
        {basicInfo &&
          workingInfo &&
          (voltageInfo ||
            workingInfo.workingState !== ChannelWorkingState.IDLE) && (
            <Grid container direction={"row"} padding={2} spacing={1} size={12}>
              <Grid container direction={"column"} spacing={2} size={12}>
                {workingInfo.systemErrorCode !== ErrorCode.NONE && (
                  <Grid
                    container
                    direction={"row"}
                    spacing={2}
                    alignItems={"stretch"}
                    justifyContent={"center"}
                  >
                    <Alert variant="filled" severity="error">
                      <AlertTitle>System Error</AlertTitle>
                      {ERROR_MESSAGES[workingInfo.systemErrorCode]}
                    </Alert>
                  </Grid>
                )}
                {workingInfo.chargeErrorCode !== ErrorCode.NONE && (
                  <Grid
                    container
                    direction={"row"}
                    spacing={2}
                    alignItems={"stretch"}
                    justifyContent={"center"}
                  >
                    <Alert variant="filled" severity="error">
                      <AlertTitle>Charge Error</AlertTitle>
                      {ERROR_MESSAGES[workingInfo.chargeErrorCode]}
                    </Alert>
                  </Grid>
                )}
                {workingInfo.dcErrorCode !== ErrorCode.NONE && (
                  <Grid
                    container
                    direction={"row"}
                    spacing={2}
                    alignItems={"stretch"}
                    justifyContent={"center"}
                  >
                    <Alert variant="filled" severity="error">
                      <AlertTitle>DC Error</AlertTitle>
                      {ERROR_MESSAGES[workingInfo.dcErrorCode]}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Grid>
          )}
      </Grid>
      <Button
        disabled={buttonDisabled}
        loading={buttonDisabled}
        variant="contained"
        color="error"
        style={{ position: "absolute", bottom: 60, right: 20 }}
        onClick={finishChannel}
      >
        Reset
      </Button>
    </Grid>
  );
}
