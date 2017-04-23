'use strict';

const express = require('express');

const app = express();

app.set("view engine", "pug");

app.get('/', (req, res) => {
  res.render('index.pug');
});

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
