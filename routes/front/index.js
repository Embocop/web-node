var router = require("express").Router();
const render_tools = require(__app + "render");

router.get("/", (req, res) => {
    res.render('index.pug');
});

module.exports = router;
