const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, markAsDone, createNotificationHandler } = require('../controllers/notificationController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getNotifications);
router.post('/create', verifyToken, createNotificationHandler);
router.patch('/mark-all-read', verifyToken, markAllAsRead);
router.patch('/:id/read', verifyToken, markAsRead);
router.patch('/:id/done', verifyToken, markAsDone);

module.exports = router;
