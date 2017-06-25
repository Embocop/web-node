const bcrypt = require("bcrypt"),
    secret = require(__top + "config.json").app.secret,
    jwt = require("jsonwebtoken"),
    error = require(__app + "response").error;

module.exports.appverification = function (req, res, next) {
    if (req.method == "GET") {
        next();
    } else {
        var token = req.body.apptoken || req.query.apptoken || req.headers['x-app-access-token'];
        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    return res.status(401).json({ success: false, message: 'Failed to authenticate application token.' });
                } else {
                    req.appdecoded = decoded
                    delete req.body.apptoken
                    next();
                }
            });
        }
        else {
            res.status(401).send({ success: false, message: "No app authentication found" });
        }
    }
}

module.exports.userverification = function (req, res, next) {
    var token = req.body.usertoken || req.query.usertoken || req.headers['x-user-access-token'] || req.cookies.usertoken;
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                if (req.method == "GET") {
                    next();
                } else {
                    return res.status(401).json({ success: false, message: 'Failed to authenticate user token.' });
                }
            } else {
                req.decoded = decoded;
                delete req.body.usertoken
                next();
            }
        });
    }
    else {
        if (req.method == "GET") {
            next();
        } else {
            res.status(401).send({ success: false, message: "No user authentication found" });
        }
    }
}

module.exports.loginverification = function (req, res, next, error) {
    var token = req.body.usertoken || req.query.usertoken || req.headers['x-user-access-token'] || req.cookies.usertoken;
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                error(req, res, err);
            } else {
                req.decoded = decoded;
                next(req, res);
            }
        });
    }
    else {
        error(req, res, Error("No token found"));
    }
}

module.exports.verifyFields = function (body, fields) {
    output = {};
    for (var key in body) {
        for (var i = 0; i < fields.length; i++) {
            if (key == fields[i]) output[fields[i]] = body[fields[i]];
        }
    }
    return output;
}

module.exports.requireFields = function (body, fields) {
    const temp = module.exports.verifyFields(body, fields);
    if (Object.keys(temp).length != fields.length) return null;
    else return temp;
}

module.exports.verifyParams = function (field, params) {
    var output = [];

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < params.length; j++) {
            if (field[i] == params[j]) {
                output.push(field[i]);
            }
        }
    }

    return output
}

module.exports.testPassword = function (test, hash, res, callback) {
    bcrypt.compare(test, hash, (err, result) => {
        if (err) res.status(500).send(error.Hash(err));
        else if (!result) res.status(401).send(error.Password);
        else {
            callback();
        }
    });
}

module.exports.createPasswordHash = function (pwd, callback) {
    bcrypt.hash(pwd, 10, function (err, hash) {
        if (err) res.status(500).send(error.Hash(err));
        else callback(hash);
    });
}

module.exports.createToken = function (data, options) {
    var token = jwt.sign(data, secret, options);
    return token;
}
