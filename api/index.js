var router = require("express").Router();

router.get("/", (req, res) => {
  res.send("API");
})

module.exports = router;
