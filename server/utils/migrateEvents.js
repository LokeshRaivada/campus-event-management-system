const db = require('./config/db');

async function migrateEvents() {
    console.log('Migrating events table...');
    const columns = [
        { name: 'status', type: "VARCHAR(20) DEFAULT 'Pending'" },
        { name: 'category', type: 'VARCHAR(100)' },
        { name: 'organizer', type: 'VARCHAR(255)' },
        { name: 'registration_limit', type: 'INT DEFAULT 0' }
    ];

    for (const col of columns) {
        try {
            await db.execute(`ALTER TABLE events ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added ${col.name} column`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log(`ℹ️ ${col.name} column already exists`);
            } else {
                console.error(`❌ Error adding ${col.name}:`, err.message);
            }
        }
    }

    // Also check notifications table
    console.log('\nChecking notifications table...');
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                eventId INT,
                eventTitle VARCHAR(255),
                organizer VARCHAR(255),
                category VARCHAR(100),
                eventDate DATE,
                venue VARCHAR(255),
                type VARCHAR(50),
                status VARCHAR(20) DEFAULT 'unread',
                actionTaken VARCHAR(20),
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Notifications table ready');
    } catch (err) {
        console.error('❌ Error creating notifications table:', err.message);
    }

    process.exit(0);
}

migrateEvents();
