if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    var dateFormat = require('dateformat');
    var format = "dd.mm.yyyy HH:MM:ss";
    var logger = {};
    logger.error = function (msg) {
        if (logger.settings.error) console.log(dateFormat(new Date(), format) + "\t[ERROR]\t" + msg);
    };
    logger.info = function (msg) {
        if (logger.settings.info) console.log(dateFormat(new Date(), format) + "\t[INFO]\t" + msg);
    };
    logger.debug = function (msg) {
        if (logger.settings.debug) console.log(dateFormat(new Date(), format) + "\t[DEBUG]\t" + msg);
    };
    logger.settings = {
        error: false,
        info: false,
        debug: false
    };
    return logger;
});