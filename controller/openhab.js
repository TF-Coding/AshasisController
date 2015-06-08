if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {

    var e = {};
    var config = require('config');
    var controller = require('controller');
    var parseString = require('xml2js').parseString;
    var request = require("request");
    var database = require("database");
    var log = require("logger");
    var crypto = require("crypto");

    e._push = function (itmUrl, payload) {
        var targetUrl = config.openhab.url + '/rest/items/' + itmUrl;
        request({
            auth: {
                user: config.openhab.auth.user,
                pass: config.openhab.auth.password,
                sendImmediately: false
            },
            method: 'POST',
            uri: targetUrl,
            body: payload
        }, function (error, response, body) {
            if (error) {
                log.error("REST request error: " + error);
            } else {
                if (response.statusCode == 404) {
                    if (config.debug.logOpenhabPush404) log.info("OpenHAB doesn't know about item: " + itmUrl);
                }
            }
        });
    };
    e.updateItem = function (decoded) {
        database.getOpenhabItemBinding(decoded.sender, decoded.sensor, function (itm) {
            database.updateLastUpdate(decoded.sender, decoded.sensor);
            e._push(itm, decoded.payload);
        });
    };
    /*
     e.send2Sensor = function (sender, sensor, command, ack, type, payload) {
     var td = e.encode(destination, sensor, command, ack, type, payload);
     console.log('[e]-> ' + td.toString());
     //gw.write(td);
     };*/
    e.getItems = function (cb) {
        var targetUrl = config.openhab.url + '/rest/items/';
        request({
            auth: {
                user: e.config.openhab.auth.user,
                pass: e.config.openhab.auth.password,
                sendImmediately: false
            },
            method: 'GET',
            uri: targetUrl,
            timeout: 10000,
            gzip: false
        }, function (error, response, body) {
            if (error) {
                log.error("REST request error: " + error);
            } else {
                parseString(body, function (err, result) {
                    if (err) {
                        log.error("REST request error: " + error);
                    } else {
                        var data = [];
                        result.items.item.forEach(function (item) {
                            data.push({
                                type: item.type,
                                name: item.name
                            });
                        });
                        cb(data);
                    }
                });
            }
        });
    };


    e.checkAuth = function (user, pass) {
        if (!config.webif.auth.enabled) return true;
        return (config.webif.auth.user == user && config.webif.auth.pass == pass);

    };


    return e;
});