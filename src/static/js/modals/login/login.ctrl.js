module.exports.name = 'LoginCtrl';
module.exports.dependencies = ['$scope', 'close', 'LoginService',
    function($scope, close, LoginService) {
    $scope.dismiss = function() {
        close();
    };
    $scope.login = function() {
        LoginService.login($scope.email, $scope.password)
            .then(() => close())
            .catch(alert);
    };
}];

