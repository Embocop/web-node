var router = require("express").Router();
const render_tools = require(__app + "render");

router.get("/", (req, res) => {
    let flag = false;
    if (req.cookies.token != null) {
        const exp = require(__data + "index.json");
        const desc = require(__data + "descriptions.json");
        const locals = {
            experiment: exp.experiment,
            description: desc.descriptions,
            tools: render_tools
        }
    }
    if (!flag) {
        res.render('index.pug');
    }
  
});

module.exports = router;
