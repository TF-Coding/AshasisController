if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var express = require('express');
    var app = express();

    var bodyParser = require('body-parser');
    var request = require('request');
    var config = require("config");
    var logger = require("logger");
    var controller = require("controller");
    var openhab = require("openhab");
    var database = require("database");

    var checkAuth = function (req, user, pass) {
        //if localhost it's always valid
        if (req.connection.remoteAddress.indexOf("127.0.0.1") > -1) return true;
        if (!config.webif.auth.enabled) return true;
        return (config.webif.auth.user == user && config.webif.auth.pass == pass);
    };


    app.use(bodyParser.text());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    app.get("/config", function (req, res, next) {
        res.json({
            error: false,
            authRequired: config.webif.auth.enabled
        });
    });

    app.post("/mappings", function (req, res, next) {
        if (!checkAuth(req, req.params.username, req.params.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });
        } else {
            controller.openhab.getItems(function (itms) {
                controller.database.getAllMappings(function (mappings) {
                    res.status(200);
                    res.json({mappings: mappings, items: itms});
                });
            });
        }
    });
    app.post("/auth", function (req, res, next) {
        if (!checkAuth(req, req.params.username, req.params.password)) {
            res.status(200);
            res.json({result: false});
        }
        else {
            res.status(200);
            res.json({result: true})
        }
    });


    //post api
    app.post("/openhab/push", function (req, res, next) {
        var data = {};
        if (typeof req.body == "object") {
            data = req.body;
        } else if (typeof req.body == "string") {
            data = JSON.parse(req.body);
        } else {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }
        if (!checkAuth(req, data.username, data.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });
        } else {
            if (data.item == undefined || data.value == undefined) {
                res.status(400);
                res.json({
                    message: "Invalid parameter",
                    error: true
                });
            } else {
                _updateItem(data.item, data.value, res);
            }
        }
    });


    //push api
    app.post("/controller/push/raw", function (req, res, next) {
        var data = {};
        if (typeof req.body == "object") {
            data = req.body;
        } else if (typeof req.body == "string") {
            data = JSON.parse(req.body);
        } else {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }
        if (data.raw == undefined) {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }

        if (!checkAuth(req, data.username, data.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });

        } else {
            controller.relayRaw(data.raw);
            res.status(200);
            res.json({error: false, message: "OK"});
        }
    });
    app.post("/controller/push/node", function (req, res, next) {
        var data = {};
        if (typeof req.body == "object") {
            data = req.body;
        } else if (typeof req.body == "string") {
            data = JSON.parse(req.body);
        } else {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }
        if (
            data.child == undefined || isNaN(data.child) ||
            data.node == undefined || isNaN(data.node) ||
            data.value == undefined
        ) {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }
        if (!checkAuth(req, req.body.username, req.body.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });

        } else {
            //try resolving type according to database
            database.getTypeForChild(data.node, data.child, function (err, type) {
                if (err) {
                    controller.relay(data.node, data.child, 1, 0, 24, data.value); //TODO: if 24 is ok for this usage
                    res.status(200);
                    res.json({
                        error: false,
                        message: "OK - custom type"
                    });
                } else {
                    controller.relay(data.node, data.child, 1, 0, type, data.value);
                    res.status(200);
                    res.json({
                        error: false,
                        message: "OK"
                    });

                }

            });
        }
    });
    app.post("/controller/inclusionMode", function (req, res, next) {
        var data = {};
        if (typeof req.body == "object") {
            data = req.body;
        } else if (typeof req.body == "string") {
            data = JSON.parse(req.body);
        } else {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }

        if (!checkAuth(req, data.username, data.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });

        } else {
            data.timeout = (data.timeout == undefined ? config.controller.defaultInclusionTimeout : data.timeout);
            controller.enableInclusionMode(data.timeout);
            res.json({
                message: "Inclusion mode activated for " + data.timeout + " seconds",
                error: false
            });
        }
    });

    app.post("/controller/push", function (req, res, next) {
        var data = {};
        if (typeof req.body == "object") {
            data = req.body;
        } else if (typeof req.body == "string") {
            data = JSON.parse(req.body);
        } else {
            res.status(400);
            res.json({
                message: "Invalid parameter",
                error: true
            });
            return;
        }

        if (!checkAuth(req, data.username, data.password)) {
            res.status(403);
            res.json({
                error: true,
                message: "Authentification failed"
            });

        } else {
            if (data.item == undefined || data.value == undefined) {
                res.status(400);
                res.json({
                    message: "Invalid parameter",
                    error: true
                });
            } else {
                database.getItemInfos(data.item, function (err, itmInfo) {
                    if (!err) {
                        controller.relay(itmInfo.sender, itmInfo.sensor, 1, 0, itmInfo.type, data.value);
                        res.status(200);
                        res.json({
                            error: false,
                            message: "OK"
                        });

                    } else {
                        res.status(400);
                        res.json({
                            error: true,
                            message: "Error: " + e
                        });

                    }
                });
            }
        }
    });


    var _updateItem = function (itm, val, res) {
        if (itm == undefined || val == undefined || itm.trim().length == 0 || val.trim().length == 0) {
            res.sendStatus(400);
        } else {
            openhab._push(itm, val);
            res.sendStatus(200);
        }
    };

    return app;

});
