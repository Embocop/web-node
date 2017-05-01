'use strict';

global.__data = __dirname + '/data/';
global.__app = __dirname + '/app_modules/';

const express     = require('express');
const app         = express();
const http        = require("http").Server(app);
const router      = require("./routes/index.js");
const morgan      = require("morgan");
const io          = require("socket.io")(http);
const compression = require("compression");

var bodyParser    = require('body-parser');

const db          = require(__app + "db");


// Configure db connect
db.configure();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

app.use(morgan('dev'));

// parse application/json
app.use(bodyParser.json({limit: '50mb'}));

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

http.listen(80);

io.on('connection', function (socket){
  socket.emit('news', {hello: 'world'});
  socket.on('my other event', function (data) {
    console.log(data);
  });
})

module.exports = app;
