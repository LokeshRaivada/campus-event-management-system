const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password, role: providedRole } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        let user = null;

        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = rows[0];
        const detectedRole = user.role === 'superadmin' ? 'super_admin' : user.role;

        // Validating password
        // If password is plain text in DB (for migration) or bcrypt
        if (!user.password) {
            return res.status(401).json({ message: 'User has no password set' });
        }

        const isMatch = (password === user.password) || await bcrypt.compare(password, user.password).catch(() => false);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id || user.student_id, email: user.email, role: detectedRole },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // If the user is an admin, fetch their associated club info
        let clubInfo = null;
        if (detectedRole === 'admin') {
            // Try clubs table first, fallback to club_name in users if missing
            try {
                const [clubRows] = await db.execute('SELECT id, name FROM clubs WHERE admin_id = ?', [user.id]);
                if (clubRows.length > 0) {
                    clubInfo = { id: clubRows[0].id, name: clubRows[0].name };
                }
            } catch (err) {
                if (user.club_name) clubInfo = { id: 0, name: user.club_name };
            }
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id || user.student_id,
                username: user.username || user.name || user.full_name,
                email: user.email,
                role: detectedRole,
                designation: user.designation || 'Club Admin',
                department: user.department,
                club: clubInfo
            }
        });

    } catch (err) {
        console.error('[Auth Error]', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { login };
