const angular = require('angular');

module.exports.name = 'HeaderCtrl';
module.exports.dependencies = ['$scope', '$window', 'ModalService', 'LoginService',
    function($scope, $window, ModalService, LoginService) {
    function login() {
        ModalService.showModal({
            template: '<div login></div>',
            controller: 'LoginCtrl',
        }).then(function(modal) {
            modal.close.then(function(result) {
            });
        });
    }

    function logout() {
        LoginService.logout();
    }

    $scope.login = login;
    $scope.logout = logout;
    $scope.collapsed = '';

    $window.scrollTo(0, 0);

    angular.element($window).bind('scroll', function() {
        if (window.pageYOffset > 25) {
            $scope.collapsed = 'collapsed';
            $scope.$apply();
        }
    });
}];

