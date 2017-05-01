var mailing_list  = require("./add_subscriber");
var experiment    = require("./experiment");
var router        = require("express").Router();

router.use("/add_subscriber", mailing_list);
router.use("/experiment", experiment);

module.exports = router;
