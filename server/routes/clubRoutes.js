const express = require('express');
const router = express.Router();
const { getAllClubs, createClub, updateClub, deleteClub } = require('../controllers/clubController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

// Get all clubs (Publically accessible for home page)
router.get('/', getAllClubs);

// Super Admin only routes
router.post('/create', verifyToken, authorizeRoles('super_admin'), createClub);
router.put('/:id', verifyToken, authorizeRoles('super_admin'), updateClub);
router.delete('/:id', verifyToken, authorizeRoles('super_admin'), deleteClub);

module.exports = router;
