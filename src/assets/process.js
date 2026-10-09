/**
 * Generate src/enums/DeviceTypes.ts from the charger JSON definitions.
 * Usage: node process.js [path/to/DeviceTypes.ts]
 * Default output: ../enums/DeviceTypes.ts. Pass "-" to print to stdout instead.
 *
 * Every source file contributes one settings entry per device it contains,
 * keyed by (device, minVersion). minVersion defaults to 0 unless overridden
 * in SOURCES. At runtime the entry with the highest minVersion that is <= the
 * device firmware version is used.
 */

const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const defaultOutputPath = path.join(__dirname, "..", "enums", "DeviceTypes.ts");

// minVersions is keyed by DeviceType enum name.
const SOURCES = [
  { file: "battery.json", minVersions: {} },
  {
    file: "battery_196_197_info.json",
    minVersions: { Q200NEO: 3.21, D200NEX: 3.0 },
  },
];

const ATTR_FIELDS = [
  { key: "chargeVoltage", option: "voltage_charge", scale: 1000 },
  { key: "dischargeVoltage", option: "voltage_discharge", scale: 1000 },
  { key: "chargeCurrent", option: "charger electricity", scale: 1000 },
  { key: "dischargeCurrent", option: "disCharger electricity", scale: 1000 },
  { key: "cycleModel", option: "cycle_model", scale: 1 },
  { key: "cycleNumber", option: "cycle_number", scale: 1 },
  { key: "repeakNumber", option: "repeak_number", scale: 1 },
  { key: "trackVoltage", option: "track_voltage", scale: 1 },
  { key: "voltage", option: "v", scale: 1 },
];

const HEADER = `import { BatteryType } from "./BatteryTypes";
import { ChargingChannel } from "./ChargingChannels";
import { OperationMode } from "./OperationModes";
`;

const INTERFACES = `export interface MinMaxStepDefaultAttr {
  min: number;
  max: number;
  step: number;
  default: number;
}

interface VoltageCurrentAttr {
${ATTR_FIELDS.map(({ key }) => `  ${key}: MinMaxStepDefaultAttr;`).join("\n")}
}

export type SupportedBatteryTypes = Partial<
  Record<BatteryType, Partial<Record<OperationMode, VoltageCurrentAttr>>>
>;

interface DeviceAttr {
  bytes: Uint8Array;
  name: string;
  channels: ChargingChannel[];
  passwordEnable: boolean;
}

interface DeviceSettings {
  minVersion: number;
  supportedBatteryTypes: SupportedBatteryTypes;
}
`;

const FOOTER = `export function getDeviceTypeFromBytes(bytes: Uint8Array): DeviceType | null {
  for (const [deviceType, deviceAttr] of Object.entries(DEVICE_ATTR)) {
    // Object keys are strings; convert back to the numeric enum value.
    if (bytes.every((b, index) => b === deviceAttr.bytes[index]))
      return Number(deviceType) as DeviceType;
  }
  return null;
}

/** Settings of the highest minVersion that the firmware version satisfies. */
export function getSupportedBatteryTypes(
  deviceType: DeviceType,
  version: number,
): SupportedBatteryTypes | null {
  const settings = DEVICE_SETTINGS[deviceType] ?? [];
  // Compare in hundredths to avoid floating point noise (version is major + minor / 100).
  const current = Math.round((version ?? 0) * 100);
  for (let i = settings.length - 1; i >= 0; i--) {
    if (current >= Math.round(settings[i].minVersion * 100))
      return settings[i].supportedBatteryTypes;
  }
  return null;
}
`;

function loadJson(filePath) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf8");
  return JSON.parse(raw);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function deviceNameToType(name) {
  return name.toUpperCase().replace(/\s+/g, "");
}

function getChannels(channel) {
  const channels = [];
  for (let i = 0; i < channel; i++) {
    channels.push(`ChargingChannel.${"ABCDEF"[i]}`);
  }
  return channels;
}

function batteryNameToType(name) {
  switch (name) {
    case "lipo":
      return "BatteryType.LI_PO";
    case "liLon":
    case "liio":
      return "BatteryType.LI_IO";
    case "life":
      return "BatteryType.LI_FE";
    case "lihv":
      return "BatteryType.LI_HV";
    case "nimh":
      return "BatteryType.NI_MH";
    case "nicd":
      return "BatteryType.NI_CD";
    case "pb":
      return "BatteryType.PB";
    case "pbagm":
      return "BatteryType.PB_AGM";
    default:
      return fail(`Unknown battery name: ${name}`);
  }
}

function modelNameToOperationMode(name) {
  switch (name) {
    case "balance":
      return "OperationMode.BALANCE_CHARGE";
    case "charge":
      return "OperationMode.CHARGE";
    case "discharge":
      return "OperationMode.DISCHARGE";
    case "storage":
      return "OperationMode.STORAGE";
    case "re_peak":
      return "OperationMode.RE_PEAK";
    case "cycle":
      return "OperationMode.CYCLE";
    case "fast_charge":
      return "OperationMode.FAST_CHARGE";
    case "auto_charge":
      return "OperationMode.AUTO_CHARGE";
    case "cold":
      return "OperationMode.COLD";
    case "agm":
      return "OperationMode.AGM";
    default:
      return fail(`Unknown model name: ${name}`);
  }
}

// Avoid floating point noise such as 4.18 * 1000 = 4179.999999999999.
function scale(value, factor) {
  return Number((value * factor).toFixed(6));
}

// Scaled (mV / mA) attributes are always expanded one property per line;
// prettier keeps an object expanded when its first property starts on a new line.
function generateAttr(options, { option, scale: factor }) {
  const found = options.find((o) => o.name === option);
  if (!found) return "null";
  const { min, max, step, default: def } = found;
  const brace = factor === 1 ? "{" : "{\n";
  return `${brace} min: ${scale(min, factor)}, max: ${scale(max, factor)}, step: ${scale(step, factor)}, default: ${scale(def, factor)} }`;
}

/**
 * Read every source and group by device type:
 * Map<DeviceType, { item, settings: { minVersion, source, batterys }[] }>.
 */
function loadDevices() {
  const devices = new Map();
  for (const { file, minVersions } of SOURCES) {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) fail(`File not found: ${filePath}`);

    let data;
    try {
      data = loadJson(filePath);
    } catch (err) {
      fail(`Failed to read or parse ${file}: ${err.message}`);
    }

    const types = data.map((item) => deviceNameToType(item.DeviceName));
    Object.keys(minVersions)
      .filter((type) => !types.includes(type))
      .forEach((type) => fail(`${file} has no device ${type}`));

    data.forEach((item, i) => {
      const type = types[i];
      const minVersion = minVersions[type] ?? 0;
      let device = devices.get(type);
      if (!device) {
        device = { item, settings: [] };
        devices.set(type, device);
      } else if (generateDeviceAttr(device.item) !== generateDeviceAttr(item)) {
        fail(`${file}: device attributes of ${type} differ from earlier file`);
      }
      const duplicate = device.settings.find((s) => s.minVersion === minVersion);
      if (duplicate) {
        fail(
          `${type} minVersion ${minVersion} defined in both ${duplicate.source} and ${file}`,
        );
      }
      device.settings.push({ minVersion, source: file, batterys: item.batterys });
    });
  }
  for (const device of devices.values()) {
    device.settings.sort((a, b) => a.minVersion - b.minVersion);
  }
  return devices;
}

function generateDeviceAttr(item) {
  const lines = [];
  lines.push(`  [DeviceType.${deviceNameToType(item.DeviceName)}]: {`);
  lines.push(
    `    bytes: new Uint8Array([${item.DeviceType.match(/[\da-f]{2}/gi)
      .map((byte) => `0x${byte}`)
      .join(", ")}]),`,
  );
  lines.push(`    name: ${JSON.stringify(item.DeviceName)},`);
  lines.push(`    channels: [${getChannels(item.channel).join(", ")}],`);
  lines.push(`    passwordEnable: ${item.passwordEnable === 1},`);
  lines.push(`  },`);
  return lines.join("\n");
}

function generateSupportedBatteryTypes(batterys) {
  const lines = [];
  lines.push(`      supportedBatteryTypes: {`);
  batterys.forEach((battery) => {
    lines.push(`        [${batteryNameToType(battery.name)}]: {`);
    battery.model.forEach((model) => {
      if (model.name === "Parallel Charging") return;
      lines.push(`          [${modelNameToOperationMode(model.name)}]: {`);
      ATTR_FIELDS.forEach((field) => {
        lines.push(
          `            ${field.key}: ${generateAttr(model.options, field)},`,
        );
      });
      lines.push(`          },`);
    });
    lines.push(`        },`);
  });
  lines.push(`      },`);
  return lines.join("\n");
}

function generateDeviceSettings(type, { settings }) {
  const lines = [];
  lines.push(`  [DeviceType.${type}]: [`);
  settings.forEach(({ minVersion, batterys }) => {
    lines.push(`    {`);
    lines.push(`      minVersion: ${minVersion},`);
    lines.push(generateSupportedBatteryTypes(batterys));
    lines.push(`    },`);
  });
  lines.push(`  ],`);
  return lines.join("\n");
}

function generateSource(devices) {
  const entries = [...devices.entries()];
  const deviceTypes = entries.map(([type]) => type).sort();

  return [
    HEADER,
    `/** Device model identifier. */`,
    `export enum DeviceType {`,
    ...deviceTypes.map((type) => `  ${type},`),
    `}`,
    ``,
    INTERFACES,
    `export const DEVICE_ATTR: Record<DeviceType, DeviceAttr> = {`,
    ...entries.map(([, device]) => generateDeviceAttr(device.item)),
    `};`,
    ``,
    `/** Settings per device, sorted by ascending minVersion. */`,
    `export const DEVICE_SETTINGS: Record<DeviceType, DeviceSettings[]> = {`,
    ...entries.map(([type, device]) => generateDeviceSettings(type, device)),
    `};`,
    ``,
    FOOTER,
  ].join("\n");
}

async function main() {
  const outputPath = process.argv[2] || defaultOutputPath;

  const devices = loadDevices();

  const formatPath = outputPath === "-" ? defaultOutputPath : outputPath;
  const config = (await prettier.resolveConfig(formatPath)) || {};
  const source = await prettier.format(generateSource(devices), {
    ...config,
    filepath: formatPath,
    endOfLine: "crlf",
  });

  if (outputPath === "-") {
    process.stdout.write(source);
  } else {
    fs.writeFileSync(outputPath, source);
    console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
  }
}

main().catch((err) => fail(err.stack || String(err)));
