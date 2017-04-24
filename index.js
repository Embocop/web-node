'use strict';

global.__data = __dirname + '/data/';
global.__app = __dirname + '/app_modules/';

const express = require('express');
const app = express();
const router = require("./routes/index.js");
var bodyParser = require('body-parser');
const db = require(__app + "db");

db.configure();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.set("view engine", "pug");

app.use("/", router);

app.use('/css', express.static('front/resources/css'));
app.use('/images', express.static('front/resources/images'));
app.use('/js', express.static('front/resources/js'));

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });
  // [END server]
}

module.exports = app;
