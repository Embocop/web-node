// #####################################################################
// Load resources
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const path = require('path');
const less = require('express-less');

// Log Requests for development in the console
// TODO: Remove in production version
// let morgan = require('morgan');
// let knexLogger = require('knex-logger');

let routes;
let port;
if(app.get('env') === 'production') {
    routes = require('./dist/api/bundled');
    port = 8081;

    app.set('views', path.resolve(__dirname, 'dist', 'web', 'views'));

    app.use(express.static(path.join(__dirname, 'dist', 'web', 'static')));
} else {
    const webpack = require('webpack');
    const webpackDevMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const config = require('./webpack.dev.config');
    const compiler = webpack(config);

    routes = require('./src/api/index.js');
    port = 3000;

    app.set('views', path.resolve(__dirname, 'src', 'views'));

    app.use(webpackDevMiddleware(compiler, {
        publicPath: config.output.publicPath,
        stats: {
            colors: true,
        },
    }));

    app.use(webpackHotMiddleware(compiler, {
        log: console.log,
    }));
}

app.set('view engine', 'pug');

// Enable bodyParser for POST requests
app.use(bodyParser.urlencoded({
    extended: true,
}));
app.use(bodyParser.json());
app.use(cookie());

// Development request logging
// TODO: Remove these lines in production release
// app.use(morgan('dev'));
// app.use(knexLogger(knex));

// LESS Compiling
app.use('/less', less(__dirname + '/src/static/less'));

// Route handling
app.use('/', routes);

// ##########################################################################
// Start server on specified port

let server = app.listen(port, function() {
    let host = server.address().addressIO;
    let port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
