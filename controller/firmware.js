var fs = require('fs');
var e = {};
e.controller = {};
e.preloadFirmware = function () {
    var fwSketches = fs.readdirSync("./sketches");
    for (var i = 0; i < fwSketches.length; i++) console.log(fwSketches[i]);
};
module.exports = function(controller){
    e.controller = controller;
    return e;
}