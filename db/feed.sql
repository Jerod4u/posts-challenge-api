USE challengedb;
CREATE TABLE `Posts` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(11) UNSIGNED NOT NULL,
    `title` varchar(250) NOT NULL,
    `content` mediumtext,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `modified_by` int(11) UNSIGNED NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `Posts_logs` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `action` varchar(50) NOT NULL,
    `user_id` int(11) UNSIGNED DEFAULT NULL,
    `post_id` int(11) UNSIGNED NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `post_id` (`post_id`),
    CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`post_id`) REFERENCES `Posts` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `Reviews` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` int(11) UNSIGNED DEFAULT NULL,
    `post_id` int(11) UNSIGNED NOT NULL,
    `content` mediumtext,
    `starts` int(1) UNSIGNED DEFAULT 5,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `post_id` (`post_id`),
    CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `Posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

DELIMITER $$

CREATE TRIGGER `after_insert_post`
AFTER INSERT
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES(`Create`, NEW.modified_by, NEW.id);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER `after_update_post`
AFTER UPDATE
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES(`Update`, NEW.modified_by, NEW.id);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER `after_delete_post`
AFTER UPDATE
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES(`Delete`, NEW.modified_by, NEW.id);
END$$

DELIMITER ;