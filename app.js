process.title = "ashaControl";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var config = require('./config.js');
var constants = require('./controller/constants');
var routes = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
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
app.locals.constants = constants;
app.locals.controller = controller;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(config.webif.root, express.static(path.join(__dirname, 'public')));

app.use(config.webif.root+ '/', routes);
app.use(config.webif.root+ '/users', users);
app.use(config.webif.root+ '/api', api);

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
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


controller.start(function (err) {
    if (err) console.log("Got error: " + err);
    else console.log("No errors");
});


module.exports = app;

