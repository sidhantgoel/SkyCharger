# SkyCharger

A desktop app for monitoring and controlling SkyRC battery chargers over Bluetooth Low Energy. It runs on Windows, macOS and Linux.

> SkyCharger is an independent project. It is not affiliated with or endorsed by SkyRC.

## Features

- **Connect over Bluetooth:** scan for nearby chargers and connect from the app. Password-protected chargers are supported.
- **Live channel status:** each charging channel has its own tab showing state, voltage, current, capacity, elapsed time, temperatures and internal resistance.
- **Per-cell readings:** cell voltages, an estimated state of charge and per-cell internal resistance, when the balance lead is connected.
- **Start and stop charging:** choose the battery type, operation mode, cell count and charge parameters. The options offered are limited to what the connected charger supports for its firmware version.
- **Channel settings:** capacity and time limits, recycle time, balancing, and key and system sounds.
- **Firmware updates:** check SkyRC's update server for newer firmware and install it over Bluetooth.
- **Error reporting:** charger and channel errors are shown with readable messages.

### Battery types and modes

| Chemistry | Battery types | Modes |
|---|---|---|
| Lithium | LiPo, Li-ion, LiFe, LiHV | Balance charge, charge, discharge, storage, fast charge |
| Nickel | NiMH, NiCd | Charge, auto charge, discharge, re-peak, cycle |
| Lead acid | Pb, Pb AGM | Charge, discharge |

The modes available for each battery type also depend on the charger model and its firmware version.

## Supported chargers

| Model | Channels |
|---|---|
| Q200 | 4 |
| Q200 V2 | 4 |
| Q200 neo | 4 |
| D200s | 2 |
| D200 Nex | 2 |
| D100 | 2 |
| D260 | 2 |
| B6 nano | 1 |
| B6 evo | 1 |
| ACC6 | 1 |

The app identifies the model from the charger's device information when you connect.

## Installation

Download the installer for your platform from the [Releases](https://github.com/sidhantgoel/SkyCharger/releases) page.

Your computer needs Bluetooth Low Energy (Bluetooth 4.0 or later).

## Usage

1. Turn on the charger and make sure Bluetooth is enabled on your computer.
2. Click **Scan**. Nearby Bluetooth devices appear in the **Device Selection** list.
3. Select your charger and click **Connect**.
4. If the charger asks for a password, enter it. The default is `0000`.
5. Each channel opens in its own tab. Pick the battery type, mode, cell count and parameters, then click **Start**.

The **Firmware Update** tab shows the installed and latest firmware versions and can install the update.

> **Safety:** never leave batteries unattended while charging, and always check that the battery type, cell count and current suit your pack. The state-of-charge percentage is an estimate from voltage and is less accurate while charging, especially for nickel batteries.

## Development

### Requirements

- [Node.js](https://nodejs.org/) 20 or later
- npm

### Getting started

```sh
git clone https://github.com/sidhantgoel/SkyCharger.git
cd SkyCharger
npm install
npm start
```

`npm start` runs the app in development mode with hot reload. In development, DevTools opens in a separate window, and the React and Redux DevTools extensions are installed.

### Scripts

| Command | What it does |
|---|---|
| `npm start` | Run the app in development mode |
| `npm run lint` | Run ESLint |
| `npm run package` | Package the app for the current platform, without an installer |
| `npm run make` | Build installers for the current platform into `out/make` |
| `npm run publish` | Build and publish installers to a GitHub release |

### Tech stack

- [Electron](https://www.electronjs.org/) with [Electron Forge](https://www.electronforge.io/) and webpack
- [React](https://react.dev/) and [Material UI](https://mui.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/), with [redux-persist](https://github.com/rt2zz/redux-persist) to remember the charger password
- The [Web Bluetooth API](https://developer.mozilla.org/docs/Web/API/Web_Bluetooth_API), served through Electron
- TypeScript

### Project structure

```
src/
├── index.ts            Electron main process (window, Bluetooth device picker)
├── preload.ts          Bridge between the main process and the app UI
├── MainPage.tsx        Connection controls and channel tabs
├── components/         Channel panels, charging options, settings and firmware UI
├── commands/           Binary commands sent to the charger
├── responses/          Parsers for the charger's replies
├── enums/              Battery types, operation modes, error codes, device definitions
├── redux/              Store, slices and thunks
├── utils/              Bluetooth connection, frame parser, firmware updater
└── assets/             Device definition data and its generator script
```

### Device definitions

`src/enums/DeviceTypes.ts` is generated from SkyRC's device definition files in `src/assets/`. Don't edit it by hand. To regenerate it:

```sh
node src/assets/process.js
```

The script reads:

- **`battery.json`:** settings for every charger. These apply from firmware version 0.
- **`battery_196_197_info.json`:** newer settings for the Q200 neo (from firmware 3.21) and the D200 Nex (from firmware 3.0).

To add another settings file or change the firmware versions, edit the `SOURCES` list at the top of `process.js`. At runtime, `getSupportedBatteryTypes(deviceType, version)` picks the settings with the highest minimum version that the charger's firmware meets.

Pass `-` as the output path to print the generated file instead of writing it:

```sh
node src/assets/process.js -
```

## Releases

Pushing a tag starts the [release workflow](.github/workflows/release.yml), which builds the app on Linux, Windows and macOS and publishes the installers to a GitHub release.

```sh
npm version patch
git push --follow-tags
```

macOS builds are signed and notarised. The workflow needs these repository secrets:

| Secret | Purpose |
|---|---|
| `CERTIFICATE_OSX_APPLICATION` | Base64-encoded `.p12` Developer ID Application certificate |
| `CERTIFICATE_OSX_INSTALLER` | Base64-encoded `.p12` Developer ID Installer certificate |
| `CERTIFICATE_PASSWORD` | Password for both certificates |
| `APPLE_ID` | Apple ID used for notarisation |
| `APPLE_PASSWORD` | App-specific password for that Apple ID |
| `APPLE_TEAM_ID` | Apple Developer team ID |

## License

[MIT](LICENSE) © Sidhant Goel
