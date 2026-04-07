const db = require('./config/db');
const fs = require('fs');

async function dump() {
    const [superAdmins] = await db.execute('SELECT * FROM super_admin');
    const [admins] = await db.execute('SELECT * FROM admins');
    const [students] = await db.execute('SELECT * FROM students');

    fs.writeFileSync('db_dump.json', JSON.stringify({ superAdmins, admins, students }, null, 2));
    process.exit(0);
}

dump();
