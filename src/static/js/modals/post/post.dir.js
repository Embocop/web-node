const template = require('./post.tpl.html');

module.exports.name = 'postnew';
module.exports.factory = function() {
    return {
        template: template,
    };
};

