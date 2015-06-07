process.title = "ashaControl";

var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var fs = require('fs');
var config = require('./config.js');
var app = express();


console.log("Based on MySensors - NodeJsController");
console.log("https://github.com/mysensors/Arduino/tree/0036c5f52ad0632bd21c5d106d0f40b9fa7e0fcf/NodeJsController");

//init database - only if needed by config
var database = {};
if (config.openhab.useExperimentalV2Mapping) {
    database = require('./controller/databasewrapper');
    database.connect(function (err) {
        if (err) {
            console.log("Database connection failed :: " + err);
        } else {
            console.log("Database connected");
        }
    });
}

var controller = require('./controller/controller')(config, database);

app.locals.config = config;
app.locals.controller = controller;
app.locals.base = config.webif.root;
var api = require('./routes/api')(controller);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(config.webif.root, api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


controller.start(function (err) {
    if (err) console.log("Got error: " + err);
    else console.log("No errors");
});


module.exports = app;

