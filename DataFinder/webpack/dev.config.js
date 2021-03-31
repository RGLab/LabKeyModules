const config = require("./../../webpack/dev.config.js");
const entryPoints = require("../entryPoints.js");

const devServerURL = 'http://' + config.devServer.host + ':' + config.devServer.port;
debugger;
config.entry[entryPoints.banner.name] = [
    // activate HMR for React
    'react-hot-loader/patch',

    // bundle the client for webpack-dev-server
    // and connect to the provided endpoint
    'webpack-dev-server/client?' + devServerURL,

    'webpack/hot/only-dev-server',

    entryPoints.banner.path + '/dev.tsx'
]

module.exports = config;