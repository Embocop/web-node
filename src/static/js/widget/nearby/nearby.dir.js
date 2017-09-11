const template = require('./nearby.tpl.html');

module.exports.name = 'nearby';
module.exports.factory = function() {
    return {
        template: template,
        controller: 'NearbyCtrl',
    };
};

