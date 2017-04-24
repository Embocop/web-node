var router = require("express").Router();
const render_tools = require(__app + "render");

router.get("/", (req, res) => {
  const exp = require(__data + "index.json");
  const desc = require(__data + "descriptions.json");
  const locals = {
    experiment : exp.experiment,
    description : desc.descriptions,
    tools : render_tools
  }
  res.render('index.pug', locals);
});

module.exports = router;
