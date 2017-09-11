'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
const sanitize = require('angular-sanitize');

const controller = require('./feed.ctrl.js');
const feedDirective = require('./feed.dir.js');
const geolocationService = require('./location.svc.js');
const filterService = require('./filter.svc.js');


module.exports = angular.module('tg.feed', [
    animate,
    sanitize,
])
    .controller(controller.name, controller.dependencies)
    .directive(feedDirective.name, feedDirective.factory)
    .service(geolocationService.name, geolocationService.method)
    .service(filterService.name, filterService.method)
    .name;
