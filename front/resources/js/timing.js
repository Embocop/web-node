module.exports.easeOutCubic = function (t, b, c, d) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};

module.exports.easeInCubic = function (t, b, c, d) {
    t /= d;
    return c * t * t * t + b;
};

module.exports.easeInQuartic = function (t, start, interval, duration) {
    t = t / duration;
    return interval * t * t * t * t + start;
};

module.exports.timedLoop = function (callback, duration, increment, done) {
    if (duration >= 0) {
        setTimeout(() => {
            callback(duration);
            module.exports.timedLoop(callback, duration - increment, increment, done);
        }, increment);
    }
    else {
        if (done != null) {
            done();
        }
    }
}