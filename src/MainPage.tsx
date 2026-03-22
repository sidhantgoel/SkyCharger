import {
  Paper,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Grid,
  Tabs,
  AppBar,
  Toolbar,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import { IpcRendererEvent } from "electron/renderer";
import React, { useEffect } from "react";
import ChannelTabPanel from "src/components/ChannelTabPanel";
import { CHANNEL_LABELS, ChargingChannel } from "src/enums/ChargingChannels";
import { parseMachineInfo } from "src/responses/MachineInfo";
import { CommandEnum } from "src/enums/Commands";
import { parseBasicInfo } from "src/responses/ChannelBasicInfo";
import BluetoothIcon from "@mui/icons-material/Bluetooth";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PasswordDialog from "src/components/PasswordDialog";
import FirmwareUpdatePage from "src/components/FirmwareUpdatePage";
import { BluetoothHelper } from "src/utils/BluetoothHelper";
import { Command as CommandClass } from "src/commands/Command";
import { MachineInfoCommand } from "src/commands/MachineInfoCommand";
import { QueryBasicInfoCommand } from "src/commands/QueryBasicInfoCommand";
import { QueryChannelStatusCommand } from "src/commands/QueryChannelStatusCommand";
import { useDispatch, useSelector } from "react-redux";
import { store, type AppDispatch, type RootState } from "./redux/store";
import {
  selectDevice,
  updateConnecting,
  updateConnected,
  updateDisconnected,
} from "./redux/slices/connectionSlice";
import {
  setPassword,
  openPasswordDialog,
  closePasswordDialog,
  setPasswordOk,
} from "./redux/slices/authenticationSlice";
import {
  resetDevices,
  updateScanning,
  updateDevices,
  stopScanning,
} from "./redux/slices/scanSlice";
import { bluetoothHelper } from "./utils/BluetoothHelper";
import {
  updateWorkingInfo,
  resetChannels,
  createChannels,
} from "./redux/slices/channelsSlice";
import { parseChannelWorkingInfo } from "src/responses/ChannelWorkingInfo";
import {
  updateSelectedTab,
  updateMachineInfo,
  resetSelectedTab,
  resetMachineInfo,
} from "./redux/slices/appSlice";
import { DEVICE_ATTR } from "./enums/DeviceTypes";
import { disconnectDevice, updateBasicInfo } from "./redux/thunks";
import BatteryAnimation from "./components/BatteryAnimation";

declare const window: Window & {
  electronAPI: {
    bluetoothSelectDevice: (
      callback: (
        event: IpcRendererEvent,
        devices: Electron.BluetoothDevice[],
      ) => void,
    ) => void;
    bluetoothCallback: (deviceId: string) => void;
  };
};

let timeout: NodeJS.Timeout | null = null;

const MainPage = () => {
  const deviceId = useSelector((state: RootState) => state.connection.deviceId);
  const devices = useSelector((state: RootState) => state.scan.devices);
  const connecting = useSelector(
    (state: RootState) => state.connection.connecting,
  );
  const connected = useSelector(
    (state: RootState) => state.connection.connected,
  );
  const channels = useSelector((state: RootState) => state.channels.channels);
  const selectedTab = useSelector((state: RootState) => state.app.selectedTab);
  const scanning = useSelector((state: RootState) => state.scan.scanning);
  const password = useSelector(
    (state: RootState) => state.authentication.password,
  );
  const passwordDialogOpen = useSelector(
    (state: RootState) => state.authentication.passwordDialogOpen,
  );
  const passwordRequired = useSelector(
    (state: RootState) => state.channels.passwordRequired,
  );
  const deviceName = useSelector(
    (state: RootState) => DEVICE_ATTR[state.app.machineInfo?.deviceType]?.name,
  );
  const deviceType = useSelector(
    (state: RootState) => state.app.machineInfo?.deviceType,
  );
  const passwordOk = useSelector(
    (state: RootState) => state.authentication.passwordOk,
  );

  const dispatch = useDispatch<AppDispatch>();

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    dispatch(updateSelectedTab(newIndex));
  };

  const handleDeviceIdChange = (event: SelectChangeEvent) => {
    dispatch(selectDevice(event.target.value));
  };

  const getBasicInfo = async (channel: ChargingChannel) => {
    await bluetoothHelper.sendCommand(
      new QueryBasicInfoCommand(channel, password),
    );
  };

  const notify = (command: CommandEnum, data: Uint8Array) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = null;
    switch (command) {
      case CommandEnum.INFO:
        const machineInfo = parseMachineInfo(data);
        if (machineInfo) {
          dispatch(updateMachineInfo(machineInfo));
        }
        break;
        case CommandEnum.QUERY_BASIC_INFO:
          const basicInfo = parseBasicInfo(data);
          if (basicInfo) {
            if(!basicInfo.checkPassword) {
              dispatch(openPasswordDialog(true));
            } else {
                dispatch(setPasswordOk(true));
            }
          }
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

  useEffect(() => {
    if(passwordOk) {
      dispatch(
        createChannels(DEVICE_ATTR[deviceType].channels),
      );
      dispatch(updateSelectedTab(0));
      dispatch(updateConnected());
    }
  }, [passwordOk]);

  useEffect(() => {
    if(deviceType) {
      getBasicInfo(DEVICE_ATTR[deviceType].channels[0]);
    }
  }, [deviceType]);

  const sendInfoCommand = async () => {
    await bluetoothHelper.sendCommand(new MachineInfoCommand());
    timeout = setTimeout(sendInfoCommand, 100);
  };

  const discoverDevice = async () => {
    dispatch(updateScanning());
    const selectedDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [BluetoothHelper.SERVICE_UUID],
    });
    dispatch(stopScanning());
    const success = await bluetoothHelper.connect(selectedDevice);
    if(!success) {
      dispatch(updateDisconnected());
      return;
    }
    await sendInfoCommand();
  };

  const connectDevice = async () => {
    dispatch(updateConnecting());
    window.electronAPI.bluetoothCallback(deviceId);
  };

  useEffect(() => {
    window.electronAPI.bluetoothSelectDevice((event, devices) => {
      dispatch(updateDevices(devices));
    });
  }, []);

  const passwordDialogHandlePasswordChange = (password: string) => {
    dispatch(setPassword(password));
  };

  const passwordDialogHandleCancel = () => {
    dispatch(closePasswordDialog());
    dispatch(disconnectDevice());
  };

  const passwordDialogHandleOkay = () => {
    dispatch(closePasswordDialog());
    getBasicInfo(DEVICE_ATTR[deviceType].channels[0]);
  };

  useEffect(() => {
    if (passwordRequired) {
      dispatch(openPasswordDialog(true));
    }
  }, [passwordRequired]);

  interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`full-width-tabpanel-${index}`}
        aria-labelledby={`full-width-tab-${index}`}
        {...other}
      >
        {value === index && <>{children}</>}
      </div>
    );
  }

  return (
    <>
      <Grid
        container
        direction="column"
        sx={{ alignItems: "stretch", justifyContent: "stretch", flexGrow: 1 }}
      >
        <Grid size={2}>&nbsp;</Grid>
        <Grid container size="auto" spacing={2} justifyContent={"center"}>
          <Button
            variant="contained"
            color="primary"
            onClick={discoverDevice}
            disabled={connected || connecting}
            startIcon={<BluetoothIcon />}
            loading={scanning}
          >
            Scan
          </Button>
          <FormControl sx={{ minWidth: 240 }}>
            <InputLabel id="select-device-select-label">
              Device Selection
            </InputLabel>
            <Select
              labelId="select-device-select-label"
              id="select-device"
              value={deviceId}
              label="Device Selection"
              onChange={handleDeviceIdChange}
              disabled={connected || connecting}
            >
              {devices.map((device) => (
                <MenuItem value={device.deviceId}>{device.deviceName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={connectDevice}
            disabled={connected || connecting}
            loading={connecting}
            startIcon={<LoginIcon />}
          >
            Connect
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => dispatch(disconnectDevice())}
            disabled={!connected}
            startIcon={<LogoutIcon />}
          >
            Disconnect
          </Button>
        </Grid>
        <Grid container size="auto" justifyContent={"center"}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            aria-label="basic tabs example"
            centered
          >
            {channels.map((channel) => (
              <Tab label={CHANNEL_LABELS[channel]} key={channel} />
            ))}
            {connected && <Tab label="Firmware Update" key="firmware-update" />}
          </Tabs>
        </Grid>
        <Grid container size="grow">
          <Paper elevation={3} style={{ flexGrow: 1 }} square={true}>
            {channels.map((channel, index) => (
              <TabPanel value={selectedTab} index={index} key={channel}>
                <ChannelTabPanel channel={channel} />
              </TabPanel>
            ))}
            {connected && (
              <TabPanel
                value={selectedTab}
                index={channels.length}
                key="firmware-update"
              >
                <FirmwareUpdatePage />
              </TabPanel>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Paper
        sx={{ top: "auto", bottom: 0, padding: 2 }}
        elevation={3}
        square={true}
      >
        <Typography variant="h6">{`${connected ? "Connected to" : "Disconnected"} ${deviceName ?? ""}`}</Typography>
      </Paper>
      <PasswordDialog
        password={password}
        open={passwordDialogOpen}
        onCancel={passwordDialogHandleCancel}
        onOkay={passwordDialogHandleOkay}
        onPasswordChange={passwordDialogHandlePasswordChange}
      />
    </>
  );
};

export default MainPage;
