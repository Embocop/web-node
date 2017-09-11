const x = require('./header.tpl.html');
// Comment
module.exports.name = 'header';
module.exports.factory = function() {
    return {
        template: x,
        controller: 'HeaderCtrl',
    };
};

