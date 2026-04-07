const pool = require('./config/db');

async function alterTable() {
    try {
        await pool.execute('ALTER TABLE users ADD COLUMN designation VARCHAR(100) DEFAULT NULL');
        console.log('Added designation column');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error(e);
        }
    } finally {
        pool.end();
    }
}
alterTable();
