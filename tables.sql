-- --------------------------------------------------------
-- Host:                         localhost
-- Server Version:               5.6.16 - MySQL Community Server (GPL)
-- Server Betriebssystem:        Win32
-- HeidiSQL Version:             9.1.0.4867
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Exportiere Struktur von Tabelle mysensors.children
CREATE TABLE IF NOT EXISTS `children` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nodeId` int(11) NOT NULL DEFAULT '0',
  `childId` int(11) NOT NULL DEFAULT '0',
  `type` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_parent` (`nodeId`),
  KEY `fk_type` (`type`),
  CONSTRAINT `fk_type` FOREIGN KEY (`type`) REFERENCES `types_presentation` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `children` ENABLE KEYS */;


-- Exportiere Struktur von Tabelle mysensors.mapping
CREATE TABLE IF NOT EXISTS `mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `childrenId` int(11) NOT NULL,
  `openhabItem` varchar(50) NOT NULL,
  `lastUpdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `childrenId` (`childrenId`),
  UNIQUE KEY `openhabItem` (`openhabItem`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `mapping` ENABLE KEYS */;


-- Exportiere Struktur von Tabelle mysensors.nodes
CREATE TABLE IF NOT EXISTS `nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nodeId` int(11) NOT NULL,
  `sketchName` varchar(50) DEFAULT NULL,
  `sketchVersion` varchar(50) DEFAULT NULL,
  `apiVersion` varchar(50) DEFAULT NULL,
  `lastcontact` timestamp NULL DEFAULT NULL,
  `added` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `batteryLevel` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nodeId` (`nodeId`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*!40000 ALTER TABLE `nodes` ENABLE KEYS */;


-- Exportiere Struktur von Tabelle mysensors.types_presentation
CREATE TABLE IF NOT EXISTS `types_presentation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(32) NOT NULL,
  `value` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `value` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;

-- Exportiere Daten aus Tabelle mysensors.types_presentation: ~26 rows (ungefähr)
/*!40000 ALTER TABLE `types_presentation` DISABLE KEYS */;
INSERT INTO `types_presentation` (`id`, `key`, `value`) VALUES
	(1, 'S_DOOR', 0),
	(2, 'S_MOTION', 1),
	(3, 'S_SMOKE', 2),
	(4, 'S_LIGHT', 3),
	(5, 'S_DIMMER', 4),
	(6, 'S_COVER', 5),
	(7, 'S_TEMP', 6),
	(8, 'S_HUM', 7),
	(9, 'S_BARO', 8),
	(10, 'S_WIND', 9),
	(11, 'S_RAIN', 10),
	(12, 'S_UV', 11),
	(13, 'S_WEIGHT', 12),
	(14, 'S_POWER', 13),
	(15, 'S_HEATER', 14),
	(16, 'S_DISTANCE', 15),
	(17, 'S_LIGHT_LEVEL', 16),
	(18, 'S_ARDUINO_NODE', 17),
	(19, 'S_ARDUINO_RELAY', 18),
	(20, 'S_LOCK', 19),
	(21, 'S_IR', 20),
	(22, 'S_WATER', 21),
	(23, 'S_AIR_QUALITY', 22),
	(24, 'S_CUSTOM', 23),
	(25, 'S_DUST', 24),
	(26, 'S_SCENE_CONTROLLER', 25);
/*!40000 ALTER TABLE `types_presentation` ENABLE KEYS */;


-- Exportiere Struktur von Tabelle mysensors.types_value
CREATE TABLE IF NOT EXISTS `types_value` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(32) NOT NULL,
  `value` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  UNIQUE KEY `value` (`value`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

-- Exportiere Daten aus Tabelle mysensors.types_value: ~37 rows (ungefähr)
/*!40000 ALTER TABLE `types_value` DISABLE KEYS */;
INSERT INTO `types_value` (`id`, `key`, `value`) VALUES
	(1, 'V_TEMP', 0),
	(2, 'V_HUM', 1),
	(3, 'V_LIGHT', 2),
	(4, 'V_DIMMER', 3),
	(5, 'V_PRESSURE', 4),
	(6, 'V_FORECAST', 5),
	(7, 'V_RAIN', 6),
	(8, 'V_RAINRATE', 7),
	(9, 'V_WIND', 8),
	(10, 'V_GUST', 9),
	(11, 'V_DIRECTION', 10),
	(12, 'V_UV', 11),
	(13, 'V_WEIGHT', 12),
	(14, 'V_DISTANCE', 13),
	(15, 'V_IMPEDANCE', 14),
	(16, 'V_ARMED', 15),
	(17, 'V_TRIPPED', 16),
	(18, 'V_WATT', 17),
	(19, 'V_KWH', 18),
	(20, 'V_SCENE_ON', 19),
	(21, 'V_SCENE_OFF', 20),
	(22, 'V_HEATER', 21),
	(23, 'V_HEATER_SW', 22),
	(24, 'V_LIGHT_LEVEL', 23),
	(25, 'V_VAR1', 24),
	(26, 'V_VAR2', 25),
	(27, 'V_VAR3', 26),
	(28, 'V_VAR4', 27),
	(29, 'V_VAR5', 28),
	(30, 'V_UP', 29),
	(31, 'V_DOWN', 30),
	(32, 'V_STOP', 31),
	(33, 'V_IR_SEND', 32),
	(34, 'V_IR_RECEIVE', 33),
	(35, 'V_FLOW', 34),
	(36, 'V_VOLUME', 35),
	(37, 'V_LOCK_STATUS', 36);
/*!40000 ALTER TABLE `types_value` ENABLE KEYS */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
