if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var e = {};
    var log = require("logger");
    var config = require("config");
    /*
     public interface:
     .connect( callback ) => callback( error )
     .onData( callback ) => callback( rawLine )
     */
    e._buffer = "";
    e._appendBuffer = function (str) {
        pos = 0;
        while (str.charAt(pos) != '\n' && pos < str.length) {
            e._buffer = e._buffer + str.charAt(pos);
            pos++;
        }
        if (str.charAt(pos) == '\n') {
            e._onDataCallback(e._buffer.trim());
            e._buffer = "";
        }
        if (pos < str.length) {
            e._appendBuffer(str.substr(pos + 1, str.length - pos - 1));
        }
    };


    e._onDataCallback = function () { /* noop */
    };
    e.onData = function (dataCallback) {
        e._onDataCallback = dataCallback;
    };

    e.connect = function (callback) {
        e.gw = require('net').Socket();
        e.gw.connect(config.gateway.ethernet.port, config.gateway.ethernet.address);
        e.gw.setEncoding(config.gateway.ethernet.encoding);
        e.gw.on('connect', function () {
            log.info('Ethernet gateway connected :: ' + config.gateway.ethernet.address + ":" + config.gateway.ethernet.port);
            callback();
        }).on('data', function (raw) {
            e._appendBuffer(raw.toString());
            //raw.trim().split("\n").forEach(function (r) {
            //e._onDataCallback(r);
            //});
        }).on('end', function () {
            log.error('EthernetGateway disconnected - reconnect');
            e.connect(callback);
        }).on('error', function () {
            log.error('EthernetGateway error - reconnect');
            e.connect(callback);
        });
    };
    e.send = function(data){
        e.gw.write(data);
    };
    return e;
});