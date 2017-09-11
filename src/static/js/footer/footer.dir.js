const x = require('./footer.tpl.html');
module.exports.name = 'footer';
module.exports.factory = function() {
    return {
        template: x,
    };
};

