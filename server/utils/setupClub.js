const db = require('./config/db');

async function setupClub() {
    try {
        // 1. Get the admin id
        const [admins] = await db.execute('SELECT id FROM admins WHERE email = ?', ['admin@gmail.com']);
        if (admins.length === 0) {
            console.log('Admin not found. Run seedAdmin.js first.');
            process.exit(1);
        }
        const adminId = admins[0].id;

        // 2. Check if a club already exists for this admin
        const [clubs] = await db.execute('SELECT * FROM clubs WHERE admin_id = ?', [adminId]);
        if (clubs.length > 0) {
            console.log('Club already exists for this admin');
        } else {
            // 3. Create a club
            await db.execute(
                'INSERT INTO clubs (name, description, admin_id) VALUES (?, ?, ?)',
                ['CSI Club', 'Computer Society of India student branch', adminId]
            );
            console.log('✅ Created CSI Club and assigned to admin@gmail.com');
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setupClub();
