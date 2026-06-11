const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

async function runImport() {
    try {
        console.log("Connecting to Aiven database...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log("✅ Connected successfully!");

        console.log("Reading dump.sql...");
        const sqlScript = fs.readFileSync(path.join(__dirname, 'dump.sql'), 'utf-8');

        console.log("Executing SQL script... This might take a few seconds.");
        await connection.query(sqlScript);

        console.log("✅ Tables created and super admin inserted successfully!");
        
        await connection.end();
        console.log("Done! You can now log in on your website.");
        
    } catch (error) {
        console.error("❌ Error importing database:", error.message);
    }
}

runImport();
