const db = require('./config/db');
const fs = require('fs');

async function test() {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        fs.writeFileSync('output.txt', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        fs.writeFileSync('output.txt', e.message);
        process.exit(1);
    }
}
test();
