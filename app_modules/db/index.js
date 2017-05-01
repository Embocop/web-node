const mongoose    = require("mongoose");
const Schema      = mongoose.Schema;
var response      = require(__app + "response");
var __            = require("underscore");


module.exports.configure = function(config) {
  const uri = "mongodb://" + config.dbuser + ":" + config.dbpwd + "@" + config.dbhost + ":" + config.dbport + "/" + config.dbname;
  mongoose.connect(uri, (err, db) => { if(err) throw err; console.log("Database Connection Established!")});
}

module.exports.Email = mongoose.model('Email', new Schema({
  email : { type: String, unique: true, required: true }
}));

module.exports.Experiment = mongoose.model('Experiment', new Schema({
  Name: { type: String, required: true},
  Created: { type: Date, required: true },
  Author: { type : String, required: true },
  FileName: { type: String, required: true, unique: true, dropDups: true },
  Thumbnail: String,
  Sharing: String,
  Contributors: Array,
  Devices: Array,
  Cards: { type: Array, required: true }
}));

module.exports.User = mongoose.model('User', new Schema({
  Username: { type: String, unique: true, required: true, dropDups: true },
  Email: { type: String, unique: true, required: true, dropDups: true },
  Password: { type : String, required: true },
  First: { type: String, required: true },
  Last: { type: String, required: true },
  Type: { type: String, required: true },
  Experiments: { type: Number, default: 0 }
}));

module.exports.createModel = function(name, schema) {
  module.exports[name] = mongoose.model(name, new Schema(scheme));
}

module.exports.dbCallback = function (res, options) {
  var defaults = {
    error: (err) => {
      res.status(500).send(error.Database(err));
    },
    none : null,
    success : (data) => {
      res.status(200).send({success: true, status: 200, data: data});
    }
  };
  options = __.extend(defaults, options);

  return (err, data) => {
    if (err) options.error(err);
    else if (data.length == 0 && options.none != null) options.none();
    else options.success(data);
  }
}
/*
Email.find({}, function (err, emails) {
  console.log(emails);
});
*/
