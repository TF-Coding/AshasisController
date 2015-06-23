if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}
define(function (require) {
    var e = {};
    e._register = {};
    e.call= function(hookName){
        if(e._register[hookName] != undefined) e._register[hookName]();
    };
    e.register = function(hookName, hookMethode, overwriteIfExisting){
        if(overwriteIfExisting || e._register[hookName] == undefined) e._register[hookName] = hookMethode;
    };
    e.registerOneTimer = function(hookName, hookMethode, overwriteIfExisting){
        var methodWrapper = function(){
            e.unregister(hookName);
            hookMethode();
        };
        if(overwriteIfExisting || e._register[hookName] == undefined) e._register[hookName] = methodWrapper;
    };
    e.unregister = function(hookName){
        delete e._register[hookName];
    };
    return e;
});