module.exports.name = 'NewPostCtrl';
module.exports.dependencies = ['$scope', '$http', 'geolocation', 'close',
    function($scope, $http, geolocation, close) {
    function dismiss() {
        close();
    }

    function submitPost() {
        geolocation.getLocation()
            .then((loc) => {
                return $http({
                    method: 'POST',
                    url: '/api/posts',
                    data: {
                        content: $scope.content,
                        location: loc,
                    },
                });
            });
    }

    $scope.submit = submitPost;
    $scope.dismiss = dismiss;
}];

