const router = require("express").Router(),
    db = require(__app + "db"),
    auth = require(__app + "auth"),
    response = require(__app + "response"),
    bcrypt = require('bcrypt'),
    error = response.error;

router
    .post('/login', (req, res) => {
        const fields = ["username", "password"],
            cookie = req.body.remember;
           
        let credentials = auth.requireFields(req.body, fields);

        const successcallback = function (user) {
            if (user.length > 0) {
                auth.testPassword(credentials.password, user[0].password, res, () => {
                    delete user[0].password;
                    const token = auth.createToken(user[0], { expiresIn: "7d" });
                    if (cookie) {
                        res.cookie('usertoken', token, { maxAge: 604800, httpOnly: true });
                    };
                    res.status(200).send({ success: true, status: 200, token: token });
                });
            } else {
                nonecallback();
            }
        }
        const nonecallback = function () {
            res.status(400).send(error.NoUsers);
        }
        const failcallback = function (err) {
            res.status(400).send(error.Database(err));
        }

        if (credentials && credentials.username) {
            db.connection
                .where({ username: credentials.username })
                .select("username", "uid", "password", "email", "role")
                .from("users")
                .then(successcallback, failcallback);
        } else {
            res.status(400).send(error.IncompleteRequest);
        }
    })
    .post('/logout', (req, res) => {
        auth.userverification(req, res, () => {
            res.clearCookie("usertoken");
            res.status(200).send({ success: true, status: 200 });
        });
    })
    .post("/verify", (req, res) => {
        const success = function () {
            res.status(200).send({ success: true, status: 200, user: req.decoded });
        }

        auth.userverification(req, res, success);

    });

module.exports = router;
