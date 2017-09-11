const angular = require('angular');

module.exports.name = 'FeedCtrl';
module.exports.dependencies = ['$scope', '$http', '$window', 'geolocation',
    'ModalService', 'LoginService', 'FilterService', controller];

function controller($scope, $http, $window, geolocation,
                    ModalService, LoginService, FilterService) {
    const filters = [
        {
            url: '/api/posts',
            filter: 'distance',
            quantity: '<20',
        },
        {
            url: '/api/posts',
            filter: 'trend',
            quantity: '<2000',
        },
        {
            url: '/api/users/:id:/following/posts',
        },
    ];
    const sort = [
        {
            name: 'Most Recent',
            sort: '-post_time',
        },
        {
            name: 'Distance',
            sort: 'distance',
        },
        {
            name: 'Trending Quickly',
            sort: 'trend',
        },
    ];
    $scope.posts = [];
    $scope.filter = 0;
    $scope.sort = 0;
    $scope.sortName = sort[$scope.sort].name;
    $scope.wait = true;
    $scope.offset = 0;
    $scope.moreFilter = {};
    function load(append) {
        append = append || false;
        geolocation.getLocation().then(function(pos) {
            const params = {
                fields: 'pid,uid,content,author,vote,post_time,city,country,distance,trend',
                limit: 10,
                offset: $scope.offset,
                sort: sort[$scope.sort].sort,
                l: pos[0] + ',' + pos[1],
            };
            const f = 'filter[' + filters[$scope.filter].filter + ']';
            for (let i in $scope.moreFilter) {
                if ($scope.moreFilter.hasOwnProperty(i)) {
                    const t = 'filter[' + i + ']';
                    params[t] = $scope.moreFilter[i];
                }
            }
            params[f] = filters[$scope.filter].quantity;
            $http({
                url: filters[$scope.filter].url,
                method: 'GET',
                params: params,
            })
                .then(function(res) {
                    if (append) $scope.posts = $scope.posts.concat(res.data.data);
                        else $scope.posts = res.data.data;
                    $scope.wait = false;
                    $scope.offset += res.data.meta.length;
                })
                .catch(function(err) {
                    if (err.data.errors[0].code === 401) {
                        $scope.wait = true;
                    }
                });
        });
    }

    function newPost() {
        ModalService.showModal({
            template: '<div postnew></div>',
            controller: 'NewPostCtrl',
        }).then(function(modal) {
            modal.close.then(function(result) {
            });
        });
    }

    $scope.newPost = newPost;
    $scope.l = false;
    $scope.filterChange = function() {
        if ($scope.l) $scope.filter = 2;
    };

    $scope.$watch('filter', function() {
        $window.scrollTo(0, 0);
        $scope.offset = 0;
        $scope.wait = false;
        $scope.moreFilter = {};
        load();
    });

    $scope.$watch('sort', function() {
        $window.scrollTo(0, 0);
        $scope.offset = 0;
        $scope.sortName = sort[$scope.sort].name;
        $scope.dropdown = false;
        $scope.wait = false;
        load();
    });

    $scope.$watch(LoginService.isLoggedIn, function(isLoggedIn) {
        if (isLoggedIn) {
            $scope.l = true;
            filters[2].url = filters[2].url.replace(':id:', LoginService.currentUser().uid);
        }
        else $scope.l = false;
    });

    $scope.$watch(FilterService.getFilter, function(filter) {
        $scope.moreFilter = filter;
        $scope.offset = 0;
        $scope.wait = false;
        load();
    });

    angular.element($window).bind('scroll', function() {
        const c = 'innerHeight';
        const w = c in window ? window.innerHeight : document.documentElement.offsetHeight;
        const body = document.body;
        const html = document.documentElement;
        const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight,
            html.scrollHeight, html.offsetHeight);
        const windowBottom = w + window.pageYOffset;
        if (windowBottom >= docHeight - 100 && !$scope.wait) {
            $scope.wait = true;
            load(true);
        }
    });

    load();
}
