const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL is not defined in .env");
    process.exit(1);
}

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

const migrationPath = path.join(__dirname, 'migration_promotion_system.sql');
const sql = fs.readFileSync(migrationPath, 'utf8');

async function migrate() {
    try {
        await client.connect();
        console.log("Connected to database...");

        await client.query(sql);
        console.log("Promotion System Migration executed successfully.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await client.end();
    }
}

migrate();
