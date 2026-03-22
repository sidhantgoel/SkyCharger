import { Grid } from "@mui/material";
import { ChargingChannel } from "src/enums/ChargingChannels";
import ChannelDetailsPanel from "./ChannelDetailsPanel";
import ChargingPanel from "./ChargingPanel";
import { useEffect } from "react";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { QueryBasicInfoCommand } from "src/commands/QueryBasicInfoCommand";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "src/redux/store";
import { QueryChannelStatusCommand } from "src/commands/QueryChannelStatusCommand";
import PasswordDialog from "./PasswordDialog";
import {
  closePasswordDialog,
  openPasswordDialog,
  setPassword,
} from "src/redux/slices/authenticationSlice";
import { disconnectDevice, updateBasicInfo } from "src/redux/thunks";
import { CommandEnum } from "src/enums/Commands";
import { parseBasicInfo } from "src/responses/ChannelBasicInfo";
import { parseChannelWorkingInfo } from "src/responses/ChannelWorkingInfo";
import { updateVoltageInfo, updateWorkingInfo } from "src/redux/slices/channelsSlice";
import { QueryVoltageInfoCommand } from "src/commands/QueryVoltageInfo";
import { parseVoltageInfo } from "src/responses/QueryVoltageInfoResponse";

interface ChannelTabPanelProps {
  channel: ChargingChannel;
}

export default function ChannelTabPanel({ channel }: ChannelTabPanelProps) {
  const password = useSelector(
    (state: RootState) => state.authentication.password,
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    bluetoothHelper.addOnNotifyListener(notify);
    getBasicInfo();
    const interval = setInterval(() => {
      getBasicInfo();
    }, 5000);
    return () => {
      clearInterval(interval);
      bluetoothHelper.removeOnNotifyListener(notify);
    };
  }, []);

  const notify = (command: CommandEnum, data: Uint8Array) => {
    switch (command) {
      case CommandEnum.QUERY_BASIC_INFO:
        const basicInfo = parseBasicInfo(data);
        if (basicInfo) {
          dispatch(updateBasicInfo(basicInfo));
          getChannelStatus();
        }
        break;
      case CommandEnum.QUERY_CHANNEL_STATUS:
        const workingInfo = parseChannelWorkingInfo(data);
        if (workingInfo) {
          dispatch(updateWorkingInfo(workingInfo));
          getVoltageInfo();
        }
        break;
      case CommandEnum.QUERY_VOLTAGE_INFO:
        const voltageInfo = parseVoltageInfo(data);
        if (voltageInfo) {
          dispatch(updateVoltageInfo(voltageInfo));
        }
        break;
      default:
        break;
    }
  };

  const getBasicInfo = async () => {
    await bluetoothHelper.sendCommand(
      new QueryBasicInfoCommand(channel, password),
    );
  };

  const getVoltageInfo = async () => {
    await bluetoothHelper.sendCommand(new QueryVoltageInfoCommand(channel));
  };

  const getChannelStatus = async () => {
    await bluetoothHelper.sendCommand(new QueryChannelStatusCommand(channel));
  };

  return (
    <>
      <Grid container direction="row" spacing={2}>
        <Grid size={6}>
          <ChannelDetailsPanel channel={channel} />
        </Grid>
        <Grid size={6}>
          <ChargingPanel channel={channel} />
        </Grid>
      </Grid>
    </>
  );
}
