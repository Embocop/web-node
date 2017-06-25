var experiment    = require("./experiment");
var user          = require("./user");
var authapi       = require("./auth");

var auth          = require(__app + "auth");
var router        = require("express").Router();

// Protect entire api with app-level verification
//TODO: Uncomment out for production
//router.use(auth.appverification);

router.use("/experiment", experiment);
router.use("/user", user);
router.use("/auth", authapi);

router.all("*", (req, res) => {
  res.status(404).send({ success: false, error: "Page not found" });
});

module.exports = router;
