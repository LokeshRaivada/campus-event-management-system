const db = require('../config/db');

// Get all clubs with their associated admin username
const getAllClubs = async (req, res) => {
    try {
        // Updated to use users table instead of missing admins table
        const [rows] = await db.execute(`
            SELECT c.*, u.name as admin_name 
            FROM clubs c 
            LEFT JOIN users u ON c.admin_id = u.id
        `);
        res.status(200).json(rows);
    } catch (err) {
        console.error('[Error] Fetch clubs failed:', err.message);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Create a new club (Super Admin only)
const createClub = async (req, res) => {
    const { name, description, admin_id, category } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO clubs (name, description, admin_id, category) VALUES (?, ?, ?, ?)',
            [name, description, admin_id || null, category || 'Club']
        );
        if (admin_id) {
            await db.execute('UPDATE users SET club_name = ? WHERE id = ? AND role = "admin"', [name, admin_id]);
        }
        res.status(201).json({ success: true, message: 'Club created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Update club
const updateClub = async (req, res) => {
    const { id } = req.params;
    const { name, description, admin_id, category } = req.body;
    try {
        const [oldClubs] = await db.execute('SELECT name FROM clubs WHERE id = ?', [id]);
        
        await db.execute(
            'UPDATE clubs SET name = ?, description = ?, admin_id = ?, category = ? WHERE id = ?',
            [name, description, admin_id || null, category || 'Club', id]
        );
        
        if (oldClubs.length > 0) {
            await db.execute('UPDATE users SET club_name = NULL WHERE club_name = ?', [oldClubs[0].name]);
        }
        
        if (admin_id) {
            await db.execute('UPDATE users SET club_name = ? WHERE id = ? AND role = "admin"', [name, admin_id]);
        }
        
        res.status(200).json({ success: true, message: 'Club updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete club
const deleteClub = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM clubs WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Club deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { getAllClubs, createClub, updateClub, deleteClub };
