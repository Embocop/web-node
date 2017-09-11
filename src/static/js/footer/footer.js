'use-strict';

const angular = require('angular');
const animate = require('angular-animate');

const footerDirective = require('./footer.dir.js');

module.exports = angular.module('tg.footer', [
    animate,
])
    .directive(footerDirective.name, footerDirective.factory)
    .name;
