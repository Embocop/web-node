const template = require('./topusers.tpl.html');

module.exports.name = 'topusers';
module.exports.factory = function() {
    return {
        template: template,
        controller: 'TopUsersCtrl',
    };
};

