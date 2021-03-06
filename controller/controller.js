if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    var e = {};
    var config = require("config");
    var database = require("database");
    var log = require("logger");
    var openhab = require("openhab");
    var hooks = require("hooks");

//    var firmware = require('controller/firmware.js');

    e._inclusionModeTimeout = null;
    e._inclusionModeTimer = null;
    e.getInclusionMode = function () {
        return (e._inclusionModeTimeout != null && (new Date()).getTime() <= e._inclusionModeTimeout );
    };
    e.enableInclusionMode = function (timeoutInSeconds) {
        if (timeoutInSeconds == undefined) timeoutInSeconds = config.controller.defaultInclusionTimeout;
        e._inclusionModeTimeout = (new Date()).getTime() + timeoutInSeconds * 1000;
        e._inclusionModeTimer = setTimeout(e.disableInclusionMode, timeoutInSeconds * 1000);
        hooks.call("controller.inclusionmode.enabled");
        log.info("Inclusion mode activated");
    };
    e.disableInclusionMode = function () {
        e._inclusionModeTimeout = null;
        clearTimeout(e._inclusionModeTimer);
        hooks.call("controller.inclusionmode.disabled");
        log.info("Inclusion mode deactivated");
    };
    e._inclusionMode = function (callback) {
        if (!e.getInclusionMode()) {
            log.info("Inclusion mode is not active");
            callback(false);
            return;
        }
        e.disableInclusionMode();
        callback(true);
    };
    e._encode = function (sender, sensor, command, acknowledge, type, payload) {
        var msg = sender.toString(10) + ";" + sensor.toString(10) + ";" + command.toString(10) + ";" + acknowledge.toString(10) + ";" + type.toString(10) + ";";
        if (command == 4) {
            for (var i = 0; i < payload.length; i++) {
                if (payload[i] < 16)
                    msg += "0";
                msg += payload[i].toString(16);
            }
        } else {
            msg += payload;
        }
        msg += '\n';
        return msg.toString();
    };
    e._decode = function (msg) {
        try {
            var datas = msg.toString().split(";");
            var sender = +datas[0];
            var sensor = +datas[1];
            var command = +datas[2];
            var ack = +datas[3];
            var type = +datas[4];
            var rawpayload = "";
            if (datas[5]) {
                rawpayload = datas[5].trim();
            }
            var payload;
            if (command == 4) {
                payload = [];
                for (var i = 0; i < rawpayload.length; i += 2)
                    payload.push(parseInt(rawpayload.substring(i, i + 2), 16));
            } else {
                payload = rawpayload;
            }
            return {
                sender: sender,
                sensor: sensor,
                command: command,
                ack: ack,
                type: type,
                payload: payload,
                raw: msg
            };
        } catch (e) {
            return null;
        }
    };

    e.relayRaw = function (raw) {
        log.debug("-> " + raw.trim());
        gateway.send(raw);
    };
    e.relay = function (sender, sensor, command, ack, type, payload) {
        e.relayRaw(e._encode(sender, sensor, command, ack, type, payload));
    };

    var gateway;

    e.start = function (callback) {
        if (callback == undefined) {
            log.error("controller.start has got no callback function");
            callback(true);
            return;
        }
        var gwType = config.gateway.useType;
        if (gwType == undefined) {
            log.error("Gateway type undefined :: must be either serial or ethernet");
            callback(true);
            return;
        }

        if (gwType == 'serial') {
            gateway = require("serialwrapper");
        } else if (gwType == 'ethernet') {
            gateway = require("ethernetwrapper");
        } else if (gwType == 'fake') {
            gateway = require("fakewrapper");
            log.error("ATTENTION! You are using the fake provider.");
        }

        gateway.onData(function (raw) {
            var decoded = e._decode(raw);
            if (decoded != null) {
                e._dataReceived(decoded);
            } else {
                log.error("Decoding failed: " + raw);
            }
        });

        database.connect(function (error) {
            if (error) {
                log.error("Database connection error :: " + error);
                callback(true);
            } else {
                log.info("Database connected");
                gateway.connect(function (error2) {
                    if (error2) {
                        log.error("Gateway connection error :: " + error);
                        callback(true);
                    } else {
                        log.info("Gateway connected");
                        callback();
                    }
                });
            }
        });

    };

    e._dataReceived = function (decoded) {
        log.debug("<- " + decoded.sender + ";" + decoded.sensor + ";" + decoded.command + ";" + decoded.ack + ";" + decoded.type + ";" + decoded.payload);
        try {
            switch (decoded.command) {
                case 0: //C_PRESENTATION
                    e._handlePresentationFrame(decoded);
                    break;
                case 1://C_SET - value FROM sensor
                    e._handleSetFrame(decoded);
                    break;
                case 2: //C_REQ - value TO sensor
                    e._handleRequestFrame(decoded);
                    break;
                case 3: //C_INTERNAL
                    e._handleInternalFrame(decoded);
                    //console.log("INTERNAL" + " :: ",decoded);
                    break;
                case 4:  //C_STREAM
                    e._handleStreamFrame(decoded);
                    break;
                default:
                    log.info("Got unhandled message type (command): " + decoded.command);
                    break;
            }
        } catch (e) {
            log.error("Exception while dataReceived: " + e);
        }
    };
    e._handlePresentationFrame = function (decoded) {
        if (decoded.sensor == 255) {
            database.updateNodeInfoPresentation(decoded.sender, decoded.type, decoded.payload);
        } else {
            database.updateChildInfo(decoded.sender, decoded.sensor, decoded.type);
        }
    };
    e._handleSetFrame = function (decoded) {
        openhab.updateItem(decoded);
    };
    e._handleRequestFrame = function (decoded) {
        log.debug("Got request frame - not supported yet", decoded);
        //not supported - needed?
    };
    e._handleInternalFrame = function (decoded) {
        switch (decoded.type) {
            case 0: //batt
                database.updateNodeInfoInternal(decoded.sender, "batteryLevel", decoded.payload);
                break;
            case 2: //version
                database.updateNodeInfoInternal(decoded.sender, "apiVersion", decoded.payload);
                break;
            case 11://sketch name
                database.updateNodeInfoInternal(decoded.sender, "sketchName", decoded.payload);
                break;
            case 12: //SKETCH_VERSION:
                database.updateNodeInfoInternal(decoded.sender, "sketchVersion", decoded.payload);
                break;
            case 1: //time
                log.debug("got time request");
                break;
            case 3: //id req
                log.debug("got id request");
                e._inclusionMode(function (isActive) {
                    if (isActive) {
                        log.debug("getting new id");
                        database.assignNewId(function (newId) {
                            log.debug("assigned id " + newId);
                            e.relay(255, 255, 3, 0, 4, newId);
                        });
                    } else {
                        //don't react in any way
                        log.debug("dropped id request because not in inclusion mode");
                    }
                });
                break;
            case 9: //log
            case 14: //gateway ready
                //dont handle
                break;
            case 6:
                //I_CONFIG	6	Config request from node. Reply with (M)etric or (I)mperal back to sensor.
                log.debug("got config request");
                e.relay(decoded.sender, decoded.sensor, decoded.command, 0, decoded.type, "M");
                break;
            case 5: //inclusion mode
                //not sure how to handle
                break;
            /*
             case 4: //ID_RESPONSE:
             break;

             case 10: //children
             break;
             */
            default:
                log.debug("Got unhandled internal: " + decoded.type);
                return; //uninteresting cases
        }
    };
    e._handleStreamFrame = function (decoded) {
        log.debug("Got stream frame - not supported yet", decoded);
        //ToDo: implement Stream handling
    };
    return e;
});