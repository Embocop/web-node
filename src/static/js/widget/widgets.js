'use-strict';

const angular = require('angular');

const topusers = require('./topusers/topusers.js');
const nearby = require('./nearby/nearby.js');

module.exports = angular.module('tg.widget', [
    topusers,
    nearby,
])
    .name;
