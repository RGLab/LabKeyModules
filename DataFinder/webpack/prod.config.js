const config = require('../../webpack/prod.config.js');
const entryPoints = require("../entryPoints")
const HtmlWebpackPlugin = require('html-webpack-plugin');

config.entry[entryPoints.banner.name] = entryPoints.banner.path + '/app.tsx' 
config.plugins.push(new HtmlWebpackPlugin({
    inject: false,
    filename: '../../../views/_banner.html',
    template: 'webpack/_banner.template.html'
}))

// Overwrite original DataFinder.view.xml with this one, with custom dependencies. 
config.plugins.push(new HtmlWebpackPlugin({
    inject: false,
    name: 'DataFinder',
    title: 'Data Finder',
    frame: 'none',
    filename: '../../../views/DataFinder.view.xml',
    template: 'webpack/app.view.template.xml'
})),
module.exports = config;