/**
 * Read and parse a JSON file, then run a small processor.
 * Usage: node process.js [path/to/file.json]
 * Default: battery.json next to this script.
 */

const fs = require("fs");
const path = require("path");

const defaultJsonPath = path.join(__dirname, "battery.json");

function loadJson(filePath) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, "utf8");
  return JSON.parse(raw);
}

function processData(data) {
  // Example: adapt to your JSON shape (battery.json is large Lottie-style data).
  if (data == null) return { note: "empty" };
  if (Array.isArray(data)) {
    return { type: "array", length: data.length };
  }
  if (typeof data === "object") {
    return {
      type: "object",
      keys: Object.keys(data).slice(0, 20),
      keyCount: Object.keys(data).length,
    };
  }
  return { type: typeof data };
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
      console.error(`Unknown battery name: ${name}`);
      process.exit(1);
      return null;
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
      console.error(`Unknown model name: ${name}`);
      process.exit(1);
      return null;
  }
}
function main() {
  const inputPath = process.argv[2] || defaultJsonPath;

  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  let data;
  try {
    data = loadJson(inputPath);
  } catch (err) {
    console.error("Failed to read or parse JSON:", err.message);
    process.exit(1);
  }

  console.log(
    "export const BATTERY_TYPE_ATTR: Record<DeviceType, Record<BatteryType, Record<OperationMode, VoltageCurrentAttr>>> = {",
  );
  data.forEach((item) => {
    const deviceType = item.DeviceName.toUpperCase().replace(" ", "");
    console.log(`  [DeviceType.${deviceType}]: {`);
    console.log(
      `    bytes: new Uint8Array([${item.DeviceType.match(/[\da-f]{2}/gi)
        .map((char) => `0x${char}`)
        .join(", ")}]),`,
    );
    console.log(`    name: "${item.DeviceName}",`);
    console.log(`    channels: [${getChannels(item.channel).join(", ")}],`);
    console.log(
      `    passwordEnable: ${item.passwordEnable === 1 ? "true" : "false"},`,
    );
    console.log(`    supportedBatteryTypes: {`);
    item.batterys.forEach((battery) => {
      console.log(`      [${batteryNameToType(battery.name)}]: {`);
      battery.model.forEach((model) => {
        if (model.name === "Parallel Charging") {
          return;
        }
        console.log(`        [${modelNameToOperationMode(model.name)}]: {`);
        var voltageCharge = model.options.find(
          (option) => option.name === "voltage_charge",
        );
        if (voltageCharge)
          console.log(
            `          chargeVoltage: { min: ${voltageCharge.min * 1000}, max: ${voltageCharge.max * 1000}, step: ${voltageCharge.step * 1000}, default: ${voltageCharge.default * 1000} },`,
          );
        else console.log(`          chargeVoltage: null,`);
        var voltageDischarge = model.options.find(
          (option) => option.name === "voltage_discharge",
        );
        if (voltageDischarge)
          console.log(
            `          dischargeVoltage: { min: ${voltageDischarge.min * 1000}, max: ${voltageDischarge.max * 1000}, step: ${voltageDischarge.step * 1000}, default: ${voltageDischarge.default * 1000} },`,
          );
        else console.log(`          dischargeVoltage: null,`);
        var chargeCurrent = model.options.find(
          (option) => option.name === "charger electricity",
        );
        if (chargeCurrent)
          console.log(
            `          chargeCurrent: { min: ${chargeCurrent.min * 1000}, max: ${chargeCurrent.max * 1000}, step: ${chargeCurrent.step * 1000}, default: ${chargeCurrent.default * 1000} },`,
          );
        else console.log(`          chargeCurrent: null,`);
        var dischargeCurrent = model.options.find(
          (option) => option.name === "disCharger electricity",
        );
        if (dischargeCurrent)
          console.log(
            `          dischargeCurrent: { min: ${dischargeCurrent.min * 1000}, max: ${dischargeCurrent.max * 1000}, step: ${dischargeCurrent.step * 1000}, default: ${dischargeCurrent.default * 1000} },`,
          );
        else console.log(`          dischargeCurrent: null,`);
        var cycleModel = model.options.find(
          (option) => option.name === "cycle_model",
        );
        if (cycleModel)
          console.log(
            `          cycleModel: { min: ${cycleModel.min}, max: ${cycleModel.max}, step: ${cycleModel.step}, default: ${cycleModel.default} },`,
          );
        else console.log(`          cycleModel: null,`);
        var cycleNumber = model.options.find(
          (option) => option.name === "cycle_number",
        );
        if (cycleNumber)
          console.log(
            `          cycleNumber: { min: ${cycleNumber.min}, max: ${cycleNumber.max}, step: ${cycleNumber.step}, default: ${cycleNumber.default} },`,
          );
        else console.log(`          cycleNumber: null,`);
        var repeakNumber = model.options.find(
          (option) => option.name === "repeak_number",
        );
        if (repeakNumber)
          console.log(
            `          repeakNumber: { min: ${repeakNumber.min}, max: ${repeakNumber.max}, step: ${repeakNumber.step}, default: ${repeakNumber.default} },`,
          );
        else console.log(`          repeakNumber: null,`);
        var trackVoltage = model.options.find(
          (option) => option.name === "track_voltage",
        );
        if (trackVoltage)
          console.log(
            `          trackVoltage: { min: ${trackVoltage.min}, max: ${trackVoltage.max}, step: ${trackVoltage.step}, default: ${trackVoltage.default} },`,
          );
        else console.log(`          trackVoltage: null,`);
        var voltage = model.options.find((option) => option.name === "v");
        if (voltage)
          console.log(
            `          voltage: { min: ${voltage.min * 1000}, max: ${voltage.max * 1000}, step: ${voltage.step * 1000}, default: ${voltage.default * 1000} },`,
          );
        else console.log(`          voltage: null,`);
        console.log(`        },`);
      });
      console.log(`      },`);
    });
    console.log(`    },`);
    console.log(`  },`);
  });
  console.log("}");
}

main();
