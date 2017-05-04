var router        = require("express").Router();
var db            = require(__app + "db");
var auth          = require(__app + "auth");
var response      = require(__app + "response");

const error       = response.error;

var bcrypt        = require('bcrypt');

router.post('/login', (req, res) => {
  var fields = ["Username", "Password"];
  var credentials = auth.verifyFields(req.body, fields);

  var successcallback = function (data) {
    var user = data[0];
    console.log(user);
    auth.testPassword(credentials.Password, user.Password, res, () => {
      delete user.Password;
      delete user._id;
      delete user._v;
      var token = auth.createToken(user, { expiresIn: "7d" });
      res.status(200).send({success: true, status: 200, token: token});
    });
  }
  var nonecallback = function () {
    res.status(400).send(error.NoUsers);
  }

  var dbcallback = db.dbCallback(res, {success: successcallback, none: nonecallback});
  
  db.User.find({Username : credentials.Username}, dbcallback);

});

module.exports = router;
