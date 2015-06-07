var parseString = require('xml2js').parseString;

var e = {};
e.config = require("./config.js");
e.config.openhab.url = "http://10.10.8.31/rest/items/'";
e.config.openhab.url = "http://localhost/";
e.request = require("request");
e.getItems = function(cb){
    var targetUrl = e.config.openhab.url;
    e.request({
        method: 'GET',
        timeout: 2000,
        uri: targetUrl
    }, function (error, response, body) {
        if(response.statusCode == 401){

        }else if(response.statusCode == 200){

        }else{

        }
        console.log(response.statusCode);
    });
};

e.getItems(function(e){
    console.log(e);
});