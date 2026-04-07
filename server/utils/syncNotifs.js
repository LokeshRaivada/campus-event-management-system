const db = require('./config/db');

async function syncNotificationsTable() {
    console.log('Syncing notifications table...');

    // Drop the table and recreate it with the correct schema for this project
    // This is the cleanest way since we are in development and need it to match exactly.
    try {
        await db.execute('DROP TABLE IF EXISTS notifications');
        console.log('🗑️ Dropped old notifications table');

        await db.execute(`
            CREATE TABLE notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                user_role VARCHAR(50),
                eventId INT,
                eventTitle VARCHAR(255),
                organizer VARCHAR(255),
                category VARCHAR(100),
                date VARCHAR(100),
                venue VARCHAR(255),
                type VARCHAR(50),
                status VARCHAR(20) DEFAULT 'unread',
                actionTaken VARCHAR(20),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Created new notifications table with correct schema');
    } catch (err) {
        console.error('❌ Error syncing notifications:', err.message);
    }

    process.exit(0);
}

syncNotificationsTable();
