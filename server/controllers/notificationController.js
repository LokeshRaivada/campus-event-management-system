const db = require('../config/db');
const { getIO } = require('../config/socket');

/**
 * Standard Notification Types:
 * - EVENT_CREATED:  Notify Super Admin
 * - EVENT_APPROVED: Notify Admin (creator) and optionally students
 * - EVENT_REJECTED: Notify Admin (creator)
 */

// Get notifications for current user/role
const getNotifications = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role; // student | admin | super_admin

    try {
        // Fetch notifications for specific user OR for their role (role-wide broadcast)
        // Only return PENDING or READ notifications (DONE are archived/hidden)
        const [rows] = await db.execute(
            `SELECT * FROM notifications 
             WHERE (user_id = ? OR (user_role = ? AND user_id IS NULL)) 
             AND status != 'DONE'
             ORDER BY created_at DESC`,
            [userId, userRole]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error('[Error] getNotifications failed:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Internal utility to create notifications
const createNotification = async ({ userId, userRole, type, title, message, eventId }) => {
    try {
        const [result] = await db.execute(
            `INSERT INTO notifications (user_id, user_role, type, title, message, status, event_id) 
             VALUES (?, ?, ?, ?, ?, 'PENDING', ?)`,
            [userId || null, userRole || null, type, title, message, eventId || null]
        );
        const notificationId = result.insertId;

        // Emit via Socket.IO
        try {
            const io = getIO();
            const notificationData = { id: notificationId, userId, userRole, type, title, message, eventId, status: 'PENDING', created_at: new Date() };
            if (userId) io.to(`user_${userId}`).emit('NOTIFICATION_CREATED', notificationData);
            if (userRole) io.to(`role_${userRole}`).emit('NOTIFICATION_CREATED', notificationData);
        } catch (socketErr) {
            console.warn('[Socket Emit Warning] Failed to emit notification:', socketErr.message);
        }

        return { success: true, id: notificationId };
    } catch (err) {
        console.error('[Notification Store Error]', err);
        return { success: false, error: err.message };
    }
};

// API Endpoint version of the above
const createNotificationHandler = async (req, res) => {
    const { userId, userRole, type, title, message, eventId } = req.body;
    const result = await createNotification({ userId, userRole, type, title, message, eventId });
    if (result.success) {
        res.status(201).json(result);
    } else {
        res.status(500).json({ message: 'Server error', error: result.error });
    }
};

const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('UPDATE notifications SET status = "READ" WHERE id = ?', [id]);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const markAsDone = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('UPDATE notifications SET status = "DONE" WHERE id = ?', [id]);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        await db.execute(
            'UPDATE notifications SET status = "READ" WHERE (user_id = ? OR (user_role = ? AND user_id IS NULL)) AND status = "PENDING"',
            [userId, userRole]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    getNotifications,
    createNotification, // exported for internal use by eventController
    createNotificationHandler,
    markAsRead,
    markAsDone,
    markAllAsRead
};
