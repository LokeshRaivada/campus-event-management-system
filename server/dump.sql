CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS events, students, clubs, admins, super_admin, notifications, registrations, users;

CREATE TABLE `clubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `admin_id` int DEFAULT NULL,
  `category` varchar(100) DEFAULT 'Club',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `clubs` (`id`, `name`, `description`, `admin_id`, `category`) VALUES (2, 'ACM', 'ACM Club fosters innovation and technical excellence in computing and programming.
We organize coding contests, workshops, and tech events to enhance student skills.', 4, 'Club');
INSERT IGNORE INTO `clubs` (`id`, `name`, `description`, `admin_id`, `category`) VALUES (3, 'ISTE', 'IATE Club focuses on enhancing technical knowledge and innovation among students.
We organize workshops, events, and competitions to build practical skills.', 5, 'Club');
INSERT IGNORE INTO `clubs` (`id`, `name`, `description`, `admin_id`, `category`) VALUES (4, 'IEEE', 'IEEE Club is a platform for students interested in engineering and emerging technologies.
It helps members learn, collaborate, and grow through various technical activities.', 6, 'Club');

CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `venue` varchar(200) NOT NULL,
  `club_id` int DEFAULT NULL,
  `admin_id` int DEFAULT NULL,
  `organizer` varchar(200) DEFAULT NULL,
  `category` enum('Technical','Cultural','Workshop','Sports','Seminar','Hackathon','Networking') NOT NULL,
  `maxSeats` int DEFAULT '0',
  `registeredCount` int DEFAULT '0',
  `poster_url` varchar(255) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `venue`, `club_id`, `admin_id`, `organizer`, `category`, `maxSeats`, `registeredCount`, `poster_url`, `status`, `created_by`, `created_at`) VALUES (1, 'ai marathon', 'dvdfvfbvbf', '2026-04-22 18:30:00', '09:00:00', 'da lAB', 2, 4, 'sashank', 'Technical', 103, 3, '/uploads/1774191558657.png', 'APPROVED', NULL, '2026-03-22 13:16:06');
INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `venue`, `club_id`, `admin_id`, `organizer`, `category`, `maxSeats`, `registeredCount`, `poster_url`, `status`, `created_by`, `created_at`) VALUES (2, 'Cadathon', 'Cadathon is a competition where students design and build models using CAD software.
It encourages creativity, teamwork, and practical learning.', '2026-03-24 18:30:00', '15:00:00', 'ca lab', 3, 5, 'Rahul', 'Technical', 98, 0, '/uploads/1774187050746.jpg', 'REJECTED', NULL, '2026-03-22 13:44:10');
INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `venue`, `club_id`, `admin_id`, `organizer`, `category`, `maxSeats`, `registeredCount`, `poster_url`, `status`, `created_by`, `created_at`) VALUES (3, 'web wizard', 'Web Wizard is a technical event that tests participants’ skills in web development and design.
It challenges creativity, coding ability, and problem-solving in building modern web applications.', '2026-04-22 18:30:00', '16:30:00', 'ca lab', 2, 4, 'ravi', 'Technical', 30, 2, '/uploads/1774201170202.png', 'APPROVED', NULL, '2026-03-22 17:39:30');
INSERT IGNORE INTO `events` (`id`, `title`, `description`, `date`, `time`, `venue`, `club_id`, `admin_id`, `organizer`, `category`, `maxSeats`, `registeredCount`, `poster_url`, `status`, `created_by`, `created_at`) VALUES (4, 'Paper Presentation', ' paper presentation is a technical event where participants showcase research, innovative ideas, or technical knowledge to a panel of judges and an audience, usually via PowerPoint', '2026-04-23 18:30:00', '16:00:00', 'da lAB', 4, 6, 'mani', 'Technical', 60, 0, '/uploads/1774973893977.webp', 'PENDING', NULL, '2026-03-31 16:18:14');

CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'event_approval',
  `event_id` int DEFAULT NULL,
  `title` varchar(200) DEFAULT NULL,
  `message` text,
  `event_title` varchar(200) DEFAULT NULL,
  `organizer` varchar(200) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `event_date` varchar(50) DEFAULT NULL,
  `venue` varchar(200) DEFAULT NULL,
  `status` enum('PENDING','READ','DONE') DEFAULT 'PENDING',
  `action_taken` enum('approved','rejected') DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (1, NULL, 'superadmin', 'event_request', 1, NULL, 'New event request: ai marathon', 'ai marathon', 'sashank', 'Technical', '2026-03-24', 'da lAB', 'READ', 'approved', '2026-03-22 13:16:06');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (2, 4, NULL, 'event_status', 1, NULL, 'Your event "ai marathon" has been Approved', 'ai marathon', NULL, NULL, NULL, NULL, 'PENDING', NULL, '2026-03-22 13:18:46');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (4, 5, NULL, 'event_status', 2, NULL, 'Your event "Cadathon" has been Rejected', 'Cadathon', NULL, NULL, NULL, NULL, 'PENDING', NULL, '2026-03-22 14:46:07');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (5, NULL, 'super_admin', 'EVENT_CREATED', 3, 'New Event Request', 'ravi has requested approval for event: web wizard', NULL, NULL, NULL, NULL, NULL, 'DONE', NULL, '2026-03-22 17:39:30');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (6, NULL, 'super_admin', 'EVENT_CREATED', 3, 'New Event Request', 'Admin requested approval for "undefined"', NULL, NULL, NULL, NULL, NULL, 'DONE', NULL, '2026-03-22 17:39:30');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (7, 4, NULL, 'EVENT_APPROVED', 3, 'Event Approved', 'Your event "web wizard" has been approved by the Super Admin.', NULL, NULL, NULL, NULL, NULL, 'PENDING', NULL, '2026-03-22 17:40:12');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (8, NULL, 'super_admin', 'EVENT_CREATED', 4, 'New Event Request', 'mani has requested approval for event: Paper Presentation', NULL, NULL, NULL, NULL, NULL, 'PENDING', NULL, '2026-03-31 16:18:14');
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `event_id`, `title`, `message`, `event_title`, `organizer`, `category`, `event_date`, `venue`, `status`, `action_taken`, `created_at`) VALUES (9, NULL, 'super_admin', 'EVENT_CREATED', 4, 'New Event Request', 'Admin requested approval for "undefined"', NULL, NULL, NULL, NULL, NULL, 'PENDING', NULL, '2026-03-31 16:18:14');

CREATE TABLE `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `status` varchar(20) DEFAULT 'REGISTERED',
  `ticket_token` varchar(255) DEFAULT NULL,
  `attendance_status` enum('PENDING','CHECKED_IN') DEFAULT 'PENDING',
  `checked_in_at` datetime DEFAULT NULL,
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`user_id`,`event_id`),
  UNIQUE KEY `ticket_token` (`ticket_token`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `registrations` (`id`, `user_id`, `event_id`, `status`, `ticket_token`, `attendance_status`, `checked_in_at`, `registered_at`) VALUES (1, 3, 1, 'REGISTERED', NULL, 'PENDING', NULL, '2026-03-22 13:19:13');
INSERT IGNORE INTO `registrations` (`id`, `user_id`, `event_id`, `status`, `ticket_token`, `attendance_status`, `checked_in_at`, `registered_at`) VALUES (2, 8, 3, 'REGISTERED', '08b9dbd0-5f30-4c94-816f-110a8f76f63c', 'CHECKED_IN', '2026-03-22 18:22:39', '2026-03-22 17:54:26');
INSERT IGNORE INTO `registrations` (`id`, `user_id`, `event_id`, `status`, `ticket_token`, `attendance_status`, `checked_in_at`, `registered_at`) VALUES (3, 3, 3, 'REGISTERED', 'ea352a97-71a3-40e5-906d-59b71428760d', 'CHECKED_IN', '2026-03-24 16:04:49', '2026-03-23 15:45:28');
INSERT IGNORE INTO `registrations` (`id`, `user_id`, `event_id`, `status`, `ticket_token`, `attendance_status`, `checked_in_at`, `registered_at`) VALUES (4, 8, 1, 'REGISTERED', '1f2f7dae-b1c9-4035-a715-4dd80a46b427', 'PENDING', NULL, '2026-03-24 04:56:09');
INSERT IGNORE INTO `registrations` (`id`, `user_id`, `event_id`, `status`, `ticket_token`, `attendance_status`, `checked_in_at`, `registered_at`) VALUES (5, 9, 1, 'REGISTERED', '3de37b9a-613a-4bd7-8406-bd4d9219a233', 'CHECKED_IN', '2026-03-31 16:22:19', '2026-03-31 16:20:00');

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('student','admin','superadmin') NOT NULL DEFAULT 'student',
  `roll_no` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `year` varchar(10) DEFAULT NULL,
  `club_name` varchar(100) DEFAULT NULL,
  `status` enum('active','suspended') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `designation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (1, 'Super Admin', 'superadmin@gmail.com', '$2b$10$5D3czlS964Cc.kJMS0jSIOFF9v2qOSAPqWmkGjwXcIEhtxcvVb11.', 'superadmin', NULL, NULL, NULL, NULL, 'active', '2026-03-19 16:36:46', NULL);
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (3, 'Raivada Lokesh', 'raivadalokesh@gmail.com', '$2b$10$MbAJe7CGvhpC6p6BHdPR3.PNqp7Av25q5yNs3kfMKJztIwr5Bk1tS', 'student', '23341A05K9', 'CSE', '3rd', NULL, 'active', '2026-03-22 12:46:27', NULL);
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (4, 'satwik', 'satwik@gmail.com', '$2b$10$YgcYSK4/xKGQZya8ZE4WveDUQOWu1U8OK/85bTI1UuJgAgZB2jQyK', 'admin', NULL, 'CSE', NULL, 'ACM', 'active', '2026-03-22 13:13:56', 'Lead Admin');
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (5, 'Rahul', 'rahul@gmail.com', '$2b$10$5F0nJKDdnhKkDuCJ5sXTxu9ZfNVPfJfcuegMmTziTMrJhK.X5l4rm', 'admin', NULL, 'CSE', NULL, 'ISTE', 'active', '2026-03-22 13:29:34', 'Lead Admin');
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (6, 'gayathri', 'gayathri@gmail.com', '$2b$10$j.s.hITgm/R9acBElqkCAewwKY0M3/l48Nj.8wIfjN6WSf/OMxafu', 'admin', NULL, 'CSE', NULL, 'IEEE', 'active', '2026-03-22 13:32:09', 'Lead Admin');
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (7, 'Regana Akash', 'akash@gmail.com', '$2b$10$21iEUBz/aMV1eK3YKYvy9.PGJbGkPGUh3g6A0lYn7EBYKqS69Fpby', 'student', '23341A05L2', 'CSE', '3rd', NULL, 'active', '2026-03-22 13:33:30', NULL);
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (8, 'Dunna Ravi', 'ravi@gmail.com', '$2b$10$.7i4LBDEswmoY7jjVNu2xe6u/ZMjRmn6FO7CzVSUxgANOIiry0vd.', 'student', '23341A0534', 'ECE', '2nd', NULL, 'active', '2026-03-22 13:35:18', NULL);
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (9, 'murali', 'murali@gmail.com', '$2b$10$j9XMXuTudeqi2pkZ7nZg9uTeugtyCYij6hTWlKHVZ3YSBRG7asQzi', 'student', '23341A05K9', 'IT', '2nd', NULL, 'active', '2026-03-31 16:11:08', NULL);
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `roll_no`, `department`, `year`, `club_name`, `status`, `created_at`, `designation`) VALUES (10, 'prudhvi', 'prudhvi@gmail.com', '$2b$10$gcQlq132usFINZ4SRHoNeevYJa9LkYOtDBTT4CV1Ec5jzz6..JCdG', 'student', '23341A05j4', 'CSE', '3rd', NULL, 'active', '2026-04-07 16:42:35', NULL);

SET FOREIGN_KEY_CHECKS = 1;
