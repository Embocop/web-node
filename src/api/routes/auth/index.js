const express = require('express');
const router = new express.Router();
const auth = require('../../tg_modules/tg-auth');

const {
    response: Response,
    success: Success,
} = require('../../tg_modules/tg-responses');
const User = require('../../tg_modules/tg-models').User;

// /api/auth/user
router.route('/status')
    .post((req, res, next) => {
        let user;
        if (req.cookies.usertoken === undefined) {
            try {
                user = new User(req.body);
            }
            catch(e) {
                res.status(500).send(Response.parse(e));
                return;
            }
            user.login()
                .then((token) => {
                    res.cookie('usertoken', token, {
                        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                        httpOnly: true,
                        // TODO: uncomment in production
                        secure: true,
                    });
                    auth.verifyUserToken(token)
                        .then((data) => {
                            res.status(201)
                                .send(Response.parse(new Success.CreationSuccess(data.data)));
                        })
                        .catch((err) => {
                            next(err);
                        });
                })
                .catch((err) => {
                    next(err);
                });
        }
        else {
            auth.verifyUserToken(req.cookies.usertoken)
                .then((data) => {
                    res.status(201).send(Response.parse(new Success.CreationSuccess(data.data)));
                })
                .catch((err) => {
                    next(err);
                });
        }
    })
    .delete((req, res) => {
        if (req.cookies.usertoken) {
            res.clearCookie('usertoken');
            res.send(Response.parse(new Success.DeletionSuccess()));
        }
        else {
            res.send(Response.parse(new Success.DeletionSuccess()));
        }
    })
    .get((req, res, next) => {
        const token = req.cookies.usertoken;
        auth.verifyUserToken(token)
            .then((data) => {
                res.send(Response.parse(data));
            })
            .catch((err) => {
                next(err);
            });
    });


// Export routing module
module.exports = router;
