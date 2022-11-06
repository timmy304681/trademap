CREATE TABLE `products` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `number` char(18),
  `user_id` int,
  `title` varchar(100) NOT NULL,
  `price` int NOT NULL,
  `description` text NOT NULL,
  `time` DATETIME NOT NULL,
  `status` tinyint,
  `place` varchar(30),
  `address` varchar(100),
  `lat` DECIMAL(10,6),
  `lng` DECIMAL(10,6),
  `county` varchar(10),
  `district` varchar(10),
  `create_time` timestamp COMMENT 'current_timestamp'
);

CREATE TABLE `images` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `forsale_id` int,
  `image` varchar(100)
);

CREATE TABLE `users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255),
  `name` varchar(30),
  `password` varchar(100),
  `photo` varchar(50)
);

CREATE TABLE `orders` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `users_id` int,
  `forsale_id` int,
  `time` DATETIME
);

CREATE TABLE `chat_room` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `users_id` int,
  `chatmate` int
);

CREATE TABLE `mogodb` (
  `id` int PRIMARY KEY,
  `users1` varchar(255),
  `users2` varchar(255),
  `sender` varchar(255),
  `message` text,
  `time` timestamp
);

ALTER TABLE `products` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `images` ADD FOREIGN KEY (`forsale_id`) REFERENCES `products` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`users_id`) REFERENCES `users` (`id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`forsale_id`) REFERENCES `products` (`id`);

ALTER TABLE `chat_room` ADD FOREIGN KEY (`users_id`) REFERENCES `users` (`id`);

ALTER TABLE `chat_room` ADD FOREIGN KEY (`chatmate`) REFERENCES `users` (`id`);
