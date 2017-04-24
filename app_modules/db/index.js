const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const config = require("../../config.json");

const uri = "mongodb://" + config.db.dbuser + ":" + config.db.dbpwd + "@" + config.db.dbhost + ":" + config.db.dbport + "/" + config.db.dbname;

module.exports.configure = function() {
  mongoose.connect(uri, (err, db) => { if(err) throw err; });
}

module.exports.Email = mongoose.model('Email', new Schema({
  email : String
}));

module.exports.createModel = function(name, schema) {
  module.exports[name] = mongoose.model(name, new Schema(scheme));
}
/*
Email.find({}, function (err, emails) {
  console.log(emails);
});
*/
