const db = require('./config/db');

async function migrate() {
    try {
        console.log('🚀 Starting Migration (Safe Mode)...');

        // --- 1. NOTIFICATIONS TABLE ---
        const [notifCols] = await db.execute('SHOW COLUMNS FROM notifications');
        const notifColNames = notifCols.map(c => c.Field);

        if (!notifColNames.includes('title')) {
            await db.execute('ALTER TABLE notifications ADD COLUMN title VARCHAR(255) AFTER type');
        }
        if (!notifColNames.includes('message')) {
            await db.execute('ALTER TABLE notifications ADD COLUMN message TEXT AFTER title');
        }
        
        // Ensure status column data is normalized before changing type
        await db.execute("ALTER TABLE notifications MODIFY COLUMN status VARCHAR(255)");
        await db.execute("UPDATE notifications SET status = 'READ' WHERE status = 'read'");
        await db.execute("UPDATE notifications SET status = 'DONE' WHERE status = 'done'");
        await db.execute("UPDATE notifications SET status = 'PENDING' WHERE status NOT IN ('READ', 'DONE')");

        // Now set as ENUM
        await db.execute("ALTER TABLE notifications MODIFY COLUMN status ENUM('PENDING', 'READ', 'DONE') DEFAULT 'PENDING'");

        // --- 2. EVENTS TABLE ---
        const [eventCols] = await db.execute('SHOW COLUMNS FROM events');
        const eventColNames = eventCols.map(c => c.Field);

        if (eventColNames.includes('registration_limit') && !eventColNames.includes('maxSeats')) {
            await db.execute('ALTER TABLE events CHANGE COLUMN registration_limit maxSeats INT DEFAULT 0');
        } else if (!eventColNames.includes('maxSeats')) {
            await db.execute('ALTER TABLE events ADD COLUMN maxSeats INT DEFAULT 0');
        }

        if (eventColNames.includes('registered_count') && !eventColNames.includes('registeredCount')) {
            await db.execute('ALTER TABLE events CHANGE COLUMN registered_count registeredCount INT DEFAULT 0');
        } else if (!eventColNames.includes('registeredCount')) {
            await db.execute('ALTER TABLE events ADD COLUMN registeredCount INT DEFAULT 0');
        }

        if (eventColNames.includes('event_date') && !eventColNames.includes('date')) {
            await db.execute('ALTER TABLE events CHANGE COLUMN event_date date DATE');
        } else if (!eventColNames.includes('date')) {
             await db.execute('ALTER TABLE events ADD COLUMN date DATE');
        }

        if (eventColNames.includes('event_time') && !eventColNames.includes('time')) {
            await db.execute('ALTER TABLE events CHANGE COLUMN event_time time TIME');
        } else if (!eventColNames.includes('time')) {
             await db.execute('ALTER TABLE events ADD COLUMN time TIME');
        }

        // Add index on user_role if it doesn't exist
        // (Just for performance)

        // Fix status case and ensure uppercase ENUM
        await db.execute("ALTER TABLE events MODIFY COLUMN status VARCHAR(20)"); // Intermediate step to avoid enum mismatch
        await db.execute("UPDATE events SET status = UPPER(status)");
        await db.execute("ALTER TABLE events MODIFY COLUMN status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING'");

        // --- 3. REGISTRATIONS TABLE ---
        const [regCols] = await db.execute('SHOW COLUMNS FROM registrations');
        const regColNames = regCols.map(c => c.Field);

        if (!regColNames.includes('ticket_token')) {
            await db.execute('ALTER TABLE registrations ADD COLUMN ticket_token VARCHAR(255) UNIQUE AFTER status');
        }
        if (!regColNames.includes('attendance_status')) {
            await db.execute("ALTER TABLE registrations ADD COLUMN attendance_status ENUM('PENDING', 'CHECKED_IN') DEFAULT 'PENDING' AFTER ticket_token");
        }
        if (!regColNames.includes('checked_in_at')) {
            await db.execute('ALTER TABLE registrations ADD COLUMN checked_in_at DATETIME NULL AFTER attendance_status');
        }

        console.log('✅ Migration successfully completed!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err);
        process.exit(1);
    }
}

migrate();
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
