const experiment = require("./experiment.js")
const user = require("./user.js")


exports.User = user.User
exports.Experiment = experiment.Experiment

exports.schema = {}

exports.schema.experiment = experiment.schema
exports.schema.user = user.schema