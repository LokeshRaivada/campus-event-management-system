const db = require('../config/db');
const { createNotification } = require('./notificationController');
const { getIO } = require('../config/socket');

// 1. Create a new event (Admin only)
const createEvent = async (req, res) => {
    const { title, description, date, time, venue, category, organizer, registrationLimit } = req.body;
    const adminId = req.user.id;
    const poster = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const [clubRows] = await db.execute('SELECT id FROM clubs WHERE admin_id = ?', [adminId]);
        if (clubRows.length === 0) {
            return res.status(403).json({ message: 'You are not assigned to any club. Cannot create event.' });
        }

        const clubId = clubRows[0].id;

        const [result] = await db.execute(
            'INSERT INTO events (title, description, date, time, venue, club_id, admin_id, status, category, organizer, maxSeats, registeredCount, poster_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, date, time, venue, clubId, adminId, 'PENDING', category || null, organizer || null, registrationLimit || 0, 0, poster]
        );

        // Notify Super Admin
        await createNotification({
            userRole: 'super_admin',
            eventId: result.insertId,
            type: 'EVENT_CREATED',
            title: 'New Event Request',
            message: `${organizer || 'Admin'} has requested approval for event: ${title}`
        });

        // Socket Emit for Real-time Dashboard
        try {
            getIO().to('role_super_admin').emit('EVENT_CREATED', { id: result.insertId, title, status: 'PENDING' });
        } catch (sErr) {}

        res.status(201).json({ success: true, id: result.insertId, status: 'PENDING' });
    } catch (err) {
        console.error('[CreateEvent Error]', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getPendingEvents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, e.poster_url as poster, c.name as club_name 
            FROM events e 
            LEFT JOIN clubs c ON e.club_id = c.id 
            WHERE e.status = 'PENDING'
            ORDER BY e.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, e.poster_url as poster, c.name as club_name 
            FROM events e 
            LEFT JOIN clubs c ON e.club_id = c.id 
            WHERE e.status = 'APPROVED'
            ORDER BY e.date ASC
        `);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Event not found' });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getSystemEvents = async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT e.*, e.poster_url as poster, c.name as club_name 
            FROM events e 
            LEFT JOIN clubs c ON e.club_id = c.id 
            ORDER BY e.created_at DESC
        `);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMyEvents = async (req, res) => {
    try {
        const adminId = req.user.id;
        const [rows] = await db.execute(`
            SELECT e.*, e.poster_url as poster, c.name as club_name 
            FROM events e 
            LEFT JOIN clubs c ON e.club_id = c.id 
            WHERE e.admin_id = ?
            ORDER BY e.created_at DESC
        `, [adminId]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getEventStats = async (req, res) => {
    try {
        const adminId = req.user.role === 'admin' ? req.user.id : null;
        let query = 'SELECT status, COUNT(*) as count FROM events';
        let params = [];

        if (adminId) {
            query += ' WHERE admin_id = ?';
            params.push(adminId);
        }
        query += ' GROUP BY status';

        const [rows] = await db.execute(query, params);

        const stats = { total: 0, APPROVED: 0, PENDING: 0, REJECTED: 0, totalRegistrations: 0 };
        rows.forEach(r => {
            stats[r.status] = r.count;
            stats.total += r.count;
        });
        res.status(200).json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getRecentEvents = async (req, res) => {
    try {
        const adminId = req.user.role === 'admin' ? req.user.id : null;
        let query = 'SELECT * FROM events';
        let params = [];

        if (adminId) {
            query += ' WHERE admin_id = ?';
            params.push(adminId);
        }
        query += ' ORDER BY created_at DESC LIMIT 5';

        const [rows] = await db.execute(query, params);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateEventStatus = async (req, res) => {
    const status = req.body.status?.toUpperCase(); // APPROVED | REJECTED
    const eventId = req.params.id;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status. Use APPROVED or REJECTED' });
    }

    try {
        await db.execute('UPDATE events SET status = ? WHERE id = ?', [status, eventId]);

        // Mark the super admin notification as DONE
        await db.execute(
            "UPDATE notifications SET status = 'DONE' WHERE event_id = ? AND user_role = 'super_admin' AND type = 'EVENT_CREATED'", 
            [eventId]
        );

        // Notify the Admin who created the event
        const [[event]] = await db.execute('SELECT admin_id, title FROM events WHERE id = ?', [eventId]);
        if (event) {
            const type = status === 'APPROVED' ? 'EVENT_APPROVED' : 'EVENT_REJECTED';
            await createNotification({
                userId: event.admin_id,
                eventId: eventId,
                type: type,
                title: `Event ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
                message: `Your event "${event.title}" has been ${status.toLowerCase()} by the Super Admin.`
            });
        }

        // Real-time Dashboard Updates
        try {
            const io = getIO();
            const updatePayload = { id: eventId, status, title: event?.title };
            
            // Notify the specific admin
            if (event) io.to(`user_${event.admin_id}`).emit('EVENT_UPDATED', updatePayload);
            
            // If approved, notify all students (to refresh event list)
            if (status === 'APPROVED') {
                io.to('role_student').emit('EVENT_CREATED', updatePayload);
            }
            
            // Also notify any super admins currently watching the list
            io.to('role_super_admin').emit('EVENT_UPDATED', updatePayload);
        } catch (sErr) {}

        res.status(200).json({ success: true, message: `Event ${status.toLowerCase()} successfully` });
    } catch (err) {
        console.error('[UpdateStatus Error]', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateEvent = async (req, res) => {
    const { id } = req.params;
    const { title, description, date, time, venue, category, organizer, registrationLimit } = req.body;
    const poster = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
        let query = 'UPDATE events SET title = ?, description = ?, date = ?, time = ?, venue = ?, category = ?, organizer = ?, maxSeats = ?';
        let params = [title, description, date, time, venue, category, organizer, registrationLimit];

        if (poster) {
            query += ', poster_url = ?';
            params.push(poster);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await db.execute(query, params);
        res.status(200).json({ success: true, message: 'Event updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    createEvent,
    getPendingEvents,
    getAllEvents,
    getSystemEvents,
    getEventById,
    getMyEvents,
    getEventStats,
    getRecentEvents,
    updateEventStatus,
    updateEvent,
    deleteEvent
};

