// TODO: Find a place for this function
// Converts a date object to a string of the format MMM DD, YYYY hh:mm am/pm

function dateToStr(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

const express = require('express');
const routes = new express.Router();
const db = require('./tg_modules/tg-database');
const auth = require('./tg_modules/tg-auth');
const api = require('./routes');

// #############################################################################:)
// API routes
routes.use('/api', api);

// ############################################################################:)
// Client hypertext routes
routes.get('/', function(req, res) {
    res.render('index');
    res.end();
});

routes.get('/about', function(req, res) {
    res.render('about');
    res.end();
});

routes.get('/profile/:username', (req, res) => {
    let connection = db.pool;
    let username = req.params.username.replace('-', ' ');
    let logined = 'usertoken' in req.cookies;
    const fields = ['uid', 'name', 'bio', 'follower', 'registered', 'post', 'vote'];
    let check = false;
    let out;
    let load = function() {
        let status;
        if(out.vote < 25) {
            status = 'No Trend';
        }
        else if(out.vote < 100) {
            status = 'Trivial Trend';
        }
        else if(out.vote < 250) {
            status = 'Serious Trend';
        }
        else if(out.vote < 500) {
            status = 'Global Trend';
        }
        else {
            status = 'Universal Trend';
        }
        let profileParameters = {
            my: check,
            login: logined,
            name: out.name,
            uid: out.uid,
            username: username,
            follow_status: 'followed',
            followers: out.follower,
            rating: status,
            coolness: out.vote,
            posts: out.post,
            registered: dateToStr(new Date(out.registered)),
            bio: out.bio,
        };
        res.render('profile', profileParameters);
        res.end();
    };
    let self = function(dummy) {
        check = true;
        load();
    };
    let not = function(dummy) {
        check = false;
        load();
    };
    let callback = function(err, results, fields) {
        if(err) {
            res.render('404');
            res.end();
        }
        else if(results.length > 0) {
            let credentials = {
                usertoken: req.cookies.usertoken,
                apptoken: req.cookies.apptoken,
                uid: results[0].uid,
            };
            out = results[0];
            auth.checkUserToken(res, connection, credentials, self, not);
        }
        else {
            res.render('404');
            res.end();
        }
    };

    db.getRow(connection, 'user', fields, {
        username: username,
    }, callback);
});

routes.get('/advertise', (req, res) => {
    res.render('advertise');
    res.end();
});

// ############################################################################
// General 404 Errors for Client Requests
routes.get('*', (req, res, next) => {
    let err = new Error();
    err.status = 404;
    next(err);
});

// Error handling
routes.use((err, req, res, next) => {
    res.render('404');
});

module.exports = routes;
