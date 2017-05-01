var router        = require("express").Router();
var db            = require(__app + "db");
var auth          = require(__app + "auth");
var response      = require(__app + "response");
var error         = response.error;

router.use(/^\/.+$/, auth.userverification);

router.post('/', (req, res) => {
  var user = new db.User(req.body);
  var hashCallback = function(hash) {
    user.Password = hash;
    user.save((err) => {
      if (err) {
        res.status(500).send(error.Database(err));
        //throw err;
      } else {
        res.status(201).send({ success: true, status : 201, message: "User created successfully!" });
      }
    });
  };
  if (user.Password) {
    auth.createPasswordHash(user.Password, hashCallback);
  } else {
    res.status(400).send(error.IncompleteRequest);
  }
});

module.exports = router;
