USE challengedb;
CREATE TABLE `Posts` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` varchar(38) NOT NULL,
    `title` varchar(250) NOT NULL,
    `content` mediumtext,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `modified_by` varchar(38) NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE VIEW `v_posts` AS
(
    SELECT P.*,
        avg(R.stars) AS review,
        datediff(current_date(), P.created) AS days,
        if(datediff(current_date(), P.created)>7,"Old post", "New post") as tag 
    FROM challengedb.Posts AS P
        LEFT JOIN challengedb.Reviews R ON R.post_id = P.id
    GROUP BY P.id
    ORDER BY P.created DESC
)

DELIMITER //

CREATE PROCEDURE sp_get_posts(
    IN fromDate datetime,
    IN toDate datetime)
BEGIN
	SELECT * FROM challengedb.v_posts
	WHERE ( fromDate is null or created >= fromDate)
		AND ( toDate is null or created <= toDate);
END //

DELIMITER ;


CREATE TABLE `Posts_logs` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `action` varchar(50) NOT NULL,
    `user_id` varchar(38) NOT NULL,
    `post_id` int(11) UNSIGNED NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `Reviews` (
    `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` varchar(38) DEFAULT NULL,
    `post_id` int(11) UNSIGNED NOT NULL,
    `content` mediumtext,
    `stars` int(1) UNSIGNED DEFAULT 5,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `post_id` (`post_id`),
    CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `Posts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE VIEW `v_reviews` AS
(SELECT * FROM `Reviews` 
	ORDER BY `created` DESC);
    

DELIMITER $$

CREATE TRIGGER `after_insert_post`
AFTER INSERT
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES('Create', NEW.modified_by, NEW.id);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER `after_update_post`
AFTER UPDATE
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES('Update', NEW.modified_by, NEW.id);
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER `after_delete_post`
AFTER DELETE
ON `Posts` FOR EACH ROW
BEGIN
	INSERT INTO  `Posts_logs`(`action`, `user_id`, `post_id`)
	VALUES('Delete', OLD.modified_by, OLD.id);
END$$

DELIMITER ;