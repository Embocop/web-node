module.exports.name = 'TopUsersCtrl';
module.exports.dependencies = ['$scope', '$http', function($scope, $http) {
    $http({
        url: '/api/users',
        method: 'GET',
        params: {
            sort: '-coolness',
            fields: 'uid,email,username,name,coolness',
            limit: 3,
        },
    }).then((res) => {
        $scope.tops = res.data.data;
    }).catch((err) => {
    });
}];

