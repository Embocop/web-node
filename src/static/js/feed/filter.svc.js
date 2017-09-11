module.exports.name = 'FilterService';
module.exports.method = function() {
    let filter;
    this.applyFilter = function(f) {
        filter = f;
    };

    this.emptyFilter = function() {
        filter = {};
    };

    this.getFilter = function() {
        return filter;
    };
};
