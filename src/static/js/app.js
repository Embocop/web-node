'use-strict';

const angular = require('angular');
const animate = require('angular-animate');
require('angular-modal-service');

const feed = require('./feed/feed.js');
const footer = require('./footer/footer.js');
const header = require('./header/header.js');
const modals = require('./modals/modals.js');
const widgets = require('./widget/widgets.js');

angular.module('tg', [
    animate,
    feed,
    footer,
    header,
    modals,
    widgets,
    'angularModalService',
])
    .controller('AppCtrl', ['$scope', 'LoginService', function AppCtrl($scope, LoginService) {
        $scope.loggedIn = false;
        LoginService.checkLogin()
            .then(() => {
                $scope.loggedIn = true;
                $scope.$apply();
            })
            .catch(() => {
                $scope.loggedIn = false;
                $scope.$apply();
            });
        $scope.$watch(LoginService.isLoggedIn, function(isLoggedIn) {
            $scope.loggedIn = isLoggedIn;
        });
    }]);

