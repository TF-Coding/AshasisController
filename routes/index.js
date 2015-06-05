var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index',{});
});

router.get("/mapping", function (req, res, next) {
    //request(config.openhab.url + "/rest/items");
    res.render("mapping", {});
});

module.exports = router;
