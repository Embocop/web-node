const express = require('express');
const router = new express.Router();
const geocoder = require('node-geocoder')({provider: 'google'});

const auth = require('../../tg_modules/tg-auth');
const requests = require('../../tg_modules/tg-requests');
const Response = require('../../tg_modules/tg-responses').response;
const {
    Post,
    Collection,
    Model,
    Com,
} = require('../../tg_modules/tg-models');

// router.use(auth.authenticateApplication);
router.use(auth.authenticateUser);
router.use(requests.parseRequest);

// /api/post/
router.route('')
    .get(function(req, res, next) {
        Model.createInstance(Post, req.query.options.fields)
            .catch(next)
            .then((post) => {
                return Collection.createInstance(post, req.query.options);
            })
            .catch(next)
            .then((collection) => {
                return collection.populate({
                    params: req.query.location,
                });
            })
            .catch(next)
            .then((result) => res.send(Response.parse(result, req)));
    })
    .post(function(req, res, next) {
        req.body.uid = req.userdecoded.uid;
        geocoder.reverse({lat: req.body.location[0], lon: req.body.location[1]})
            .catch(next)
            .then((data) => {
                req.body.city = data[0].extra.neighborhood || data[0].city;
                req.body.country = data[0].countryCode;
                req.body.latitude = data[0].latitude;
                req.body.longitude = data[0].longitude;
                return Model.createInstance(Post, req.body);
            })
            .catch(next)
            .then((post) => {
                return post.post();
            })
            .catch(next)
            .then((result) => res.send(Response.parse(result, req)));
    });

// /api/post/:id
router.route('/:id([0-9]+)')
    .get(function(req, res, next) {
        Model.createInstance(Post, req.query.options.fields)
            .catch(next)
            .then((post) => {
                post.pid = req.params.id;
                return post.get({
                    params: req.query.location,
                });
            })
            .catch(next)
            .then((result) => res.send(Response.parse(result, req)));
    })
    .put()
    .delete();

// /api/post/:id/comment
router.route('/:id([0-9]+)/comments')
    .get(function(req, res, next) {
        Model.createInstance(Post, ['comments'])
            .catch(next)
            .then((post) => {
                post.pid = req.params.id;
                post.comments.applyOptions(req.query.options);
                post.comments.applyFilter([{
                    first: 'parent',
                    second: '0',
                    table: 'com',
                    operator: '=',
                    bool: 'and',
                }]);
                return post.getRelatives(true);
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data.comments, req)));
    })
    .post();

// /api/post/:pid/comment/:cid
router.route('/:pid([0-9]+)/comments/:cid([0-9]+)')
    .get(function(req, res, next) {
        Model.createInstance(Com, req.query.options.fields)
            .catch(next)
            .then((com) => {
                com.pid = req.params.pid;
                com.cid = req.params.cid;
                return com.get({
                    relationships: true,
                });
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data, req)));
    })
    .put()
    .delete();

// /api/post/:pid/comment/:cid/response
router.route('/:pid([0-9]+)/comments/:cid([0-9]+)/responses')
    .get(function(req, res, next) {
        Model.createInstance(Com, ['children'])
            .catch(next)
            .then((com) => {
                com.pid = req.params.pid;
                com.cid = req.params.cid;
                com.children.applyOptions(req.query.options);
                return com.getRelatives(true);
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data.children, req)));
    })
    .post();


// /api/post/:pid/comment/:cid/response
router.route('/:pid([0-9]+)/comments/:cid([0-9]+)/responses/:rid([0-9]+)')
    .get(function(req, res, next) {
        Model.createInstance(Com, req.query.options)
            .catch(next)
            .then((com) => {
                com.pid = req.params.pid;
                com.parent = req.params.cid;
                com.cid = req.params.rid;
                return com.get({
                    relationships: true,
                });
            })
            .catch(next)
            .then((data) => res.send(Response.parse(data, req)));
    })
    .put()
    .delete();

module.exports = router;
