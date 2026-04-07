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
