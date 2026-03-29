import { ChargingChannel } from "src/enums/ChargingChannels";
import { ErrorCode } from "src/enums/ErrorCodes";

export interface SetSystemInfoResponse {
  channel: ChargingChannel;
  success: boolean;
}

function createSetSystemInfoResponse(
  channel: ChargingChannel,
  success: boolean,
): SetSystemInfoResponse {
  return { channel, success };
}

/**
 * Parse machine info from device response bytes.
 * Uses bytes 1–6 for device type and bytes 12–13 for version.
 * Returns null if data has fewer than 14 bytes.
 */
export function parseSetSystemInfoResponse(
  data: Uint8Array | number[],
): SetSystemInfoResponse | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 2) return null;

  const channel = d[0];
  const success = d[1] === 1;

  return createSetSystemInfoResponse(channel, success);
}
