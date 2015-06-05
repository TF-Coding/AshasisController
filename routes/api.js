var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var controller;
var constants;
var config;

router.use(bodyParser.text({inflate: true}));

router.get("/openhab/push/:item/:value", function (req, res, next) {
    console.log("API::PUSH::GET2::" + req.params.item + "::" + req.params.value);
    var itm = req.params.item;
    var val = req.params.value;
    if (itm == undefined || val == undefined) {
        res.sendStatus(400);
        return;
    }
    if (itm.trim().length > 0 || val.trim().length > 0) {
        res.sendStatus(400);
        return;
    }

    push(itm, val);
    res.sendStatus(200);
});

router.post("/postdebug",  function (req, res, next){
   console.log(req.body);
});

router.all("*", function (req, res, next) {
    res.sendStatus(404);
});


module.exports = router;
