const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    error: Errors,
    response: Response,
    success: Success,
} = require('../tg-responses');
const secret = require('../tg-config').serverSecret;
const appsecret = require('../tg-config').serverAppSecret;

const expiration = '7d';

// Create json user token
exports.createToken = function(details) {
    /*
    : details: object
    */
    const promise = function(resolve, reject) {
        jwt.sign(details, secret, {
            expiresIn: expiration,
        }, (err, token) => {
            if(err) reject(new Errors.TokenError(err));
            else resolve(token);
        });
    };
    return new Promise(promise);
};

exports.verifyUserToken = function(token) {
    return new Promise(function(resolve, reject) {
        if(token) {
            jwt.verify(token, secret, function(err, decoded) {
                if(err) {
                    reject(new Errors.UserDenied());
                }
                else {
                    resolve(new Success.EntryExists(decoded));
                }
            });
        }
        else {
            reject(new Errors.UserNotAuthenticated());
        }
    });
};

// Compare a hashed and unhashed password
exports.verifyPassword = function(password, userPassword) {
    /*
    : password: string (unhashed)
    : userPassword: string (hashed)
    */
    const promise = function(resolve, reject) {
        bcryptjs.compare(password, userPassword, function(err, isPasswordMatch) {
            if(!isPasswordMatch) reject(new Errors.InvalidAuthentication());
            else resolve(true);
        });
    };

    return new Promise(promise);
};

// Creates a password hash from the string
exports.hashPassword = function(pwd) {
    /*
    : pwd: string (unhashed)
    */
    function promise(resolve, reject) {
        bcryptjs.hash(pwd, 10, function(err, hash) {
            if(err) reject(new Errors.HashingError(err));
            else resolve(hash);
        });
    }

    return new Promise(promise);
};

// Middleware to authenticate user tokens
exports.authenticateUser = function(req, res, next) {
    if(req.method === 'GET') {
        next();
    }
    else {
        const token = req.cookies.usertoken;
        if(token) {
            jwt.verify(token, secret, function(err, decoded) {
                if(err) {
                    return res.status(400).send(Response.parse(new Errors.UserDenied(), req));
                }
                else {
                    req.userdecoded = decoded;
                    if(req.body.usertoken) {
                        delete req.body.usertoken;
                    }
                    else if(req.query.usertoken) {
                        delete req.query.usertoken;
                    }
                    next();
                }
            });
        }
        else {
            res.status(400).send(Response.parse(new Errors.UserNotAuthenticated(), req));
        }
    }
};

exports.authenticateApplication = function(req, res, next) {
    if(req.method === 'GET') {
        next();
    }
    else {
        const token = req.body.apptoken || req.query.apptoken || req.headers['x-app-access-token'];
        if(token) {
            jwt.verify(token, appsecret, function(err, decoded) {
                if(err) {
                    return res.status(400).send(Response.parse(new Errors.AppDenied(), req));
                }
                else {
                    req.appdecoded = decoded;
                    if(req.body.apptoken) {
                        delete req.body.apptoken;
                    }
                    else if(req.query.apptoken) {
                        delete req.query.apptoken;
                    }
                    next();
                }
            });
        }
        else {
            res.status(400).send(Response.parse(new Errors.AppNotAuthenticated(), req));
        }
    }
};
