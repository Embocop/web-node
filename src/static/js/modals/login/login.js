'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
const sanitize = require('angular-sanitize');

const controller = require('./login.ctrl.js');
const loginDirective = require('./login.dir.js');
const loginService = require('./login.svc.js');

module.exports = angular.module('tg.modals.login', [
    animate,
    sanitize,
])
    .controller(controller.name, controller.dependencies)
    .directive(loginDirective.name, loginDirective.factory)
    .service(loginService.name, loginService.method)
    .name;
