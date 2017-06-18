const router = require("express").Router();
const auth = require(__app + "auth");

router.get('/', (req, res) => {
    const login = (req, res, error) => { res.render("app.pug"); };
    const success = (req, res) => { res.render("index.pug"); };

    if (req.cookies.usertoken != null) {
        auth.loginverification(req, res, login, success);
    } else {
        login(req, res);
    }
});


module.exports = router;