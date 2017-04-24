'use strict';

global.__data = __dirname + '/data/';
global.__app = __dirname + '/app_modules/';

const express = require('express');
const app = express();
const router = require("./routes/index.js");
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// // mongoose.connect("mongodb://base:;L'd7&#Q>T'e:keN@35.185.100.121:27017/emails", (err, db) => {
// //   if(err) throw err;
// // });
// //
// // var Email = mongoose.model('Email', new Schema({
// //   name: String,
// //   email: String,
// //   beta: Boolean
// // }));
// //
// // var test = new Email({
// //   name: 'Theodore Kim',
// //   email: 'teddy@embi.io',
// //   beta: true
// // });
//
// // save the sample user
// test.save(function(err) {
//   if (err) throw err;
//
//   console.log('User saved successfully');
//   res.json({ success: true });
// });

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
