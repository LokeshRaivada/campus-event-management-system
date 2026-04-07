const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createEvent, getPendingEvents, getAllEvents, getSystemEvents, getEventById, getMyEvents, getEventStats, getRecentEvents, updateEventStatus, updateEvent, deleteEvent } = require('../controllers/eventController');
const { registerForEvent } = require('../controllers/registrationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Public route: Anyone can view approved events
router.get('/all', getAllEvents);
router.get('/pending', verifyToken, getPendingEvents);
router.get('/system', verifyToken, authorizeRoles('super_admin', 'superadmin', 'admin'), getSystemEvents);
router.get('/my', verifyToken, authorizeRoles('admin'), getMyEvents);
router.post('/register', verifyToken, registerForEvent);
router.get('/stats', verifyToken, getEventStats);
router.get('/recent', verifyToken, getRecentEvents);
router.get('/:id', verifyToken, getEventById);

// Protected routes
router.post('/create', verifyToken, authorizeRoles('admin'), upload.single('poster'), createEvent);
router.put('/:id', verifyToken, authorizeRoles('admin', 'super_admin'), upload.single('poster'), updateEvent);
router.patch('/:id/status', verifyToken, authorizeRoles('admin', 'super_admin'), updateEventStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'super_admin'), deleteEvent);

module.exports = router;
