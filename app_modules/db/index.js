const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require("../../config.json");

const uri = "mongodb://" + config.db.dbuser + ":" + config.db.dbpwd + "@" + config.db.dbhost + ":" + config.db.dbport + "/" + config.db.dbname;

module.exports.configure = function() {
  mongoose.connect(uri, (err, db) => { if(err) throw err; console.log("Database Connection Established!")});
}

module.exports.Email = mongoose.model('Email', new Schema({
  email : String
}));

module.exports.Experiment = mongoose.model('Experiment', new Schema({
  Name: String,
  Created: String,
  Author: String,
  FileName: { type: String, unique: true, dropDups: true },
  Thumbnail: String,
  Sharing: String,
  Contributors: Array,
  Devices: Array,
  Cards: Array
}));

module.exports.User = mongoose.model('User', new Schema({
  Username: { type: String, unique: true, required: true, dropDups: true },
  Email: { type: String, unique: true, required: true, dropDups: true },
  First: { type: String },
  Last: { type: String },
  Type: { type: String },
  Experiments: { type: Number }
}));

module.exports.createModel = function(name, schema) {
  module.exports[name] = mongoose.model(name, new Schema(scheme));
}
/*
Email.find({}, function (err, emails) {
  console.log(emails);
});
*/
