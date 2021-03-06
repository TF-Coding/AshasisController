#!/usr/bin/env node
process.title = "ashaControl";
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

var requirejs = require("requirejs");
require("./controller/shim.js")(requirejs);

requirejs(['logger', 'http', 'config', 'routes', 'controller', 'express', 'body-parser', 'hooks'], function (log, http, config, routes, controller, express, bodyParser, hooks) {
    var app = express();
    var server = http.createServer(app);

    log.settings.info = true; //DEBUG
    log.settings.error = true; //DEBUG
    log.settings.debug = true; //DEBUG

    log.info("Based on MySensors - NodeJsController");
    log.info("https://github.com/mysensors/Arduino/tree/0036c5f52ad0632bd21c5d106d0f40b9fa7e0fcf/NodeJsController");
    log.info("Using base url: " + config.webif.root);

    app.set('port', normalizePort(config.webif.port));
    //app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    //attach hooks
    var sys = require('sys');
    var exec = require('child_process').exec;
    if (config.controller.hooks.inclusionModeIndicator) {
        hooks.register("controller.inclusionmode.enabled", function () {
            exec("echo \"timer\" > /leds/blue/trigger");
        });
        hooks.register("controller.inclusionmode.disabled", function () {
            exec("echo \"none\" > /leds/blue/trigger");
        });
    }
    //exec("ls -la");


    app.use(config.webif.root, routes);

    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        log.error("Invalid api request: [" + req.method + "] " + req.url);
        next(err);
    });
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: (app.get('env') === 'development' ? err : {} )
        });
    });


    server.on('error', function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

        switch (error.code) {
            case 'EACCES':
                log.info(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                log.info(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    server.on('listening', function () {
        var addr = server.address();
        log.info('Webserver started on: ' + (typeof addr === 'string' ? 'pipe ' + addr : addr.address + ":" + addr.port));
        controller.start(function (error) {
            if (!error) {
                log.info("Everything started without errors.");
            } else {
                log.error("We got errors. Aborting start.");
                process.exit(1);
            }
        });
    });

    server.listen(normalizePort(config.webif.port));
});
