/** Error code enum; values match device byte codes. */
export enum ErrorCode {
  NONE = 0x00,
  INT_TEMP_TOO_HIGH = 0x01,
  EXT_TEMP_TOO_HIGH = 0x02,
  DC_IN_TOO_LOW = 0x03,
  DC_IN_TOO_HIGH = 0x04,
  OVER_TIME_LIMIT = 0x05,
  OVER_CHARGE_CAPACITY_LIMIT = 0x06,
  REVERSE_POLARITY = 0x07,
  CONTROL_FAIL = 0x08,
  BREAK_DOWN = 0x09,
  INPUT_FAIL = 0x0a,
  CONNECTION_BREAK = 0x0b,
  CELL_ERROR_VOLTAGE_INVALID = 0x0c,
  BALANCE_CONNECTER_ERROR = 0x0d,
  NO_BATTERY = 0x0e,
  CELL_NUMBER_INCORRECT = 0x0f,
  CONNECTION_ERROR_CHECK_MAIN_PORT = 0x10,
  BATTERY_WAS_FULL = 0x11,
  NOT_NEED_CHARGE = 0x12,
  CELL_ERROR_HIGHT_VOLTAGE = 0x13,
  CONNECTION_BREAK1 = 0x14,
  CONNECTION_BREAK2 = 0x15,
  CONNECTION_BREAK3 = 0x16,
  BATTERY_ERROR = 0x17,
  CHARGE_ERROR_18 = 0x18,
  CHARGE_ERROR_19 = 0x19,
  CHARGE_ERROR_1A = 0x1a,
  CHARGE_ERROR_1B = 0x1b,
  CHARGE_ERROR_1C = 0x1c,
  CHARGE_ERROR_1D = 0x1d,
  CHARGE_ERROR_1E = 0x1e,
  CHARGE_ERROR_1F = 0x1f,
}

export const ERROR_MESSAGES: Record<number, string> = {
  [ErrorCode.NONE]: "No Error",
  [ErrorCode.INT_TEMP_TOO_HIGH]: "Internal temperature too high",
  [ErrorCode.EXT_TEMP_TOO_HIGH]: "External temperature too high",
  [ErrorCode.DC_IN_TOO_LOW]: "DC input voltage too low",
  [ErrorCode.DC_IN_TOO_HIGH]: "DC input voltage too high",
  [ErrorCode.OVER_TIME_LIMIT]: "Over time limit",
  [ErrorCode.OVER_CHARGE_CAPACITY_LIMIT]: "Over charge capacity limit",
  [ErrorCode.REVERSE_POLARITY]: "Reverse polarity",
  [ErrorCode.CONTROL_FAIL]: "Control fail",
  [ErrorCode.BREAK_DOWN]: "Break down",
  [ErrorCode.INPUT_FAIL]: "Input fail",
  [ErrorCode.CONNECTION_BREAK]: "Connection break",
  [ErrorCode.CELL_ERROR_VOLTAGE_INVALID]: "Cell error voltage invalid",
  [ErrorCode.BALANCE_CONNECTER_ERROR]: "Balance connecter error",
  [ErrorCode.NO_BATTERY]: "No battery",
  [ErrorCode.CELL_NUMBER_INCORRECT]: "Cell number incorrect",
  [ErrorCode.CONNECTION_ERROR_CHECK_MAIN_PORT]:
    "Connection error check main port",
  [ErrorCode.BATTERY_WAS_FULL]: "Battery was full",
  [ErrorCode.NOT_NEED_CHARGE]: "Not need charge",
  [ErrorCode.CELL_ERROR_HIGHT_VOLTAGE]: "Cell error hight voltage",
  [ErrorCode.CONNECTION_BREAK1]: "Connection break",
  [ErrorCode.CONNECTION_BREAK2]: "Connection break",
  [ErrorCode.CONNECTION_BREAK3]: "Connection break",
  [ErrorCode.BATTERY_ERROR]: "Battery error",
  [ErrorCode.CHARGE_ERROR_18]: "Charge error 18",
  [ErrorCode.CHARGE_ERROR_19]: "Charge error 19",
  [ErrorCode.CHARGE_ERROR_1A]: "Charge error 1a",
  [ErrorCode.CHARGE_ERROR_1B]: "Charge error 1b",
  [ErrorCode.CHARGE_ERROR_1C]: "Charge error 1c",
  [ErrorCode.CHARGE_ERROR_1D]: "Charge error 1d",
  [ErrorCode.CHARGE_ERROR_1E]: "Charge error 1e",
  [ErrorCode.CHARGE_ERROR_1F]: "Charge error 1f",
};

/**
 * Map device byte to ErrorCode. Unknown values return ErrorCode.UNKNOWN.
 */
export function getErrorCodeForValue(value: number): ErrorCode {
  if (value in ERROR_MESSAGES) return value as ErrorCode;
  return null;
}
