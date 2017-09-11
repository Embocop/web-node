module.exports.name = 'LoginService';
module.exports.method = ['$http', function($http) {
    let currentUser;
    this.login = function(email, password) {
        return new Promise(function(resolve, reject) {
            $http({
                method: 'POST',
                url: '/api/auth/status',
                data: {
                    email: email,
                    password: password,
                },
            })
                .then((res) => {
                    currentUser = res.data.data.data;
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    this.checkLogin = function() {
        return new Promise((resolve, reject) => {
            $http({
                method: 'GET',
                url: '/api/auth/status',
            })
                .then((res) => {
                    currentUser = res.data.data.data;
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    };

    this.logout = function() {
        $http({
           method: 'DELETE',
           url: '/api/auth/status',
        })
            .then((res) => {
                currentUser = null;
            });
    };
    this.isLoggedIn = function() {
        return currentUser != null;
    };
    this.currentUser = function() {
        return currentUser;
    };
}];

