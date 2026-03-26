import { ErrorCode } from "src/enums/ErrorCodes";

export interface StartChargeResponse {
  errorCode: ErrorCode;
  success: boolean;
}

function createStartChargeResponse(
  errorCode: ErrorCode,
  success: boolean,
): StartChargeResponse {
  return { errorCode, success };
}

/**
 * Parse machine info from device response bytes.
 * Uses bytes 1–6 for device type and bytes 12–13 for version.
 * Returns null if data has fewer than 14 bytes.
 */
export function parseStartChargeResponse(
  data: Uint8Array | number[],
): StartChargeResponse | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 2) return null;

  const errorCode = d[0];
  const success = d[1] === 1;

  return createStartChargeResponse(errorCode, success);
}
