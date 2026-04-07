const db = require('./config/db');

async function checkDB() {
    try {
        const [rows] = await db.query('SHOW TABLES');
        rows.forEach(r => console.log(Object.values(r)[0]));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDB();
