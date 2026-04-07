const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            'UPDATE super_admin SET password = ? WHERE email = ?',
            [hashedPassword, 'superadmin@gmail.com']
        );

        console.log('✅ Password for superadmin@gmail.com has been reset to "admin123"');
        console.log('Using Hash:', hashedPassword);
    } catch (err) {
        console.error('❌ Error updating password:', err.message);
    } finally {
        await pool.end();
    }
}

resetPassword();
