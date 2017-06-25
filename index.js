'use strict';

global.__data = __dirname + '/data/';
global.__app = __dirname + '/app_modules/';
global.__top = __dirname + '/';

const express       = require('express');
const app           = express();
const http          = require("http").Server(app);
const morgan        = require("morgan");
const io            = require("socket.io")(http);
const compression   = require("compression");
const cookie = require("cookie-parser");
const process = require('process');
const Knex = require('knex');
const subdomain = require('express-subdomain');

// DEVELOPMENT
const knexLogger = require('knex-logger');

app.enable('trust proxy');

// Configurations 
const appInfo = require("./data/app.json");

// Routes
const router = require("./routes/index.js");
const apiSubRoute = require("./api/index.js");
const betaSubRoute = require("./routes/front/platform/beta/index.js");

var bodyParser    = require('body-parser');

const db          = require(__app + "db");
let knex

//DEVELOPMENT SQL CONNECTION
app.enable('trust proxy');

//app.set("secret" , config.app.secret);

// Configure db connect
//db.configure(config.db);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json({ limit: '50mb' }));
// parse cookies
app.use(cookie());

// FOR DEVELOPMENT ONLY
//app.use(morgan('dev'));
app.use(knexLogger(db.connection));

// Render engine for Pug -> HTML
app.set("view engine", "pug");


// Routing for main site
app.use("/", router);
// Subdomain routing
app.use(subdomain("api", apiSubRoute));
app.use(subdomain("beta", betaSubRoute));

app.use('/css', express.static('front/resources/css'));
app.use('/images', express.static('front/resources/images'));
app.use('/js', express.static('front/resources/js'));

// Start database connection
// Get type of SQL client to use
const sqlClient = process.env.SQL_CLIENT;

if (sqlClient === 'pg' || sqlClient === 'mysql') {
    knex = db.connection;
} else {
    throw new Error(`The SQL_CLIENT environment variable must be set to lowercase 'pg' or 'mysql'.`);
}

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

http.listen(80);

//io.on('connection', function (socket){
//  socket.emit('news', {hello: 'world'});
//  socket.on('my other event', function (data) {
//    console.log(data);
//  });
//});

module.exports = app;
