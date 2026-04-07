const pool = require('./config/db');
const fs = require('fs');

async function test() {
    try {
        const [rows] = await pool.execute('DESCRIBE users');
        fs.writeFileSync('schema.json', JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
test();
