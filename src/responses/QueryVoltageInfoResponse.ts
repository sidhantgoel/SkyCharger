import { Buffer } from "buffer";
import { ChargingChannel } from "src/enums/ChargingChannels";

export interface VoltageInfo {
    channel: ChargingChannel;
    totalVoltage: number;
    totalResistance: number;
    voltages: number[];
    resistances: number[];
}

function createVoltageInfo(channel: ChargingChannel, totalVoltage: number, totalResistance: number, voltages: number[], resistances: number[]): VoltageInfo {
    return { channel, totalVoltage, totalResistance, voltages, resistances };
}

export function parseVoltageInfo(data: Uint8Array | number[]): VoltageInfo | null {
    console.log("VoltageInfoResponse: " + Buffer.from(data).toString('hex'));
    const d = data instanceof Uint8Array ? data : new Uint8Array(data);
    if(d.length < 2) return null;
    const channel = d[0];
    let voltages: number[] = [];
    let resistances: number[] = [];
    let index = 1;
    while(index < d.length) {
        let voltage = (d[index] << 8) + d[index + 1];
        if(voltage !== 0) {
            voltages.push(voltage);
        }
        let resistance = ((d[index + 2] << 8) & 0x7f) + d[index + 3];
        if(resistance !== 0) {
            if(d[index + 2] & 0x80) {
                resistance = resistance / 10.0;
            }
        }
        if(resistance !== 0) {
            resistances.push(resistance);
        }
        index += 4;
    }
    let totalVoltage = 0;
    let totalResistance = 0;
    if(voltages.length === 1) {
        totalVoltage = voltages[0];
    } else if(voltages.length > 1) {
        totalVoltage = voltages[0];
        voltages = voltages.slice(1);
    }
    if(resistances.length === 1) {
        totalResistance = resistances[0];
    } else if(resistances.length > 1) {
        totalResistance = resistances[0];
        resistances = resistances.slice(1);
    }
    return createVoltageInfo(channel, totalVoltage, totalResistance, voltages, resistances);
}