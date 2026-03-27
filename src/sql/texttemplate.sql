delimiter;

CREATE TABLE `texttemplate` (
  `id` int(11) NOT NULL,
  `klasse` int(11) NOT NULL,
  `text` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_texttemplate_klasse` (`klasse`),
  CONSTRAINT `fk_texttemplate_klasse` FOREIGN KEY (`klasse`) REFERENCES `texttemplate_klassen` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);