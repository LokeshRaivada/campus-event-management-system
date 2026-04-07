const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
    try {
        const password = 'admin123';
        const hashed = await bcrypt.hash(password, 10);

        // Reset Super Admin
        await db.execute('UPDATE super_admin SET password = ? WHERE email = ?', [hashed, 'superadmin@gmail.com']);
        console.log('Super Admin password reset to: admin123');

        // Reset Admin
        await db.execute('UPDATE admins SET password = ? WHERE email = ?', [hashed, 'admin@gmail.com']);
        console.log('Admin@gmail.com password reset to: admin123');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetPasswords();
