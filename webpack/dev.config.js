/*
 * Copyright (c) 2019 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
const constants = require("./constants");
const lkModule = process.env.LK_MODULE;
const entryPoints = require(`../${lkModule}/entryPoints.js`);
const webpack = require(`../${lkModule}/node_modules/webpack`);

const devServer = {
  host: "localhost",
  port: 3001,

  // enable the HMR on the server
  hot: true,

  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers":
      "X-Requested-With, content-type, Authorization",
  },

  compress: true,
  overlay: true,
};

const devServerURL = "http://" + devServer.host + ":" + devServer.port;

let entries = {};
for (let i = 0; i < entryPoints.apps.length; i++) {
  const entryPoint = entryPoints.apps[i];

  entries[entryPoint.name] = [
    // activate HMR for React
    "react-hot-loader/patch",

    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    "webpack-dev-server/client?" + devServerURL,

    "webpack/hot/only-dev-server",

    entryPoint.path + "/dev.tsx",
  ];
}

module.exports = {
  // Note:  __dirname is a node-generated global variable, which is the directory of this file.
  context: constants.context(lkModule),

  mode: "development",

  devServer: devServer,

  entry: entries,

  output: {
    path: constants.outputPath(lkModule),
    publicPath: devServerURL + "/",
    filename: "[name].js",
    crossOriginLoading: "anonymous",
  },

  devtool: "cheap-module-source-map", // to handle cross-origin errors

  resolve: {
    extensions: constants.extensions.TYPESCRIPT,
  },

  module: {
    rules: [
      ...constants.loaders.TYPESCRIPT_LOADERS_DEV.concat(
        constants.loaders.STYLE_LOADERS
      ),
    ],
  },

  plugins: [
    // enable HMR globally
    new webpack.HotModuleReplacementPlugin(),
  ],
};
