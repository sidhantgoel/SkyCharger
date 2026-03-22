/** Charging channel (A–D). Values match typical mask bits from device. */
export enum ChargingChannel {
  A = 0x01,
  B = 0x02,
  C = 0x04,
  D = 0x08,
}

const maskToChannel: Record<number, ChargingChannel> = {
  [ChargingChannel.A]: ChargingChannel.A,
  [ChargingChannel.B]: ChargingChannel.B,
  [ChargingChannel.C]: ChargingChannel.C,
  [ChargingChannel.D]: ChargingChannel.D,
};

/** Map device mask byte to ChargingChannel. Returns first matching channel or A as fallback. */
export function findChannelForMask(mask: number): ChargingChannel {
  if (maskToChannel[mask] !== undefined) return maskToChannel[mask];
  if (mask & ChargingChannel.D) return ChargingChannel.D;
  if (mask & ChargingChannel.C) return ChargingChannel.C;
  if (mask & ChargingChannel.B) return ChargingChannel.B;
  return ChargingChannel.A;
}

export const CHANNEL_LABELS: Record<ChargingChannel, string> = {
  [ChargingChannel.A]: "Channel A",
  [ChargingChannel.B]: "Channel B",
  [ChargingChannel.C]: "Channel C",
  [ChargingChannel.D]: "Channel D",
};
