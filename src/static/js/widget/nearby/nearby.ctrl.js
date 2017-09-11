module.exports.name = 'NearbyCtrl';
module.exports.dependencies = ['$scope', '$http', 'geolocation', 'FilterService',
    function($scope, $http, geolocation, FilterService) {
        $scope.activeNearby = -1;
        geolocation.getLocation()
            .catch()
            .then((res) => {
                return $http({
                    method: 'GET',
                    url: '/api/posts',
                    params: {
                        fields: 'distance,city,country',
                        sort: 'distance',
                        l: res[0] + ',' + res[1],
                        unique: 'city',
                        require: 'city',
                        limit: 5,
                    },
                });
            })
            .then((res) => {
                $scope.nearby = res.data.data;
            });

        $scope.filter = function(c, index) {
            $scope.activeNearby = index;
            FilterService.applyFilter({city: c});
        };

        $scope.unfilter = function() {
            $scope.activeNearby = -1;
            FilterService.emptyFilter();
        };
    }];

