const db = require('./config/db');

async function cleanDB() {
    try {
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        const tables = ['users', 'clubs', 'events', 'registrations', 'notifications'];
        for (const table of tables) {
            await db.query(`TRUNCATE TABLE \`${table}\``);
            console.log(`Truncated \${table} and reset auto_increment.`);
        }
        await db.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Finished cleaning tables.');
    } catch (e) {
        console.error('Error cleaning tables:', e);
    } finally {
        process.exit(0);
    }
}

cleanDB();
