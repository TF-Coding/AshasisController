var e = {};
e.appendedString = "";
e.appendData = function(str) {
    pos=0;
    while (str.charAt(pos) != '\n' && pos < str.length) {
        e.appendedString=e.appendedString+str.charAt(pos);
        pos++;
    }
    if (str.charAt(pos) == '\n') {
	console.log(e.appendedString);
        e.gotData( e.decode( e.appendedString.trim() ) );
        e.appendedString="";
    }
    if (pos < str.length) {
        e.appendData(str.substr(pos+1,str.length-pos-1));
    }
}
e.connectSerialPort = function (cb) {
    var gwType = e.config.gateway.useType;
    if (gwType == undefined) {
        cb("Gateway type undefined :: must be either serial or ethernet");
        return;
    }

    var gwConf = e.config.gateway[gwType];
    if (gwConf == undefined) {
        cb("Unknown gateway type :: must be either serial or ethernet");
        return;
    }

    var delay = 500;

    if (gwType == 'serial') {
        var SerialPort = require('serialport').SerialPort;
        e.gw = new SerialPort(gwConf.port, gwConf);
        e.gw.open();
        e.gw.on('open', function () {
            console.log('SerialPort opened :: ' + gwConf.port + "@" + gwConf.baudrate);
        }).on('data', function (raw) {
	    e.appendData(raw.toString());
        }).on('end', function () {
            console.log('SerialPort disconnected :: trying reconnect');
            require('sleep').sleep(delay);
            e.gw.open();
        }).on('error', function () {
            console.log('SerialPort error :: trying reconnect');
            require('sleep').sleep(delay);
            e.gw.open();
        });
    } else if (e.config.gateway.useType == 'ethernet') {
        e.gw = require('net').Socket();
        e.gw.connect(gwConf.port, gwConf.address);
        e.gw.setEncoding(gwConf.encoding);
        e.gw.on('connect', function () {
            console.log('Ethernet gateway connected :: ' + gwConf.address + ":" + gwConf.port);
            e.firmware.preloadFirmware();
            cb();
        }).on('data', function (raw) {
            if (e.config.debug.logGwRx) console.log("<- " + raw.trim());
            raw.trim().split("\n").forEach(function (r) {
                e.gotData(e.decode(r));
            });
        }).on('end', function () {
            console.log('EthernetGateway disconnected :: trying reconnect');
            require('sleep').usleep(delay);
            e.gw.connect(gwConf.port, gwConf.address);
            e.gw.setEncoding(gwConf.encoding);
        }).on('error', function () {
            console.log('EthernetGateway error :: trying reconnect');
            require('sleep').usleep(delay);
            e.gw.connect(gwConf.port, gwConf.address);
            e.gw.setEncoding(gwConf.encoding);
        });
    } else {
        cb('unknown gateway type - supported: serial, ethernet');
    }
};
//endregion
e.encode = function (sender, sensor, command, acknowledge, type, payload) {
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
e.decode = function (msg) {
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
    if (command == e.constants.C_STREAM) {
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
};
e.relay = function (sender, sensor, command, ack, type, payload) {
    e.relayRaw(e.encode(sender, sensor, command, ack, type, payload));
};
e.relayRaw = function (msg) {
    console.log("[e]-> " + msg);
};

e.start = function (callback) {
    e.connectSerialPort(function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback();
        }
    );
};

e.handleInternal = function (decoded) {
    switch (decoded.type) {
        case e.constants.I_BATTERY_LEVEL:
        case e.constants.I_VERSION:
        case e.constants.I_SKETCH_NAME:
        case e.constants.I_SKETCH_VERSION:
            e.database.updateNodeInfoInternal(decoded.sender, decoded.type, decoded.payload);
            break;
        case e.constants.I_TIME:
            break;
        case e.constants.I_ID_REQUEST:
            break;
        case e.constants.I_LOG_MESSAGE:
            break;
        case e.constants.I_CONFIG:
            //I_CONFIG	6	Config request from node. Reply with (M)etric or (I)mperal back to sensor.
            break;
        /*
         case e.constants.I_ID_RESPONSE: break;
         case e.constants.I_INCLUSION_MODE: break;
         case e.constants.I_CONFIG: break;
         case e.constants.I_CHILDREN: break;
         */
        default:
            console.log("Got unhandles internal: " + decoded.type);
            return; //uninteresting cases
    }
};

e.handlePresentation = function (decoded) {
    if (e.config.openhab.useExperimentalV2Mapping) {
        if (decoded.sensor == 255) {
            e.database.updateNodeInfoPresentation(decoded.sender, decoded.type, decoded.payload);
        } else {
	    console.log(decoded);
            e.database.updateChildInfo(decoded.sender, decoded.sensor, decoded.type);
        }
    }
};

e.handleSet = function (decoded) {
        e.openhab.updateItem(decoded);
};


e.gotData = function (decoded) {
    switch (decoded.command) {
        case e.constants.C_PRESENTATION: //0
            //console.log("PRESENTATION" + " :: ", decoded);
            e.handlePresentation(decoded);
            break;
        case e.constants.C_SET://1 - value FROM sensor
            e.handleSet(decoded);
            break;
        case e.constants.C_REQ: //2
            console.log("REQ" + " :: ", decoded);
            //not supported
            break;
        case e.constants.C_INTERNAL: //3
            e.handleInternal(decoded);
            //console.log("INTERNAL" + " :: ",decoded);
            break;
        case e.constants.C_STREAM:  //4
            break;
    }
    //e.appendData(rd.toString(), db, e.gw);
};


e.config = null;
e.firmware = null;
e.openhab = null;
e.constants = null;
e.database = null;
module.exports = function (config, database) {
    e.config = config;
    e.database = database;
    e.constants = require('./constants.js');
    e.firmware = require('./firmware.js')(e);
    e.openhab = require('./openhab.js')(e);
    return e;
};