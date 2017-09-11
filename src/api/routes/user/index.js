const express = require('express');
const router = new express.Router();

const auth = require('../../tg_modules/tg-auth');
const requests = require('../../tg_modules/tg-requests');
const {
    error: Errors,
    response: Response,
} = require('../../tg_modules/tg-responses');
const {
    User,
    Post,
    Collection,
    Model,
} = require('../../tg_modules/tg-models');

// router.use(auth.authenticateApplication);
router.use(auth.authenticateUser);
router.use(requests.parseRequest);

router.route('')
    .get(function(req, res, next) {
        Model.createInstance(User, req.query.options.fields)
            .then((user) => {
                return Collection.createInstance(user, req.query.options);
            })
            .catch(next)
            .then((collection) => {
                return collection.populate();
            })
            .catch(next)
            .then((result) => {
                res.send(Response.parse(result, req));
            })
            .catch(next);
    })
    .post(function(req, res, next) {
        if(!req.body.password) next(new Errors.RequiredFields('password'));
        auth.cryptPassword(req.body.password)
            .catch(next)
            .then((password) => {
                req.body.password = password;
                return Model.createInstance(User, req.body);
            })
            .catch(next)
            .then((user) => {
                return user.post();
            })
            .catch(next)
            .then((response) => res.status(201).send(Response.serialize(response), req));
    });

// '/api/user/:id'
router.route('/:id([0-9]+)')
    .get((req, res, next) => {
        Model.createInstance(User, req.query.options.fields)
            .catch(next)
            .then((user) => {
                user.uid = req.params.id;
                return user.get({
                    relationships: true,
                });
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data, req)));
    })
    .put((req, res, next) => {})
    .delete((req, res, next) => {});


// /api/users/:id/(following|followers|posts)
router.route('/:id([0-9]+)/:relation(following|followers|posts)')
    .get((req, res, next) => {
        const relation = req.params.relation;
        Model.createInstance(User, [relation])
            .catch(next)
            .then((user) => {
                user.uid = req.params.id;
                user[relation].applyOptions(req.query.options);
                return user.getRelatives(true);
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data[relation], req)));
    });

// /api/users/:id/following
router.route('/:id([0-9]+)/:relation(following|followers)/:nid([0-9]+)')
    .get((req, res, next) => {
        const relation = req.params.relation;
        const nid = parseInt(req.params.nid);
        Model.createInstance(User, [relation])
            .catch(next)
            .then((user) => {
                user.uid = req.params.id;
                user[relation].applyOptions(req.query.options);
                user[relation].applyFilter({
                    uid: nid,
                });
                return user.getRelatives(true);
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data[relation].data[0], req)));
    });

// /api/users/:id/following
router.route('/:id([0-9]+)/following/posts')
    .get((req, res, next) => {
        Collection.createInstance(new Post(req.query.options.fields), req.query.options)
            .catch(next)
            .then((collection) => {
                const link = {
                    self: {
                        table: 'post',
                        property: 'uid',
                    },
                    relation: {
                        table: 'following',
                        property: 'followed',
                    },
                };
                collection.applyLink(link);
                collection.applyFilter([{
                    first: 'follower',
                    second: req.params.id,
                    operator: '=',
                    bool: 'and',
                    table: 'following',
                }]);
                return collection.populate({
                    params: req.query.location,
                });
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data, req)));
    });

// /api/users/:id/following
router.route('/:id([0-9]+)/posts/:pid([0-9]+)')
    .get((req, res, next) => {
        const pid = parseInt(req.params.pid);
        Model.createInstance(User, ['posts'])
            .catch(next)
            .then((user) => {
                user.uid = req.params.id;
                user.posts.applyOptions(req.query.options);
                user.posts.applyFilter({
                    pid: pid,
                });
                return user.getRelatives(true);
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data.posts.data[0], req)));
    });


module.exports = router;
