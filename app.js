if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var log = require("logger.js");
    var express = require("express");
    var config = require("config");
    var bodyParser = require("body-parser");
    var app = express();

    log.info("Based on MySensors - NodeJsController");
    log.info("https://github.com/mysensors/Arduino/tree/0036c5f52ad0632bd21c5d106d0f40b9fa7e0fcf/NodeJsController");


    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: err
            });
        });
    } else {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: {}
            });
        });
    }

    return app;
});
