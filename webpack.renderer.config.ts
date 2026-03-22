import path from "path";
import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

// Plain CSS (e.g. @fontsource/roboto)
rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

// SCSS
rules.push({
  test: /\.scss$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "resolve-url-loader" },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: () => [require("autoprefixer")],
        },
      },
    },
    { loader: "sass-loader" },
  ],
});

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".scss"],
    alias: {
      // Match tsconfig "paths": { "src/*": ["src/*"] }
      src: path.resolve(__dirname, "src"),
    },
  },
};
