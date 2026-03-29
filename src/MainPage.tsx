import BluetoothIcon from "@mui/icons-material/Bluetooth";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Tabs,
  Typography,
} from "@mui/material";
import Tab from "@mui/material/Tab";
import { IpcRendererEvent } from "electron/renderer";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MachineInfoCommand } from "src/commands/MachineInfoCommand";
import ChannelTabPanel from "src/components/ChannelTabPanel";
import FirmwareUpdatePanel from "src/components/FirmwareUpdatePanel";
import PasswordDialog from "src/components/PasswordDialog";
import { CHANNEL_LABELS } from "src/enums/ChargingChannels";
import { CommandEnum } from "src/enums/Commands";
import { parseMachineInfo } from "src/responses/MachineInfoResponse";
import { BluetoothHelper } from "src/utils/BluetoothHelper";
import { DEVICE_ATTR } from "./enums/DeviceTypes";
import { updateMachineInfo, updateSelectedTab } from "./redux/slices/appSlice";
import {
  closePasswordDialog,
  setPassword,
} from "./redux/slices/authenticationSlice";
import { createChannels } from "./redux/slices/channelsSlice";
import {
  selectDevice,
  updateConnected,
  updateConnecting,
  updateDisconnected,
} from "./redux/slices/connectionSlice";
import {
  stopScanning,
  updateDevices,
  updateScanning,
} from "./redux/slices/scanSlice";
import { type AppDispatch, type RootState } from "./redux/store";
import { disconnectDevice } from "./redux/thunks";
import { bluetoothHelper } from "./utils/BluetoothHelper";

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
  const deviceName = useSelector(
    (state: RootState) => DEVICE_ATTR[state.app.machineInfo?.deviceType]?.name,
  );
  const deviceType = useSelector(
    (state: RootState) => state.app.machineInfo?.deviceType,
  );

  const dispatch = useDispatch<AppDispatch>();

  const handleTabChange = (_event: React.SyntheticEvent, newIndex: number) => {
    dispatch(updateSelectedTab(newIndex));
  };

  const handleDeviceIdChange = (event: SelectChangeEvent) => {
    dispatch(selectDevice(event.target.value));
  };

  const notify = (command: CommandEnum, data: Uint8Array): void => {
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
    if (deviceType) {
      dispatch(createChannels(DEVICE_ATTR[deviceType].channels));
      dispatch(updateSelectedTab(0));
      dispatch(updateConnected());
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
    if (!success) {
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
  };

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

  const extraTabs = connected
    ? [{ label: "Firmware Update", index: channels.length }]
    : [];
  const extraTabPanels = connected
    ? [
        <TabPanel
          value={selectedTab}
          index={channels.length}
          key="firmware-update"
        >
          <FirmwareUpdatePanel />
        </TabPanel>,
      ]
    : [];

  return (
    <>
      <Grid
        container
        direction="column"
        sx={{
          alignItems: "stretch",
          justifyContent: "stretch",
          flexGrow: 1,
        }}
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
            disabled={connected || connecting || !deviceId}
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
            {extraTabs.map((tab) => (
              <Tab label={tab.label} key={tab.index} />
            ))}
          </Tabs>
        </Grid>
        <Grid container size="grow">
          <Paper elevation={3} style={{ flexGrow: 1 }} square={true}>
            {channels.map((channel, index) => (
              <TabPanel value={selectedTab} index={index} key={channel}>
                <ChannelTabPanel index={index} />
              </TabPanel>
            ))}
            {extraTabPanels.map((panel) => panel)}
          </Paper>
        </Grid>
      </Grid>
      <Paper
        sx={{ top: "auto", bottom: 0, padding: 1 }}
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
