const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const constants = require("./constants");
const lkModule = process.env.LK_MODULE;
const entryPoints = require("../" + lkModule + "/entryPoints.js");
const fs = require("fs");

let entries = {};
let plugins = [];
const templates = {
  main: fs.existsSync("./webpack/app.template.html")
    ? "./webpack/app.template.html"
    : "../webpack/app.template.html",
  view: fs.existsSync("./webpack/app.view.template.xml")
    ? "./webpack/app.view.template.xml"
    : "../webpack/app.view.template.xml",
  webpart: fs.existsSync("./webpack/app.webpart.template.xml")
    ? "./webpack/app.webpart.template.xml"
    : "../webpack/app.webpart.template.xml",
};
for (let i = 0; i < entryPoints.apps.length; i++) {
  const entryPoint = entryPoints.apps[i];

  entries[entryPoint.name] = entryPoint.path + "/app.tsx";

  plugins = plugins.concat([
    new HtmlWebpackPlugin({
      inject: false,
      name: entryPoint.name,
      title: entryPoint.title,
      frame: entryPoint.frame,
      filename: "../../../views/" + entryPoint.name + ".view.xml",
      template: templates.view,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      filename: "../../../views/" + entryPoint.name + ".html",
      template: templates.main,
      domElementId: entryPoint.domElementId,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      name: entryPoint.name,
      title: entryPoint.title,
      filename: "../../../views/" + entryPoint.name + ".webpart.xml",
      template: templates.webpart,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      mode: "dev",
      name: entryPoint.name + "Dev",
      title: entryPoint.title + " Dev",
      frame: entryPoint.frame,
      filename: "../../../views/" + entryPoint.name + "Dev.view.xml",
      template: templates.view,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      mode: "dev",
      name: entryPoint.name,
      filename: "../../../views/" + entryPoint.name + "Dev.html",
      template: templates.main,
      domElementId: entryPoint.domElementId,
    }),
    new HtmlWebpackPlugin({
      inject: false,
      mode: "dev",
      name: entryPoint.name + "Dev",
      title: entryPoint.title + " Dev",
      filename: "../../../views/" + entryPoint.name + "Dev.webpart.xml",
      template: templates.webpart,
    }),
  ]);
}

plugins.push(new MiniCssExtractPlugin());

// set based on the lk module calling this config
module.exports = {
  context: constants.context(lkModule),

  mode: "production",

  devtool: "source-map",

  entry: entries,

  output: {
    path: constants.outputPath(lkModule),
    publicPath: "./", // allows context path to resolve in both js/css
    filename: "[name].js",
  },

  module: {
    rules: [
      ...constants.loaders.TYPESCRIPT_LOADERS_DEV.concat(
        constants.loaders.STYLE_LOADERS
      ),
      ...constants.loaders.IMAGE_LOADERS,
    ],
  },

  resolve: {
    extensions: constants.extensions.TYPESCRIPT,
  },

  plugins: plugins,
};
