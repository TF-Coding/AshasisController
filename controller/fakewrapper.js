//this one is just a fake provider based on the functional ones

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
    var config = require("config");
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
        log.info("Data to gateway:" + data);
    };
    e.onData = function (dataCallback) {
        e._onDataCallback = dataCallback;
    };
    e.connect = function (callback) {
        callback();
    };

    return e;
});