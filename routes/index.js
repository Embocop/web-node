const appInfo = require(__data + "/app.json");

const routes = require("express").Router();
const front = require("./front/index.js");
const api = require("../api/index.js");
const beta = require("./front/platform/beta/index.js");


// Development Routing
routes.use("/api", api);
routes.use("/beta", beta);
// END Development Routing

routes.use("/", front);

module.exports = routes;
