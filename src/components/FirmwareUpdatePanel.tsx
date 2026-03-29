import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { CommandEnum } from "src/enums/Commands";
import { RootState } from "src/redux/store";
import { parseBootVersion } from "src/responses/CheckBootVersionResponse";
import { parseCheckNewVersion } from "src/responses/CheckNewVersionResponse";
import { bluetoothHelper } from "src/utils/BluetoothHelper";
import { FirmwareUpdator } from "src/utils/FirmwareUpdator";

function UpdateDialog({
  open,
  handleClose,
  message,
  progress,
  updating,
}: {
  open: boolean;
  handleClose: () => void;
  message: string;
  progress: number;
  updating: boolean;
}) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Firmware Update</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
        <Stack direction="column" spacing={2}>
          <LinearProgress
            value={progress}
            variant="determinate"
            color="primary"
          />
          <Typography align="right" variant="body1">
            {progress}%
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={updating}
          variant="contained"
          color="primary"
          onClick={handleClose}
        >
          Okay
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface VersionInfo {
  id: string;
  timestamp: number;
  version: number;
  checksum: number;
  download_url: string;
}

async function fetchVersionInfo(sn: string): Promise<VersionInfo[]> {
  const headers: Headers = new Headers();
  headers.set("sn", sn);
  const request: RequestInfo = new Request(
    "https://upgrade.skyrc.com/?SN=" + sn,
    {
      method: "GET",
      headers: headers,
    },
  );
  let response: Response;
  try {
    response = await fetch(request);
  } catch (error) {
    console.error("Failed to fetch version info:", error);
    return [];
  }
  const data = await response.json();
  return data;
}

export default function FirmwareUpdatePanel() {
  const firmwareUpdator = new FirmwareUpdator(bluetoothHelper);
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [updating, setUpdating] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const currentVersion = useSelector(
    (state: RootState) => state.app.machineInfo.version,
  );
  const sn = useSelector((state: RootState) => state.app.machineInfo.sn);
  const [newVersion, setNewVersion] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [checksum, setChecksum] = useState<number>(0);

  const notify = (command: CommandEnum, data: Uint8Array): void => {
    if (command === CommandEnum.CHECK_BOOT_VERSION) {
      const bootVersion = parseBootVersion(data);
      console.log(`Boot version: ${bootVersion?.bootVersion}`);
      // checkNewVersion();
    }
    if (command === CommandEnum.CHECK_NEW_VERSION) {
      const haveNewVersion = parseCheckNewVersion(data);
      console.log(`Have new version: ${haveNewVersion}`);
    }
  };

  useEffect(() => {
    bluetoothHelper.addOnNotifyListener(notify);
    fetchVersionInfo(sn).then((versionInfo) => {
      setNewVersion(versionInfo[0].version);
      setDownloadUrl(versionInfo[0].download_url);
      setChecksum(versionInfo[0].checksum);
    });
    return () => {
      bluetoothHelper.removeOnNotifyListener(notify);
    };
  }, []);

  const handleClose = () => {
    setDialogOpen((prev) => false);
  };

  const startFirmwareUpdate = async () => {
    setUpdating((prev) => true);
    setDialogOpen((prev) => true);
    setMessage((prev) => "Downloading firmware file...");
    const result = await fetch(downloadUrl);
    const data = await result.arrayBuffer();
    const firmwareUpdateData = new Uint8Array(data);
    const updateResult = await firmwareUpdator.updateFirmware(
      firmwareUpdateData,
      checksum,
      (message: string, progress: number) => {
        setMessage((prev) => message);
        setProgress((prev) => progress);
      },
    );
    if (!updateResult) {
      setMessage((prev) => "Firmware update failed.");
    }
    setUpdating((prev) => false);
  };
  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Grid
          container
          size={12}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography variant="h6">Firmware Update</Typography>
        </Grid>
        <Grid
          container
          size={12}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography variant="body1">
            Current Version: {currentVersion}
          </Typography>
        </Grid>
        <Grid
          container
          size={12}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Typography variant="body1">New Version: {newVersion}</Typography>
        </Grid>
        <Grid
          container
          size={12}
          alignItems={"center"}
          justifyContent={"center"}
        ></Grid>
      </Grid>
      <UpdateDialog
        open={dialogOpen}
        handleClose={handleClose}
        message={message}
        progress={progress}
        updating={updating}
      />
      <Button
        disabled={updating}
        loading={updating}
        variant="contained"
        color="primary"
        style={{ position: "absolute", bottom: 80, right: 20 }}
        onClick={startFirmwareUpdate}
      >
        Update
      </Button>
    </React.Fragment>
  );
}
