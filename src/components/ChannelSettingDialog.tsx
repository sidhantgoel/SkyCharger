import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Select,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { QuerySystemInfoCommand } from "src/commands/QuerySystemInfoCommand";
import { ChargingChannel } from "src/enums/ChargingChannels";
import { CommandEnum } from "src/enums/Commands";
import { updateSystemInfo } from "src/redux/slices/channelsSlice";
import { parseSystemInfo } from "src/responses/QuerySystemInfoResponse";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "src/redux/store";
import {
  SetBalancedCommand,
  SetCapacityCommand,
  SetRecycleCommand,
  SetSoundCommand,
  SetTimeCommand,
} from "src/commands/SetSystemInfoCommand";
import { parseSetSystemInfoResponse } from "src/responses/SetSystemInfoResponse";

const DEFAULT_CAPACITY = 12000;
const DEFAULT_TIME = 240;
const DEFAULT_RECYCLE = 10;

interface ChannelSettingDialogProps {
  channel: ChargingChannel;
  open: boolean;
  onClose: () => void;
}

export default function ChannelSettingDialog({
  channel,
  open,
  onClose,
}: ChannelSettingDialogProps) {
  const dispatch = useDispatch();

  const notify = (command: CommandEnum, data: Uint8Array): void => {
    switch (command) {
      case CommandEnum.QUERY_SYSTEM_INFO:
        const systemInfo = parseSystemInfo(data);
        console.log(systemInfo);
        dispatch(updateSystemInfo({ index: channel, systemInfo: systemInfo }));
        break;
      case CommandEnum.SET_SYSTEM_INFO:
        const setSystemInfoResponse = parseSetSystemInfoResponse(data);
        console.log(setSystemInfoResponse);
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

  const systemInfo = useSelector(
    (state: RootState) => state.channels.systemInfos[channel],
  );

  const [balanced, setBalanced] = useState(systemInfo?.balanced || false);
  const [capacityEnable, setCapacityEnable] = useState(
    systemInfo?.capacityEnable || false,
  );
  const [capacityValue, setCapacityValue] = useState(systemInfo?.capacity || 0);
  const [keyboardSoundEnable, setKeyboardSoundEnable] = useState(
    systemInfo?.keyboardSound === 1,
  );
  const [systemSoundEnable, setSystemSoundEnable] = useState(
    systemInfo?.systemSound === 1,
  );
  const [timeEnable, setTimeEnable] = useState(systemInfo?.timeEnable || false);
  const [timeValue, setTimeValue] = useState(systemInfo?.time || 0);
  const [recycleEnable, setRecycleEnable] = useState(systemInfo?.recycle !== 0);
  const [recycleValue, setRecycleValue] = useState(systemInfo?.recycle || 0);

  useEffect(() => {
    setCapacityEnable(systemInfo?.capacityEnable || false);
    setCapacityValue(systemInfo?.capacity || 0);
    setBalanced(systemInfo?.balanced || false);
    setKeyboardSoundEnable(systemInfo?.keyboardSound === 1);
    setSystemSoundEnable(systemInfo?.systemSound === 1);
    setTimeEnable(systemInfo?.timeEnable || false);
    setTimeValue(systemInfo?.time || 0);
    setRecycleEnable(systemInfo?.recycle !== 0);
    setRecycleValue(systemInfo?.recycle || 0);
  }, [systemInfo]);

  const onBalancedChange = (balanced: boolean) => {
    setBalanced(balanced);
    bluetoothHelper.sendCommand(new SetBalancedCommand(channel, balanced));
  };

  const onCapacityEnableChange = (capacityEnable: boolean) => {
    if (capacityEnable) {
      setCapacityValue(DEFAULT_CAPACITY);
    } else {
      setCapacityValue(100);
    }
    setCapacityEnable(capacityEnable);
    bluetoothHelper.sendCommand(
      new SetCapacityCommand(
        channel,
        capacityEnable,
        capacityEnable ? DEFAULT_CAPACITY : 0,
      ),
    );
  };

  const onCapacityChange = (capacity: number) => {
    bluetoothHelper.sendCommand(
      new SetCapacityCommand(channel, true, capacity),
    );
  };

  const onKeyboardSoundEnableChange = (keyboardSoundEnable: boolean) => {
    setKeyboardSoundEnable(keyboardSoundEnable);
    bluetoothHelper.sendCommand(
      new SetSoundCommand(channel, keyboardSoundEnable, systemSoundEnable),
    );
  };

  const onSystemSoundEnableChange = (systemSoundEnable: boolean) => {
    setSystemSoundEnable(systemSoundEnable);
    bluetoothHelper.sendCommand(
      new SetSoundCommand(channel, keyboardSoundEnable, systemSoundEnable),
    );
  };

  const capacityAriaValueText = (value: number) => {
    return `${value}mAh`;
  };

  const timeAriaValueText = (value: number) => {
    return `${value}min`;
  };

  const recycleAriaValueText = (value: number) => {
    return `${value}min`;
  };

  const onTimeEnableChange = (timeEnable: boolean) => {
    if (timeEnable) {
      setTimeValue(DEFAULT_TIME);
    } else {
      setTimeValue(1);
    }
    setTimeEnable(timeEnable);
    bluetoothHelper.sendCommand(
      new SetTimeCommand(channel, timeEnable, timeEnable ? DEFAULT_TIME : 0),
    );
  };

  const onRecycleEnableChange = (recycleEnable: boolean) => {
    if (recycleEnable) {
      setRecycleValue(DEFAULT_RECYCLE);
    } else {
      setRecycleValue(0);
    }
    setRecycleEnable(recycleEnable);
    bluetoothHelper.sendCommand(
      new SetRecycleCommand(channel, recycleEnable ? DEFAULT_RECYCLE : 0),
    );
  };

  const onTimeChange = (time: number) => {
    bluetoothHelper.sendCommand(new SetTimeCommand(channel, timeEnable, time));
  };

  const onRecycleChange = (recycle: number) => {
    if (recycle === 0) {
      setRecycleEnable(false);
    } else {
      setRecycleEnable(true);
    }
    bluetoothHelper.sendCommand(new SetRecycleCommand(channel, recycle));
  };

  useEffect(() => {
    if (open) {
      bluetoothHelper.sendCommand(new QuerySystemInfoCommand(channel));
    }
  }, [open]);

  return (
    (systemInfo && (
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>Channel Setting</DialogTitle>
        <DialogContent>
          <Grid container direction="column" spacing={0}>
            <Grid container direction="row" spacing={2}>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={balanced}
                        onChange={(e) => onBalancedChange(e.target.checked)}
                      />
                    }
                    label="Balanced"
                  />
                </FormControl>
              </Grid>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={keyboardSoundEnable}
                        onChange={(e) =>
                          onKeyboardSoundEnableChange(e.target.checked)
                        }
                      />
                    }
                    label="Keyboard Sound"
                  />
                </FormControl>
              </Grid>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemSoundEnable}
                        onChange={(e) =>
                          onSystemSoundEnableChange(e.target.checked)
                        }
                      />
                    }
                    label="System Sound"
                  />
                </FormControl>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={2}>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={capacityEnable}
                        onChange={(e) =>
                          onCapacityEnableChange(e.target.checked)
                        }
                      />
                    }
                    label="Capacity Enable"
                  />
                </FormControl>
              </Grid>
              <Grid container direction="column" size={8}>
                <Grid container direction="row" spacing={2}>
                  <Grid size="grow">
                    <FormControl fullWidth>
                      <Slider
                        aria-label="Capacity"
                        getAriaValueText={capacityAriaValueText}
                        value={capacityValue}
                        onChange={(e, value) =>
                          setCapacityValue(value as number)
                        }
                        onChangeCommitted={(e, value) =>
                          onCapacityChange(value as number)
                        }
                        min={100}
                        max={50000}
                        step={100}
                        disabled={!capacityEnable}
                        aria-labelledby="capacity-slider"
                      />
                    </FormControl>
                  </Grid>
                  <Grid>
                    <Input
                      readOnly
                      value={capacityValue}
                      disabled={!capacityEnable}
                      aria-labelledby="capacity-slider"
                      size="small"
                      endAdornment={
                        <InputAdornment position="end">mAh</InputAdornment>
                      }
                      inputProps={{
                        step: 100,
                        min: 100,
                        max: 50000,
                        type: "number",
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={2}>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={timeEnable}
                        onChange={(e) => onTimeEnableChange(e.target.checked)}
                      />
                    }
                    label="Time Enable"
                  />
                </FormControl>
              </Grid>
              <Grid container direction="column" size={8}>
                <Grid container direction="row" spacing={2}>
                  <Grid size="grow">
                    <FormControl fullWidth>
                      <Slider
                        aria-label="Time"
                        getAriaValueText={timeAriaValueText}
                        value={timeValue}
                        onChange={(e, value) => setTimeValue(value as number)}
                        onChangeCommitted={(e, value) =>
                          onTimeChange(value as number)
                        }
                        min={1}
                        max={720}
                        step={1}
                        disabled={!timeEnable}
                        aria-labelledby="time-slider"
                      />
                    </FormControl>
                  </Grid>
                  <Grid>
                    <Input
                      readOnly
                      value={timeValue}
                      disabled={!timeEnable}
                      aria-labelledby="time-slider"
                      size="small"
                      endAdornment={
                        <InputAdornment position="end">min</InputAdornment>
                      }
                      inputProps={{
                        step: 1,
                        min: 1,
                        max: 720,
                        type: "number",
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid container direction="row" spacing={2}>
              <Grid container direction="row" size={4}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={recycleEnable}
                        onChange={(e) =>
                          onRecycleEnableChange(e.target.checked)
                        }
                      />
                    }
                    label="Recycle Enable"
                  />
                </FormControl>
              </Grid>
              <Grid container direction="row" size={8}>
                <Grid size="grow">
                  <FormControl fullWidth>
                    <Slider
                      aria-label="Recycle"
                      getAriaValueText={recycleAriaValueText}
                      value={recycleValue}
                      onChange={(e, value) => setRecycleValue(value as number)}
                      onChangeCommitted={(e, value) =>
                        onRecycleChange(value as number)
                      }
                      disabled={!recycleEnable}
                      min={0}
                      max={60}
                      step={1}
                      aria-labelledby="recycle-slider"
                    />
                  </FormControl>
                </Grid>
                <Grid>
                  <Input
                    readOnly
                    value={recycleValue}
                    aria-labelledby="recycle-slider"
                    size="small"
                    disabled={!recycleEnable}
                    endAdornment={
                      <InputAdornment position="end">min</InputAdornment>
                    }
                    inputProps={{
                      step: 1,
                      min: 0,
                      max: 60,
                      type: "number",
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={onClose}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    )) || <></>
  );
}
