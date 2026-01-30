const { Client } = require('pg');
require('dotenv').config();

// Manual parsing to handle special characters in password
const connectionString = process.env.DATABASE_URL;
// postgresql://postgres:Vishwesh@26@db.pazdautizflpnwgcmrty.supabase.co:5432/postgres

const client = new Client({
    user: 'postgres',
    host: 'db.pazdautizflpnwgcmrty.supabase.co',
    database: 'postgres',
    password: 'Vishwesh@26',
    port: 5432,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function dropConstraint() {
    try {
        await client.connect();
        console.log('Connected to database (manual config)');

        console.log('Dropping unique constraint "Student_rollNumber_key"...');
        await client.query('ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_rollNumber_key"');
        console.log('Successfully dropped the unique constraint.');

    } catch (err) {
        console.error('Operation failed:', err);
    } finally {
        await client.end();
    }
}

dropConstraint();
