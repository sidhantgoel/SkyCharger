export enum ChannelWorkingState {
  WORKING = 0x01,
  IDLE = 0x02,
  DONE = 0x03,
  ERROR = 0x04,
  READY = 0x05,
  STATE_6 = 0x06,
  STATE_7 = 0x07,
}

export const STATE_MESSAGES: Record<number, string> = {
  [ChannelWorkingState.WORKING]: "Charging",
  [ChannelWorkingState.IDLE]: "Idle",
  [ChannelWorkingState.DONE]: "Done",
  [ChannelWorkingState.ERROR]: "Error",
  [ChannelWorkingState.READY]: "Ready",
  [ChannelWorkingState.STATE_6]: "State 6",
  [ChannelWorkingState.STATE_7]: "State 7",
};
