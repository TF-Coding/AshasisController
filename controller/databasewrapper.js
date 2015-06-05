var db = require("mysql");

var e = {};
e.config = require('../config');
e.constants = require('./constants');

e.conn = db.createConnection(e.config.database);

e.connect = function (cb) {
    e.conn.connect(cb);
};

e.updateChildInfo = function (nodeId, childId, type) {
    //check if existing
    e.conn.query("SELECT COUNT(*) as `exists` FROM children WHERE nodeId = " + nodeId + " AND childId = " + childId, function (err, rows, fields) {
        if (err) {
            console.log("DB-ERROR: " + err);
        } else {
            if (rows[0].exists == 0) {
                //create entry
		qry = "INSERT INTO children (nodeId, childId, `type`) VALUES (" + nodeId + ", " + childId + ", " + type.toString() + ")";
            } else {
                qry = "UPDATE children SET `type`=" + type + " WHERE nodeId = " + nodeId + " AND childId = " + childId;
            }
		console.log(qry);
            e.conn.query(qry);

        }
    });
};

e.updateNodeInfoInternal = function (nodeId, type, value) {
    //check if existing
    e.conn.query("SELECT COUNT(*) as `exists` FROM nodes WHERE nodeId = " + nodeId, function (err, rows, fields) {
        if (err) {
            console.log("DB-ERROR: " + err);
        } else {
            var updateCol = "";
            switch (type) {
                case e.constants.I_SKETCH_NAME:
                    updateCol = "sketchName";
                    break;
                case e.constants.I_BATTERY_LEVEL:
                    updateCol = "batteryLevel";
                    break;
                case e.constants.I_VERSION:
                    updateCol = "apiVersion";
                case e.constants.I_SKETCH_VERSION:
                    updateCol = "sketchVersion";
                    break;
                default:
                    console.log("Unknown updateNodeInfo: N:" + nodeId + " T:" + type + " V:" + value);
                    return;
                    break;
            }
            var qry = "UPDATE nodes SET `"+updateCol+"`='"+value+"' WHERE nodeId="+nodeId;
            if (rows[0].exists == 0) {
                //create entry
                e.conn.query("INSERT INTO nodes (nodeId) VALUES (" + nodeId + ")", function () {
                    e.conn.query(qry);
                });
            } else {
                e.conn.query(qry);
            }
        }
    });
};

e.updateNodeInfoPresentation = function (nodeId, type, value) {
    //check if existing
    e.conn.query("SELECT COUNT(*) as `exists` FROM nodes WHERE nodeId = " + nodeId, function (err, rows, fields) {
        if (err) {
            console.log("DB-ERROR: " + err);
        } else {
            switch (type) {
                case e.constants.S_ARDUINO_NODE:
                case e.constants.S_ARDUINO_REPEATER_NODE:
                    var qry = "UPDATE nodes SET apiVersion='" + value + "' WHERE nodeId = " + nodeId;
                    break;
                default:
                    console.log("Unknown updateNodeInfo: N:" + nodeId + " T:" + type + " V:" + value);
                    break;
            }

            if (rows[0].exists == 0) {
                //create entry
                e.conn.query("INSERT INTO nodes (nodeId) VALUES (" + nodeId + ")", function () {
                    e.conn.query(qry);
                });
            } else {
                e.conn.query(qry);
            }
        }
    });
};

e.getOpenhabItemBinding = function(sender,sensor, cb){
    e.conn.query("SELECT openhabItem as itm FROM children, mapping WHERE children.id = mapping.childrenId AND children.nodeId = "+sender+" AND children.childId = " + sensor, function(err, row, fields){
        if(err || row.length == 0 || row[0].itm == undefined){
            console.log("No binding for N:" + sender + " C:" + sensor);
            return;
        }
	e.conn.query("UPDATE nodes SET lastContact=NOW() WHERE nodeId=" + sender);
        cb(row[0].itm);
    });
};

module.exports = e;