const db = require('./config/db');

async function checkUsers() {
    try {
        console.log('--- Admins ---');
        const [admins] = await db.execute('SELECT email, username, role FROM admins');
        console.table(admins);

        console.log('--- Super Admins ---');
        const [superAdmins] = await db.execute('SELECT email, username, role FROM super_admin');
        console.table(superAdmins);

        console.log('--- Students ---');
        const [students] = await db.execute('SELECT email, name, role FROM students');
        console.table(students);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUsers();
