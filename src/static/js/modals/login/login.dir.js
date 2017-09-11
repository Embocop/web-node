const template = require('./login.tpl.html');

module.exports.name = 'login';
module.exports.factory = function() {
    return {
        template: template,
    };
};

