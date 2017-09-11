const path = require('path');
const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

const nodeExternals = require('webpack-node-externals');
const externalNodeModules = path.resolve(__dirname, 'node_modules');
const extractCSS = new ExtractTextWebpackPlugin('css/[name].css');

module.exports = [{
    entry: [
        './src/api/index.js',
    ],
    module: {
        rules: [{
                test: /\.js$/,
                exclude: externalNodeModules,
            },
            {
                test: /\.js$/,
                exclude: externalNodeModules,
                loader: 'eslint-loader',
                enforce: 'pre',
            },
            {
                test: /\.js$/,
                exclude: externalNodeModules,
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                },
            },
        ],
    },
    node: {
        __dirname: true,
    },
    target: 'node',
    externals: [nodeExternals()],
    output: {
        path: path.join(__dirname, 'dist', 'api'),
        filename: 'bundled.js',
        libraryTarget: 'umd',
    },
    resolve: {
        modules: [
            'node_modules',
            'src/node_modules',
            'src',
        ],
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: true,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
            },
            compress: {
                screw_ie8: false,
            },
            comments: true,
        }),
    ],
}, {
    entry: {
        'app': './src/entry/app.js',
        '404': './src/entry/404.js',
    },
    module: {
        rules: [{
                test: /\.js$/,
                exclude: [
                    externalNodeModules,
                    path.resolve(__dirname, 'src/static/js/third_party'),
                ],
                loader: 'eslint-loader',
                enforce: 'pre',
            },
            {
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
        publicPath: '/',
        path: path.join(__dirname, 'dist', 'web', 'static'),
        filename: 'js/[name].js',
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
        new webpack.optimize.UglifyJsPlugin({
            beautify: false,
            mangle: {
                screw_ie8: true,
                keep_fnames: true,
            },
            compress: {
                screw_ie8: true,
            },
            comments: false,
        }),
        new CleanWebpackPlugin(['dist']),
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
}];
