import { ChargingChannel } from "src/enums/ChargingChannels";

export interface VoltageInfo {
  channel: ChargingChannel;
  totalVoltage: number;
  totalResistance: number;
  voltages: number[];
  resistances: number[];
}

function createVoltageInfo(
  channel: ChargingChannel,
  totalVoltage: number,
  totalResistance: number,
  voltages: number[],
  resistances: number[],
): VoltageInfo {
  return { channel, totalVoltage, totalResistance, voltages, resistances };
}

export function parseVoltageInfo(
  data: Uint8Array | number[],
): VoltageInfo | null {
  const d = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (d.length < 2) return null;
  const channel = d[0];
  // Each 4-byte entry is [voltage hi, lo, resistance hi, lo]. Voltage and
  // resistance are kept together so resistances[i] always matches voltages[i].
  const entries: { voltage: number; resistance: number }[] = [];
  for (let index = 1; index + 3 < d.length; index += 4) {
    const voltage = (d[index] << 8) + d[index + 1];
    if (voltage === 0) continue;
    // Bit 7 of the high byte is a flag (value in 0.1 mΩ), not part of the value.
    let resistance = ((d[index + 2] & 0x7f) << 8) + d[index + 3];
    if (d[index + 2] & 0x80) {
      resistance = resistance / 10.0;
    }
    entries.push({ voltage, resistance });
  }
  // The first entry is the pack total; the rest are cells. A single entry is
  // both the total and the only cell.
  const total = entries[0];
  const cells = entries.length > 1 ? entries.slice(1) : entries;
  return createVoltageInfo(
    channel,
    total?.voltage ?? 0,
    total?.resistance ?? 0,
    cells.map((cell) => cell.voltage),
    cells.map((cell) => cell.resistance),
  );
}
