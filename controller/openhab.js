var e = {};
e.config = require('../config');
e.controller = null;

//region Privates
e._push = function (itmUrl, payload) {
    var targetUrl = e.config.openhab.url + '/rest/items/' + itmUrl;
    e.request({
        method: 'POST',
        uri: targetUrl,
        gzip: false,
        body: payload
    }, function (error, response, body) {
        if (error) {
            console.log("REST request error: " + error);
        } else {
            if (response.statusCode == 404) {
                if (e.config.debug.logOpenhabPush404) console.log("OpenHAB doesn't know about item: " + itmUrl);
            }
        }
    }).auth(e.config.openhab.auth.user, e.config.openhab.auth.password, false);
};
//region REST-Submit variants
e._updateItemV1 = function (sender, sensor, command, ack, type, payload) {
    var body = (e.config.openhab.pushValuesOnly ? payload : e.controller.encode(sender, sensor, command, ack, type, payload));
    var tItm = "n" + sender + "s" + sensor;
    return e._push(tItm, body);
};
e._updateItemV1collector = function (sender, sensor, command, ack, type, payload) {
    var body = e.controller.encode(sender, sensor, command, ack, type, payload);
    var tItm = e.config.openhab.collectorItemName;
    return e._push(tItm, body);
};
e._updateItemV2 = function (sender, sensor, command, ack, type, payload) {
    e.database.getOpenhabItemBinding(sender,sensor,function(itm){
	e._push(itm, payload);
    });
};
//endregion
//endregion


e.updateItem = function (decoded) {
    if (e.config.openhab.useExperimentalV2Mapping) e._updateItemV2(decoded.sender, decoded.sensor, decoded.command, decoded.ack, decoded.type, decoded.payload);
    else if (e.config.openhab.useCollectorItem) e._updateItemV1collector(decoded.sender, decoded.sensor, decoded.command, decoded.ack, decoded.type, decoded.payload)
    else e._updateItemV1(decoded.sender, decoded.sensor, decoded.command, decoded.ack, decoded.type, decoded.payload);
};

e.send2Sensor = function (sender, sensor, command, ack, type, payload) {
    var td = e.encode(destination, sensor, command, ack, type, payload);
    console.log('[e]-> ' + td.toString());
    //gw.write(td);
};

e.request = null;
e.database = null;
module.exports = function (controller) {
    e.controller = controller;
    e.database = controller.database;
    e.request = require('request');
    return e;
};