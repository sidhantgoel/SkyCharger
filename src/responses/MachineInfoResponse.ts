import { DeviceType, getDeviceTypeFromBytes } from "src/enums/DeviceTypes";
import { Buffer } from "buffer";

export interface MachineInfo {
  deviceType: DeviceType;
  version: number;
  sn: string;
}

function createMachineInfo(
  deviceType: DeviceType,
  version: number,
  sn: string,
): MachineInfo {
  return { deviceType, version, sn };
}

/**
 * Parse machine info from device response bytes.
 * Uses bytes 1–6 for device type and bytes 12–13 for version.
 * Returns null if data has fewer than 14 bytes.
 */
export function parseMachineInfo(
  data: Uint8Array | number[],
): MachineInfo | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 14) return null;

  const deviceBytes = d.slice(1, 7);
  const deviceType = getDeviceTypeFromBytes(deviceBytes);
  const version = d[12] + d[13] / 100;
  const sn = Buffer.from(d.slice(1)).toString("hex");

  return createMachineInfo(deviceType, version, sn);
}
