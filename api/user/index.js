var router        = require("express").Router();
var db            = require(__app + "db");

router.post('/', (req, res) => {
  var user = new db.User(req.body);
  user.save();
});

module.exports = router;
