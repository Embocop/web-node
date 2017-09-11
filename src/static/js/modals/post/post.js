'use-strict';

const angular = require('angular');
const animate = require('angular-animate');

const controller = require('./post.ctrl.js');
const postDirective = require('./post.dir.js');
const contentDirective = require('./content.dir.js');

module.exports = angular.module('tg.modals.post', [
    animate,
])
    .controller(controller.name, controller.dependencies)
    .directive(postDirective.name, postDirective.factory)
    .directive(contentDirective.name, contentDirective.factory)
    .name;
