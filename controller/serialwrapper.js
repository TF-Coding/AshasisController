if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var e = {};
    var log = require("logger");

    /*
     public interface:
     .connect( callback ) => callback( error )
     .onData( callback ) => callback( rawLine )
     */
    var SerialPort = require('serialport').SerialPort;
    var config = require("config");
    e.serialport = null;

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
    e._onDataCallback = function () { /* noop */ };
    e.send = function(data){
        e.serialport.write(data);
    };
    e.onData = function (dataCallback) {
        e._onDataCallback = dataCallback;
    };
    e.connect = function (callback) {
        e.autoReconnect = autoReconnect;
        e.serialport = new SerialPort(config.gateway.serial.port, config.gateway.serial);
        e.serialport.on('open', function () {
            log.info('SerialPort opened :: ' + config.gateway.serial.port + "@" + config.gateway.serial.baudrate);
            callback();
        });
        e.serialport.on('data', function (raw) {
            e._appendBuffer(raw.toString());
        });
        e.serialport.on('end', function () {
            log.error('SerialPort disconnected - reconnect');
            e.connect(callback);
        });
        e.serialport.on('error', function () {
            log.error('SerialPort error - reconnect');
            e.connect(callback);
        });
        e.serialport.open();
    };

    return e;
});