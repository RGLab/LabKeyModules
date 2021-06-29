const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const devMode = process.env.NODE_ENV !== 'production';
const lkModule = process.env.LK_MODULE;

module.exports = {
    context: function(dir) {
        return path.resolve(dir, '..');
    },
    extensions: {
        TYPESCRIPT: [ '.jsx', '.js', '.tsx', '.ts' ],
        STYLE: [ '.scss' ]
    },
    loaders: {
        STYLE_LOADERS: [
            {
                test: /\.css$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1
                        }
                    },{
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }]
            },
         ],
        TYPESCRIPT_LOADERS: [
            {
                test: /^(?!.*spec\.tsx?$).*\.tsx?$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        cacheDirectory: true,
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ]
                    }
                },{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true
                        // this flag and the test regex will make sure that test files do not get bundled
                        // see: https://github.com/TypeStrong/ts-loader/issues/267
                    }
                }]
            }
        ],
        TYPESCRIPT_LOADERS_DEV: [
            {
                test: /^(?!.*spec\.tsx?$).*\.tsx?$/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        cacheDirectory: true,
                        presets: [
                            "@babel/preset-env",
                            "@babel/preset-react"
                        ],
                        plugins: [
                            "react-hot-loader/babel"
                        ]
                    }
                },{
                    loader: 'ts-loader',
                    options: {
                        onlyCompileBundledFiles: true
                        // this flag and the test regex will make sure that test files do not get bundled
                        // see: https://github.com/TypeStrong/ts-loader/issues/267
                    }
                }]
            }
        ]
    },
    outputPath: function(dir) {
        return path.resolve(dir, '../resources/web/' + lkModule + '/gen');
    }
};