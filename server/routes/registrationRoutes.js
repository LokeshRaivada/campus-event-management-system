const express = require('express');
const router = express.Router();
const { 
    registerForEvent, 
    cancelRegistration, 
    getMyRegistrations, 
    checkRegistration, 
    getMyStats, 
    getAdminRegistrations,
    getTicket,
    validateTicket
} = require('../controllers/registrationController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/register', verifyToken, registerForEvent);
router.delete('/:eventId/cancel', verifyToken, cancelRegistration);
router.get('/my-registrations', verifyToken, getMyRegistrations);
router.get('/my-stats', verifyToken, getMyStats);
router.get('/admin-registrations', verifyToken, getAdminRegistrations);
router.get('/check/:eventId', verifyToken, checkRegistration);

// QR Pass Routes
router.get('/ticket/:eventId', verifyToken, getTicket);
router.post('/validate', verifyToken, authorizeRoles('admin', 'super_admin'), validateTicket);

module.exports = router;
