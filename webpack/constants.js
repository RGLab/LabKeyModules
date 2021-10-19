const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";
const lkModule = process.env.LK_MODULE;

module.exports = {
  context: function (dir) {
    return path.resolve(dir, "..");
  },
  extensions: {
    TYPESCRIPT: [".jsx", ".js", ".tsx", ".ts"],
    STYLE: [".scss"],
  },
  loaders: {
    STYLE_LOADERS: [
      {
        test: /\.css$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
      {
        test: /\.scss$/,
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/, // https://stackoverflow.com/questions/41731760/webpack-problems-importing-font-awesome-library, https://gist.github.com/Turbo87/e8e941e68308d3b40ef6#gistcomment-1946990
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000,
            },
          },
        ],
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
    TYPESCRIPT_LOADERS: [
      {
        test: /^(?!.*spec\.tsx?$).*\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              cacheDirectory: true,
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
              // this flag and the test regex will make sure that test files do not get bundled
              // see: https://github.com/TypeStrong/ts-loader/issues/267
            },
          },
        ],
      },
    ],
    TYPESCRIPT_LOADERS_DEV: [
      {
        test: /^(?!.*spec\.tsx?$).*\.tsx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              cacheDirectory: true,
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: ["react-hot-loader/babel"],
            },
          },
          {
            loader: "ts-loader",
            options: {
              onlyCompileBundledFiles: true,
              // this flag and the test regex will make sure that test files do not get bundled
              // see: https://github.com/TypeStrong/ts-loader/issues/267
            },
          },
        ],
      },
    ],
    IMAGE_LOADERS: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  outputPath: function (dir) {
    return path.resolve(dir, "../resources/web/" + lkModule + "/gen");
  },
};
