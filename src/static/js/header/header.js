'use-strict';

const angular = require('angular');
const animate = require('angular-animate');

const controller = require('./header.ctrl.js');
const headerDirective = require('./header.dir.js');


module.exports = angular.module('tg.header', [
    animate,
])
    .controller(controller.name, controller.dependencies)
    .directive(headerDirective.name, headerDirective.factory)
    .name;
