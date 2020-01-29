const webpack = require('webpack');
const constants = require('./constants');
const entryPoints = require('./entryPoints');

const devServer = {
    host: 'localhost',
    port: 3001,

    // enable the HMR on the server
    hot: true,

    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
    },

    compress: true,
    overlay: true
};

const devServerURL = 'http://' + devServer.host + ':' + devServer.port;

let entries = {};
for (let i = 0; i < entryPoints.webparts.length; i++) {
    const entryPoint = entryPoints.webparts[i];

    entries[entryPoint.name] = [
        // activate HMR for React
        'react-hot-loader/patch',

        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint
        'webpack-dev-server/client?' + devServerURL,

        'webpack/hot/only-dev-server',

        entryPoint.path + '/dev.tsx'
    ];
}
entries[entryPoints.banner.name] = [
            // activate HMR for React
            'react-hot-loader/patch',

            // bundle the client for webpack-dev-server
            // and connect to the provided endpoint
            'webpack-dev-server/client?' + devServerURL,
    
            'webpack/hot/only-dev-server',
    
            entryPoints.banner.path + '/dev.tsx'
]
module.exports = {
    context: constants.context(__dirname),

    mode: 'development',

    devServer: devServer,

    entry: entries,

    output: {
        path: constants.outputPath(__dirname),
        publicPath: devServerURL + '/',
        filename: "[name].js"
    },

    resolve: {
        extensions: constants.extensions.TYPESCRIPT
    },

    module: {
        rules: constants.loaders.TYPESCRIPT_LOADERS_DEV.concat(constants.loaders.STYLE_LOADERS)
    },

    plugins: [
        // enable HMR globally
        new webpack.HotModuleReplacementPlugin(),

        // prints more readable modules names in the browser console on HMR updates
        new webpack.NamedModulesPlugin(),

        // do not emit compiled assets that include errors
        new webpack.NoEmitOnErrorsPlugin()
    ]
};