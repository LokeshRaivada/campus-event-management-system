const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    try {
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Let's first check if users table has 'name' or 'username' by trying to insert and let mysql tell us if column doesn't exist.
        // Or wait, let's just insert 'name', 'username' into a dynamically guessed schema.
        // Actually I can just write an insert statement and if it fails, try the next one.
        let success = false;

        const queries = [
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)'
        ];

        for (let q of queries) {
            try {
                await db.execute(q, ['Super Admin', 'superadmin@gmail.com', hashedPassword, 'super_admin']);
                console.log('Successfully inserted Super Admin via:', q);
                success = true;
                break;
            } catch (e) {
                // Ignore, try next
            }
        }

        if (!success) {
            // Try superadmin as role
            for (let q of queries) {
                try {
                    await db.execute(q, ['Super Admin', 'superadmin@gmail.com', hashedPassword, 'superadmin']);
                    console.log('Successfully inserted Super Admin (role: superadmin) via:', q);
                    success = true;
                    break;
                } catch (e) {

                }
            }
        }

        if (!success) {
            // Let's get the exact columns
            const [rows] = await db.query('DESCRIBE users');
            console.log('Failed dynamic insert. Schema columns are: ', rows.map(r => r.Field).join(', '));
        }

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

createSuperAdmin();
