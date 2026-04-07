const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const email = 'admin@gmail.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const [rows] = await db.execute('SELECT * FROM admins WHERE email = ?', [email]);
        if (rows.length > 0) {
            console.log('Admin already exists');
        } else {
            await db.execute(
                'INSERT INTO admins (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
                ['Default Admin', email, hashedPassword, 'admin', 'active']
            );
            console.log('Admin created: admin@gmail.com / admin123');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();
