// Instance of express.Router
const express = require('express');
const api = new express.Router();
const user = require('./user');
const post = require('./post');
const auth = require('./auth');
const {
    error: Errors,
    response: Response,
} = require('../tg_modules/tg-responses');

// api/user/ call
api.use('/users', user);

// api/post/ call
api.use('/posts', post);

// api/auth/ call
api.use('/auth', auth);

// General 404 Errors
api.get('*', (req, res, next) => {
    let err = new Errors.NotFound();
    err.status = 404;
    next(err);
});

// Error handling
api.use((err, req, res, next) => {
    const response = Response.parse(err);
    res.status(response.errors[0].status).send(response);
});

module.exports = api;
