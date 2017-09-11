'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
const sanitize = require('angular-sanitize');

const controller = require('./nearby.ctrl.js');
const nearbyDirective = require('./nearby.dir.js');

module.exports = angular.module('tg.widget.nearby', [
    animate,
    sanitize,
])
    .controller(controller.name, controller.dependencies)
    .directive(nearbyDirective.name, nearbyDirective.factory)
    .name;
