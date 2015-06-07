if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var request = require('request');
    var config = require("config.js");
    var authCache = [];
    var cacheKeep = 5 * 60 * 1000; //ms

    router.use(bodyParser.text({inflate: true}));

    function checkAuth(user, pass, cb) {
        var authCacheNew = [];
        for (var i = 0; i < authCache.length; i++) {
            if (authCache[i].expires <= Date.now()) {
                authCacheNew.push(authCache[i]);
            }
        }
        authCache = authCacheNew;
        for (var i = 0; i < authCache.length; i++) {
            if (authCache[i].user == user && authCache[i].pass == pass) {
                cb(true);
                return;
            }
        }
        request({
            auth: {
                user: user,
                pass: pass,
                sendImmediately: true
            },
            method: 'GET',
            uri: config.openhab.url + "/openhab.app"
        }, function (error, response, body) {
            if (error) {
                console.log(error);
                cb(false);
                return;
            }
            if ((response.statusCode == 200)) {
                authCache.push({
                    expires: Date.now() + cacheKeep,
                    user: user,
                    pass: pass
                });
                cb(true);
            } else {
                cb(false);
            }
        });
    }

    router.post("/mappings", function (req, res, next) {
        checkAuth(req.body.user, req.body.pass, function (r) {
            if (r) {
                controller.openhab.getItems(function (itms) {
                    controller.database.getAllMappings(function (mappings) {
                        res.json({mappings: mappings, items: itms});
                    });
                });
            } else {
                res.json({result: "Not authorized"});
            }
        });
    });

    router.post("/auth", function (req, res, next) {
        checkAuth(req.body.user, req.body.pass, function (r) {
            res.json({result: r});
        });
    });

    router.get("/config", function (req, res, next) {
        request({
            method: 'GET',
            uri: config.openhab.url + "/openhab.app"
        }, function (error, response, body) {
            var json = {
                error: false
            };
            if (response.statusCode == 401) {
                json.authRequired = true;
            } else if (response.statusCode == 200) {
                json.authRequired = false;
            } else {
                json.error = true;
            }
            res.json(json);
        });
    });

    router.get("/openhab/push/:item/:value", function (req, res, next) {
        console.log("API::PUSH::GET2::" + req.params.item + "::" + req.params.value);
        var itm = req.params.item;
        var val = req.params.value;
        if (itm == undefined || val == undefined) {
            res.sendStatus(400);
            return;
        }
        if (itm.trim().length > 0 || val.trim().length > 0) {
            res.sendStatus(400);
            return;
        }
        req.app.locals.controller.openhab.push(itm, val);
        res.sendStatus(200);
    });
    router.all("*", function (req, res, next) {
        res.sendStatus(404);
    });

    return router;
});
