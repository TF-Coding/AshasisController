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
        if (!openhab.checkAuth(req.params.username, req.params.password)) {
            res.sendStatus(403);
        } else {
            controller.openhab.getItems(function (itms) {
                controller.database.getAllMappings(function (mappings) {
                    res.json({mappings: mappings, items: itms});
                });
            });
        }
    });
    app.post("/auth", function (req, res, next) {
        if (!openhab.checkAuth(req.params.username, req.params.password)) res.json({result: false});
        else res.json({result: true});
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
        if (!openhab.checkAuth(data.username, data.password)) {
            res.sendStatus(403);
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

        if (!openhab.checkAuth(data.username, data.password)) {
            res.sendStatus(403);
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
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
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
