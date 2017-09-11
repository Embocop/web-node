const x = require('./feed.tpl.html');
module.exports.name = 'feed';
module.exports.factory = function() {
    return {
        template: x,
        controller: 'FeedCtrl',
    };
};

