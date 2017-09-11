module.exports.name = 'geolocation';
module.exports.method = function() {
    this.getLocation = function() {
        function promise(resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    resolve([position.coords.latitude, position.coords.longitude]);
                }, showError);
            }
            else {
                reject('Geolocation is not supported by this browser.');
            }
        }
        return new Promise(promise);
    };

    function showError(error) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                return 'User denied the request for Geolocation.';
            case error.POSITION_UNAVAILABLE:
                return 'Location information is unavailable.';
            case error.TIMEOUT:
                return 'The request to get user location timed out.';
            case error.UNKNOWN_ERROR:
                return 'An unknown error occurred.';
        }
    }
};
