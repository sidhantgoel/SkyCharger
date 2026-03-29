import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";

import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";
import { MakerMSIX } from "@electron-forge/maker-msix";
import { MakerWix } from "@electron-forge/maker-wix";
import { MakerAppX } from "@electron-forge/maker-appx";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerPKG } from "@electron-forge/maker-pkg";
import { PublisherGithub } from "@electron-forge/publisher-github";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: "./images/icon",
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin", "mas", "win32", "linux"]),
    new MakerRpm({}),
    new MakerDeb({ options: { icon: "./images/icon.png" } }),
    new MakerMSIX({}),
    new MakerWix({
      icon: "./images/icon.ico",
      ui: {
        chooseDirectory: true,
      },
    }),
    new MakerAppX({}),
    new MakerDMG({ icon: "./images/icon.icns" }),
    new MakerPKG({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      mainConfig,
      devContentSecurityPolicy: "connect-src 'self' * 'unsafe-eval'",
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: "./src/index.html",
            js: "./src/renderer.ts",
            name: "main_window",
            preload: {
              js: "./src/preload.ts",
            },
          },
        ],
      },
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: "sidhantgoel",
        name: "skycharger",
      },
    }),
  ],
};

export default config;
