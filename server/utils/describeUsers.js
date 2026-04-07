const db = require('./config/db');

async function describeTable() {
    try {
        const [rows] = await db.query('DESCRIBE users');
        rows.forEach(r => console.log(`${r.Field} - ${r.Type} - NULL: ${r.Null} - KEY: ${r.Key} - DEFAULT: ${r.Default} - EXTRA: ${r.Extra}`));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
describeTable();
