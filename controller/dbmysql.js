if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function (require) {
    var log = require("logger");
    var e = {};
    e._db = require("mysql");
    e.config = require('config');
    e._conn = e._db.createConnection(e.config.database);

    e._handleError = function(e){
        log.error("MYSQL: ERROR ::" + e);
    };

    e.connect = function (cb) {
        //e._conn.on('error',e._handleError);
        log.info("Connecting to database");
        e._conn.connect(cb);
    };
    e.updateLastUpdate = function (nodeId, childId) {
        e._conn.query("UPDATE mapping SET lastupdate = NOW() WHERE id=(SELECT id FROM children WHERE nodeId = " + nodeId + " AND childId = " + childId + ")");
        e._conn.query("UPDATE nodes SET lastcontact = NOW() WHERE nodeId=" + nodeId);
    };
    e.updateChildInfo = function (nodeId, childId, type) {
        //check if existing
        e._conn.query("SELECT COUNT(*) as `exists` FROM children WHERE nodeId = " + nodeId + " AND childId = " + childId, function (err, rows, fields) {
            if (err) {
                log.error("DB-ERROR: " + err);
            } else {
                if (rows[0].exists == 0) {
                    //create entry
                    qry = "INSERT INTO children (nodeId, childId, `type`) VALUES (" + nodeId + ", " + childId + ", " + type.toString() + ")";
                } else {
                    qry = "UPDATE children SET `type`=" + type + " WHERE nodeId = " + nodeId + " AND childId = " + childId;
                }
                e._conn.query(qry);

            }
        });
    };

    e.updateNodeInfoInternal = function (nodeId, updateCol, value) {
        //check if existing
        e._conn.query("SELECT COUNT(*) as `exists` FROM nodes WHERE nodeId = " + nodeId, function (err, rows, fields) {
            if (err) {
                log.error("DB-ERROR: " + err);
            } else {
                var qry = "UPDATE nodes SET `" + updateCol + "`='" + value + "' WHERE nodeId=" + nodeId;
                if (rows[0].exists == 0) {
                    //create entry
                    e._conn.query("INSERT INTO nodes (nodeId) VALUES (" + nodeId + ")", function () {
                        e._conn.query(qry);
                    });
                } else {
                    e._conn.query(qry);
                }
            }
        });
    };

    e.updateNodeInfoPresentation = function (nodeId, type, value) {
        //check if existing
        e._conn.query("SELECT COUNT(*) as `exists` FROM nodes WHERE nodeId = " + nodeId, function (err, rows, fields) {
            if (err) {
                log.error("DB-ERROR: " + err);
            } else {
                switch (type) {
                    //Todo: handle other cases?
                    case 17: //S_ARDUINO_NODE
                    case 18: //S_ARDUINO_REPEATER_NODE
                        var qry = "UPDATE nodes SET apiVersion='" + value + "' WHERE nodeId = " + nodeId;
                        break;
                    default:
                        log.debug("Unknown updateNodePresentation: N:" + nodeId + " T:" + type + " V:" + value);
                        break;
                }

                if (rows[0].exists == 0) {
                    //create entry
                    e._conn.query("INSERT INTO nodes (nodeId) VALUES (" + nodeId + ")", function () {
                        e._conn.query(qry);
                    });
                } else {
                    e._conn.query(qry);
                }
            }
        });
    };

    e.getOpenhabItemBinding = function (sender, sensor, cb) {
        e._conn.query("SELECT openhabItem as itm FROM children, mapping WHERE children.id = mapping.childrenId AND children.nodeId = " + sender + " AND children.childId = " + sensor, function (err, row, fields) {
            if (err || row.length == 0 || row[0].itm == undefined) {
                log.error("Einheit " + sender + " Sensor " + sensor + " hat keine openhab-Zuordnung");
                return;
            }
            e._conn.query("UPDATE nodes SET lastContact=NOW() WHERE nodeId=" + sender);
            cb(row[0].itm);
        });
    };

    e.getItemInfos = function (itm, cb) {
        e._conn.query("SELECT nodeId, childId, `type` FROM mapping, children WHERE mapping.childrenId = children.id AND openhabItem = '" + itm + "'", function (err, row, fields) {
            if (err || row.length == 0) {
                log.error("Item [" + itm + "] hat keine Zuordnung");
                cb(true);
                return;
            }
            cb(false, {sender: row[0].nodeId, sensor: row[0].childId, type: row[0].type});
        });
    };

    e.getTypeForChild = function(sender,sensor, cb){
        e._conn.query("SELECT `type` FROM children WHERE nodeId = '"+sender+"' AND childId = '" + sensor + "'", function (err, row, fields) {
            if (err || row.length == 0) {
                cb(err);
            } else {
                cb(err, row[0].type);
            }
        });
    };

    e.getAllNodes = function (cb) {
        e._conn.query("SELECT * FROM nodes", function (err, rows, fields) {
            cb(rows);
        });
    };
    e.getAllChildren = function (cb) {
        e._conn.query("SELECT * FROM children", function (err, rows, fields) {
            cb(rows);
        });
    };

    e.getAllPresentationTypes = function (cb) {
        e._conn.query("SELECT * FROM types_presentation", function (err, rows, fields) {
            cb(rows);
        });
    };

    e.getAllValueTypes = function (cb) {
        e._conn.query("SELECT * FROM types_value", function (err, rows, fields) {
            cb(rows);
        });
    };

    e.getAllMappings = function (cb) {
        e._conn.query("SELECT nodeId, childId, (SELECT `key` FROM types_presentation WHERE value=`type`) as type_key, `type` as type_val, openhabItem, lastUpdate FROM children LEFT JOIN mapping ON children.id = mapping.childrenId", function (err, rows, fields) {
            cb(rows);
        });
    };

    return e;
});