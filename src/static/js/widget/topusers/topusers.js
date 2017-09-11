'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
const sanitize = require('angular-sanitize');

const controller = require('./topusers.ctrl.js');
const feedDirective = require('./topusers.dir.js');

module.exports = angular.module('tg.widget.topusers', [
    animate,
    sanitize,
])
    .controller(controller.name, controller.dependencies)
    .directive(feedDirective.name, feedDirective.factory)
    .name;
