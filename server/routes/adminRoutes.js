const express = require('express');
const router = express.Router();
const { createAdmin, createClub, getAllAdmins, createStudent, getAllStudents, deleteAdmin, deleteStudent, updateAdmin, toggleAdminStatus, getAnalytics, getMonthlyData } = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Only Super Admin can access these routes
router.post('/create-admin', verifyToken, authorizeRoles('super_admin'), createAdmin);
router.delete('/admins/:id', verifyToken, authorizeRoles('super_admin'), deleteAdmin);
router.put('/admins/:id', verifyToken, authorizeRoles('super_admin'), updateAdmin);
router.patch('/admins/:id/toggle', verifyToken, authorizeRoles('super_admin'), toggleAdminStatus);
router.post('/create-club', verifyToken, authorizeRoles('super_admin'), createClub);
router.get('/admins', verifyToken, authorizeRoles('super_admin'), getAllAdmins);
router.get('/analytics', verifyToken, authorizeRoles('super_admin'), getAnalytics);
router.get('/monthly-data', verifyToken, authorizeRoles('super_admin'), getMonthlyData);

// Both Admin and Super Admin can create and view students
router.post('/create-student', verifyToken, authorizeRoles('super_admin', 'admin'), createStudent);
router.get('/students', verifyToken, authorizeRoles('super_admin', 'admin'), getAllStudents);
router.delete('/students/:id', verifyToken, authorizeRoles('super_admin', 'admin'), deleteStudent);

module.exports = router;
