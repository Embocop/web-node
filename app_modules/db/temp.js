const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var history = require('mongoose-diff-history/diffHistory');
var response = require(__app + "response");
var __ = require("underscore");

module.exports.history = history;

module.exports.configure = function (config) {
    const uri = "mongodb://" + config.dbuser + ":" + config.dbpwd + "@" + config.dbhost + ":" + config.dbport + "/" + config.dbname;
    mongoose.connect(uri, (err, db) => { if (err) throw err; console.log("Database Connection Established!") });
}

module.exports.Email = mongoose.model('Email', new Schema({
    email: { type: String, unique: true, required: true }
}));

var ExperimentScheme = new Schema({
    Name: { type: String, required: true },
    Created: { type: Date, required: true },
    Author: { type: String, required: true },
    FileName: { type: String, required: true, unique: true, dropDups: true },
    Thumbnail: String,
    Sharing: String,
    Contributors: Array,
    Devices: Array,
    Cards: { type: [{}], required: false }
}, { timestamps: { createdAt: 'created_at' } });

ExperimentScheme.plugin(history.plugin);

module.exports.Experiment = mongoose.model('Experiment', ExperimentScheme);

var UserSchema = new Schema({
    Username: { type: String, unique: true, required: true, dropDups: true },
    Email: { type: String, unique: true, required: true, dropDups: true },
    Password: { type: String, required: true },
    First: { type: String, required: true },
    Last: { type: String, required: true },
    Type: { type: String, required: true },
    Experiments: { type: Number, default: 0 },
    Avatar: { type: String, default: "" },
    Points: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.plugin(history.plugin);

module.exports.User = mongoose.model('User', UserSchema);

module.exports.Applications = mongoose.model('Applications', new Schema({
    Name: { type: String, unique: true, required: true, dropDups: true },
    Id: { type: Number, unique: true, required: true, dropDups: true },
    Key: { type: String, required: true },
    Permissions: { type: Array, required: true }
}));

module.exports.createModel = function (name, schema) {
    module.exports[name] = mongoose.model(name, new Schema(scheme));
}

module.exports.dbCallback = function (res, options) {
    var defaults = {
        error: (err) => {
            res.status(500).send(error.Database(err));
        },
        none: null,
        success: (data) => {
            res.status(200).send({ success: true, status: 200, data: data });
        }
    };
    options = __.extend(defaults, options);
    return (err, data) => {
        if (err) options.error(err);
        else if (data.length == 0 && options.none != null) {
            options.none();
        }
        else options.success(data);
    }
}

module.exports.getIdFromUsername = function (username, callback) {
    module.exports.User.find({ Username: username }).select('_id').exec(callback);
}

module.exports.getUserExperiments = function (username, limit, sort, callback) {
    module.exports.Experiment.find({ Author: username })
        .limit(limit)
        .sort(sort)
        .exec((err, data) => {
            if (err) throw response.error.Database(err);
            callback(data);
        });
}
