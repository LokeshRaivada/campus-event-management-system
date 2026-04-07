const db = require('./config/db');

async function checkEventsTable() {
    try {
        const [rows] = await db.execute('DESCRIBE events');
        console.table(rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkEventsTable();
