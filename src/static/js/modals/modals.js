'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
const sanitize = require('angular-sanitize');

const login = require('./login/login.js');
const post = require('./post/post.js');

module.exports = angular.module('tg.modals', [
    animate,
    sanitize,
    login,
    post,
])
    .name;
