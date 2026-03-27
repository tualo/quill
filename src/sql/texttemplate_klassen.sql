delimiter;

CREATE TABLE `texttemplate_klassen` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `alias` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uidx_texttemplate_klassen_name` (`name`)
);