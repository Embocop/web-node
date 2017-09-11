const path = require('path');
const webpack = require('webpack');

const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

const externalNodeModules = path.resolve(__dirname, 'node_modules');
const extractCSS = new ExtractTextWebpackPlugin('css/[name].css');

module.exports = {
    entry: {
        'app': ['webpack-hot-middleware/client', './src/entry/app.js'],
        '404': ['webpack-hot-middleware/client', './src/entry/404.js'],
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: externalNodeModules,
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                },
            },
            {
                test: /\.css$/,
                exclude: externalNodeModules,
                use: extractCSS.extract({
                    fallback: 'style-loader',
                    use: 'css-loader',
                }),
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                exclude: externalNodeModules,
                loader: 'url-loader?limit=30000&name=font/[name].[ext]',

            },
            {
                test: /\.(png|jpg|gif|ico)$/,
                exclude: externalNodeModules,
                loader: 'file-loader?name=img/[name].[ext]',
            },
            {
                test: /\.html$/,
                use: 'raw-loader',
            },
        ],
    },
    output: {
        path: '/',
        publicPath: 'http://localhost:3000/',
        filename: 'js/[name].js',
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        extractCSS,
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jquery': 'jquery',
            'jQuery': 'jquery',
            'window.$': 'jquery',
            'window.jquery': 'jquery',
            'window.jQuery': 'jquery',
        }),
        new CopyWebpackPlugin([{
                from: 'views/**/*.pug',
                context: 'src/',
                to: '..',
            },
            {
                from: 'img/profile/**/*.{jpg,gif,png}',
                context: 'src/static/',
            },
        ]),
    ],
};