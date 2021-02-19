
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const constants = require('./constants');
const lkModule = "AboutPage";
const entryPoints = require("../" + lkModule + "/entryPoints.js");

let entries = {};
let plugins = [];
for (let i = 0; i < entryPoints.apps.length; i++) {
    const entryPoint = entryPoints.apps[i];

    entries[entryPoint.name] = entryPoint.path + '/app.tsx';

    plugins = plugins.concat([
        new HtmlWebpackPlugin({
            inject: false,
            name: entryPoint.name,
            title: entryPoint.title,
            frame: entryPoint.frame,
            filename: '../../../views/' + entryPoint.name + '.view.xml',
            template: '../webpack/app.view.template.xml'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            filename: '../../../views/' + entryPoint.name + '.html',
            template: '../webpack/app.template.html'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            name: entryPoint.name,
            title: entryPoint.title,
            filename: '../../../views/' + entryPoint.name + '.webpart.xml',
            template: '../webpack/app.webpart.template.xml'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            mode: 'dev',
            name: entryPoint.name + "Dev",
            title: entryPoint.title + " Dev",
            frame: entryPoint.frame,
            filename: '../../../views/' + entryPoint.name + 'Dev.view.xml',
            template: '../webpack/app.view.template.xml'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            mode: 'dev',
            name: entryPoint.name,
            filename: '../../../views/' + entryPoint.name + 'Dev.html',
            template: '../webpack/app.template.html'
        }),
        new HtmlWebpackPlugin({
            inject: false,
            mode: 'dev',
            name: entryPoint.name + "Dev",
            title: entryPoint.title + " Dev",
            filename: '../../../views/' + entryPoint.name + 'Dev.webpart.xml',
            template: '../webpack/app.webpart.template.xml'
        })
    ]);
}

plugins.push(new MiniCssExtractPlugin());

// set based on the lk module calling this config
module.exports = {
    context: constants.context(lkModule),

    mode: 'production',

    devtool: 'source-map',

    entry: entries,

    output: {
        path: constants.outputPath(lkModule),
        publicPath: './', // allows context path to resolve in both js/css
        filename: '[name].js'
    },

    module: {
        rules: constants.loaders.TYPESCRIPT_LOADERS.concat(constants.loaders.STYLE_LOADERS)
    },

    resolve: {
        extensions: constants.extensions.TYPESCRIPT
    },

    plugins: plugins
};

