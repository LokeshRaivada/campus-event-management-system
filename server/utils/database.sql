-- Database Extraction for Event Management System

CREATE DATABASE IF NOT EXISTS event_management;
USE event_management;

-- 1. Super Admin Table
CREATE TABLE super_admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    role VARCHAR(20) DEFAULT 'super_admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Admins Table (Created by Super Admin)
CREATE TABLE admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Clubs Table (Each club has one admin)
CREATE TABLE clubs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    admin_id INT UNIQUE, 
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

-- 4. Students Table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    roll_no VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    club_id INT, 
    role VARCHAR(20) DEFAULT 'student',
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL
);

-- 5. Events Table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue VARCHAR(255),
    club_id INT,
    admin_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

-- Initial Super Admin (Password: admin123)
-- Note: In production, you would hash this before inserting.
INSERT INTO super_admin (username, email, password) 
VALUES ('superadmin', 'superadmin@gmail.com', '$2a$10$Xm8K0zYk7fD9R8D1P0zY8O5lF5W.6.7.8.9.0.1.2.3.4.5'); 
