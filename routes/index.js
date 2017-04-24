var routes = require("express").Router();
const front = require("./front/index.js");
const api = require("../api/index.js");

routes.use("/api", api);
routes.use("/", front);

module.exports = routes;
