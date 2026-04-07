const db = require('../config/db');
const { getIO } = require('../config/socket');
const { v4: uuidv4 } = require('uuid');

// Register for an event
const registerForEvent = async (req, res) => {
    const { eventId } = req.body;
    const userId = req.user.id;

    try {
        const [[event]] = await db.execute('SELECT id, status, maxSeats, registeredCount FROM events WHERE id = ?', [eventId]);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        
        if (event.status !== 'APPROVED') {
            return res.status(403).json({ message: 'Registration is not open for this event.' });
        }

        if (event.maxSeats > 0 && event.registeredCount >= event.maxSeats) {
            return res.status(400).json({ message: 'Event is already full.' });
        }

        const [regRows] = await db.execute('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (regRows.length > 0) {
            return res.status(400).json({ message: 'You are already registered' });
        }

        const ticketToken = uuidv4();
        await db.execute(
            'INSERT INTO registrations (user_id, event_id, status, ticket_token, attendance_status) VALUES (?, ?, ?, ?, ?)',
            [userId, eventId, 'REGISTERED', ticketToken, 'PENDING']
        );
        await db.execute('UPDATE events SET registeredCount = registeredCount + 1 WHERE id = ?', [eventId]);

        // Real-time seat update
        try { getIO().emit('EVENT_UPDATED', { id: eventId, type: 'REGISTRATION' }); } catch (e) {}

        res.status(201).json({ success: true, message: 'Successfully registered' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const cancelRegistration = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        const [regRows] = await db.execute('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        if (regRows.length === 0) {
            return res.status(404).json({ message: 'No registration found to cancel' });
        }

        await db.execute('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        await db.execute('UPDATE events SET registeredCount = GREATEST(0, registeredCount - 1) WHERE id = ?', [eventId]);

        // Real-time seat update
        try { getIO().emit('EVENT_UPDATED', { id: eventId, type: 'CANCELLATION' }); } catch (e) {}

        res.status(200).json({ success: true, message: 'Registration cancelled' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get current student's registrations
const getMyRegistrations = async (req, res) => {
    const userId = req.user.id;
    try {
        const [rows] = await db.execute(`
            SELECT r.*, e.title as eventTitle, e.date, e.time, e.venue, e.category, c.name as club_name
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN clubs c ON e.club_id = c.id
            WHERE r.user_id = ?
            ORDER BY r.registered_at DESC
        `, [userId]);
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Check registration status
const checkRegistration = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;
    try {
        const [rows] = await db.execute('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [userId, eventId]);
        res.status(200).json({ registered: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get stats for current student
const getMyStats = async (req, res) => {
    const userId = req.user.id;
    try {
        const [[{ registered }]] = await db.execute('SELECT COUNT(*) as registered FROM registrations WHERE user_id = ?', [userId]);
        const [[{ completed }]] = await db.execute('SELECT COUNT(*) as completed FROM registrations WHERE user_id = ? AND status = ?', [userId, 'COMPLETED']);

        const [[{ upcoming }]] = await db.execute(`
            SELECT COUNT(*) as upcoming 
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE r.user_id = ? AND e.date >= CURDATE()
        `, [userId]);

        res.status(200).json({ registered, upcoming, completed });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get registrations for events managed by current admin
const getAdminRegistrations = async (req, res) => {
    const adminId = req.user.id;
    try {
        const [events] = await db.execute('SELECT id, title, category as tag, date, organizer FROM events WHERE admin_id = ?', [adminId]);
        const eventRegistrations = await Promise.all(events.map(async (event) => {
            const [participants] = await db.execute(`
                SELECT r.id, u.name, u.roll_no as jntuNumber, u.department as branch
                FROM registrations r
                JOIN users u ON r.user_id = u.id
                WHERE r.event_id = ?
            `, [event.id]);
            return {
                ...event,
                registeredCount: participants.length,
                participants: participants
            };
        }));
        res.status(200).json(eventRegistrations);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Get ticket details for a specific registration
const getTicket = async (req, res) => {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
        const [rows] = await db.execute(`
            SELECT r.ticket_token, r.attendance_status, e.title, e.date, e.time, e.venue, u.name as studentName
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id = ? AND r.event_id = ?
        `, [userId, eventId]);

        if (rows.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        res.status(200).json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Validate/Check-in via ticket token (Admin/SuperAdmin)
const validateTicket = async (req, res) => {
    const { token } = req.body;

    try {
        const [rows] = await db.execute(`
            SELECT r.*, e.title, u.name as studentName
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            JOIN users u ON r.user_id = u.id
            WHERE r.ticket_token = ?
        `, [token]);

        if (rows.length === 0) return res.status(404).json({ message: 'Invalid ticket token' });
        
        const registration = rows[0];

        if (registration.attendance_status === 'CHECKED_IN') {
            return res.status(400).json({ 
                message: 'Ticket already used', 
                studentName: registration.studentName,
                checkedInAt: registration.checked_in_at 
            });
        }

        await db.execute(
            'UPDATE registrations SET attendance_status = "CHECKED_IN", checked_in_at = NOW() WHERE id = ?',
            [registration.id]
        );

        res.status(200).json({ 
            success: true, 
            message: 'Check-in successful',
            event: registration.title,
            studentName: registration.studentName
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { 
    registerForEvent, 
    cancelRegistration, 
    getMyRegistrations, 
    checkRegistration, 
    getMyStats, 
    getAdminRegistrations,
    getTicket,
    validateTicket 
};
