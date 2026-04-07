const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Create a new Admin (Super Admin only)
const createAdmin = async (req, res) => {
    const { username, email, password, role, department, clubName } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role, designation, department, club_name, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [username, email, hashedPassword, 'admin', role || null, department || null, clubName || null, 'active']
        );

        if (clubName) {
            await db.execute('UPDATE clubs SET admin_id = ? WHERE name = ?', [result.insertId, clubName]);
        }

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            adminId: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 2. Create a new Club (Super Admin only)
const createClub = async (req, res) => {
    const { name, description, admin_id } = req.body;

    if (!name || !admin_id) {
        return res.status(400).json({ message: 'Club name and Admin ID are required' });
    }

    try {
        const [result] = await db.execute(
            'INSERT INTO clubs (name, description, admin_id) VALUES (?, ?, ?)',
            [name, description, admin_id]
        );

        res.status(201).json({
            success: true,
            message: 'Club created and assigned to Admin successfully',
            clubId: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Club name already exists or Admin already has a club' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 3. Get all Admins
const getAllAdmins = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name as username, email, COALESCE(designation, \'Admin\') as role, department, club_name as clubName, status, created_at FROM users WHERE role = "admin"');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// 4. Create a Student (Admin or Super Admin only)
const createStudent = async (req, res) => {
    const { name, email, roll_no, password, department, year, club_id } = req.body;

    if (!name || !email || !roll_no || !password) {
        return res.status(400).json({ message: 'Missing required fields (name, email, roll_no, password)' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (name, email, roll_no, password, department, year, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, roll_no, hashedPassword, department || null, year || null, 'student']
        );

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            studentId: result.insertId
        });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or Roll Number already exists' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, name, email, roll_no, department, year, status, created_at FROM users WHERE role = "student"');
        res.status(200).json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ? AND role = "admin"', [id]);
        res.status(200).json({ success: true, message: 'Admin deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM users WHERE id = ? AND role = "student"', [id]);
        res.status(200).json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, department, clubName } = req.body; 

    try {
        await db.execute(
            'UPDATE users SET name = ?, email = ?, designation = ?, department = ?, club_name = ? WHERE id = ? AND role = "admin"',
            [name, email, role || null, department || null, clubName || null, id]
        );

        if (clubName) {
            await db.execute('UPDATE clubs SET admin_id = NULL WHERE admin_id = ?', [id]);
            await db.execute('UPDATE clubs SET admin_id = ? WHERE name = ?', [id, clubName]);
        } else {
            await db.execute('UPDATE clubs SET admin_id = NULL WHERE admin_id = ?', [id]);
        }

        res.status(200).json({ success: true, message: 'Admin updated successfully' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or Username already exists' });
        }
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const toggleAdminStatus = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT status FROM users WHERE id = ? AND role = "admin"', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });

        const newStatus = rows[0].status === 'active' ? 'suspended' : 'active';
        await db.execute('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

        res.status(200).json({ success: true, status: newStatus });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getAnalytics = async (req, res) => {
    try {
        const [[{ totalAdmins }]] = await db.execute('SELECT COUNT(*) as totalAdmins FROM users WHERE role = "admin"');
        const [[{ activeAdmins }]] = await db.execute('SELECT COUNT(*) as activeAdmins FROM users WHERE role = "admin" AND status = "active"');
        const [[{ totalStudents }]] = await db.execute('SELECT COUNT(*) as totalStudents FROM users WHERE role = "student"');
        const [[{ activeStudents }]] = await db.execute('SELECT COUNT(*) as activeStudents FROM users WHERE role = "student" AND status = "active"');
        const [[{ suspendedStudents }]] = await db.execute('SELECT COUNT(*) as suspendedStudents FROM users WHERE role = "student" AND status = "suspended"');
        const [[{ totalSuperAdmins }]] = await db.execute('SELECT COUNT(*) as totalSuperAdmins FROM users WHERE role = "super_admin"');

        // Stats from events table
        const [[{ totalEvents }]] = await db.execute('SELECT COUNT(*) as totalEvents FROM events');
        const [[{ approvedEvents }]] = await db.execute('SELECT COUNT(*) as approvedEvents FROM events WHERE status = "APPROVED"');
        const [[{ pendingEvents }]] = await db.execute('SELECT COUNT(*) as pendingEvents FROM events WHERE status = "PENDING"');
        const [[{ rejectedEvents }]] = await db.execute('SELECT COUNT(*) as rejectedEvents FROM events WHERE status = "REJECTED"');

        // Clubs count
        const [[{ totalClubs }]] = await db.execute('SELECT COUNT(*) as totalClubs FROM clubs');

        // Total registrations
        const [[{ totalRegistrations }]] = await db.execute('SELECT COUNT(*) as totalRegistrations FROM registrations');

        res.status(200).json({
            totalUsers: totalStudents + totalAdmins + totalSuperAdmins,
            totalAdmins,
            activeAdmins,
            totalStudents,
            activeStudents,
            suspendedStudents,
            totalEvents,
            approvedEvents,
            pendingEvents,
            rejectedEvents,
            totalClubs,
            totalRegistrations,
            studentRegistrations: totalRegistrations,
            totalSuperAdmins
        });
    } catch (err) {
        console.error('[Analytics Error]', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const getMonthlyData = async (req, res) => {
    try {
        // This is a simple mock of monthly aggregation since we'd need more data
        // For now returning the user's expected structure but could be aggregated from events table
        const data = [
            { month: "Jan", events: 4, registrations: 120 },
            { month: "Feb", events: 6, registrations: 210 },
            { month: "Mar", events: 8, registrations: 340 },
            { month: "Apr", events: 3, registrations: 150 },
            { month: "May", events: 5, registrations: 280 },
            { month: "Jun", events: 7, registrations: 390 },
        ];
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    createAdmin,
    createClub,
    getAllAdmins,
    createStudent,
    getAllStudents,
    deleteAdmin,
    deleteStudent,
    updateAdmin,
    toggleAdminStatus,
    getAnalytics,
    getMonthlyData
};
