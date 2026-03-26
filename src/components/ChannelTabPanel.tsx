import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { QueryBasicInfoCommand } from "src/commands/QueryBasicInfoCommand";
import { QueryChannelStatusCommand } from "src/commands/QueryChannelStatusCommand";
import { QueryVoltageInfoCommand } from "src/commands/QueryVoltageInfo";
import { ChannelWorkingState } from "src/enums/ChannelWorkingStates";
import { CommandEnum } from "src/enums/Commands";
import {
  updateVoltageInfo,
  updateWorkingInfo,
} from "src/redux/slices/channelsSlice";
import { AppDispatch, RootState } from "src/redux/store";
import { updateBasicInfo } from "src/redux/thunks";
import { parseBasicInfo } from "src/responses/ChannelBasicInfo";
import { parseChannelWorkingInfo } from "src/responses/ChannelWorkingInfo";
import { parseVoltageInfo } from "src/responses/QueryVoltageInfoResponse";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import ErrorDetailsPanel from "./ErrorDetailsPanel";
import FinishedDetailsPanel from "./FinishedDetailsPanel";
import IdleDetailsPanel from "./IdleDetailsPanel";
import WorkingDetailsPanel from "./WorkingDetailsPanel";

interface ChannelTabPanelProps {
  index: number;
}

export default function ChannelTabPanel({ index }: ChannelTabPanelProps) {
  const password = useSelector(
    (state: RootState) => state.authentication.password,
  );
  const channel = useSelector(
    (state: RootState) => state.channels.channels[index],
  );
  const workingState = useSelector(
    (state: RootState) =>
      state.channels.channelStates[index].workingInfo?.workingState,
  );
  const workingStateRef = useRef(workingState);

  useEffect(() => {
    workingStateRef.current = workingState;
  }, [workingState]);

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

  const notify = (command: CommandEnum, data: Uint8Array): void => {
    switch (command) {
      case CommandEnum.QUERY_BASIC_INFO:
        const basicInfo = parseBasicInfo(data);
        if (basicInfo) {
          dispatch(updateBasicInfo(index, basicInfo));
          getChannelStatus();
        }
        break;
      case CommandEnum.QUERY_CHANNEL_STATUS:
        const workingInfo = parseChannelWorkingInfo(data);
        if (workingInfo) {
          dispatch(
            updateWorkingInfo({
              index: index,
              workingInfo: workingInfo,
            }),
          );
          if (workingStateRef.current !== ChannelWorkingState.IDLE) {
            break;
          }
          getVoltageInfo();
        }
        break;
      case CommandEnum.QUERY_VOLTAGE_INFO:
        const voltageInfo = parseVoltageInfo(data);
        if (voltageInfo) {
          dispatch(
            updateVoltageInfo({
              index: index,
              voltageInfo: voltageInfo,
            }),
          );
        }
        break;
      default:
        break;
    }
  };

  const refresh = () => {
    getBasicInfo();
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

  if (workingState === ChannelWorkingState.IDLE) {
    return <IdleDetailsPanel index={index} refresh={refresh} />;
  } else if (workingState === ChannelWorkingState.WORKING) {
    return <WorkingDetailsPanel index={index} refresh={refresh} />;
  } else if (workingState === ChannelWorkingState.DONE) {
    return <FinishedDetailsPanel index={index} refresh={refresh} />;
  } else if (workingState === ChannelWorkingState.ERROR) {
    return <ErrorDetailsPanel index={index} refresh={refresh} />;
  }
  return <></>;
}
