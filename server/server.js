const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

const http = require('http');
const { initSocket } = require('./config/socket');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const server = http.createServer(app);
const io = initSocket(server);

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventRoutes = require('./routes/eventRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const clubRoutes = require('./routes/clubRoutes');
const registrationRoutes = require('./routes/registrationRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/registrations', registrationRoutes);

// Public Stats (for Home Page)
app.get('/api/public/stats', async (req, res) => {
    try {
        const [[{ clubs }]] = await db.execute('SELECT COUNT(*) as clubs FROM clubs');
        const [[{ events }]] = await db.execute('SELECT COUNT(*) as events FROM events WHERE status = "APPROVED"');
        const [[{ students }]] = await db.execute('SELECT COUNT(*) as students FROM users WHERE role = "student"');
        res.status(200).json({ 
            clubs: clubs + 16, 
            eventsPerYear: 120, 
            students: students + 5000, 
            satisfaction: "95%" 
        });
    } catch (err) {
        res.status(500).json({ clubs: 16, eventsPerYear: 120, students: 5000, satisfaction: "95%" });
    }
});

// Test Route
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Event Management API is healthy' });
});

// Temporary Migration Route
app.get('/api/migrate', async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const mysql = require('mysql2/promise');
        const sqlScript = fs.readFileSync(path.join(__dirname, 'dump.sql'), 'utf-8');
        
        // We must create a specific connection with multipleStatements: true
        // The pool in db.js does not have multipleStatements: true
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            ssl: { rejectUnauthorized: false }
        });
        
        await connection.query(sqlScript);
        await connection.end();
        
        res.status(200).json({ success: true, message: 'Database migrated successfully!' });
    } catch (err) {
        console.error('Migration error:', err);
        res.status(500).json({ success: false, message: 'Migration failed', error: err.message });
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(`[Global Error] ${req.method} ${req.url}:`, err.message);
    res.status(500).json({ 
        success: false, 
        message: 'Internal Server Error', 
        error: err.message 
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
