const { Client } = require('pg');
require('dotenv').config();

// The password is "Vishwesh@26". The "@" must be encoded as "%40"
const encodedDbUrl = "postgresql://postgres:Vishwesh%4026@db.pazdautizflpnwgcmrty.supabase.co:5432/postgres";

const client = new Client({
    connectionString: encodedDbUrl,
    ssl: {
        rejectUnauthorized: false,
    },
});

async function dropConstraint() {
    try {
        await client.connect();
        console.log('Connected to database (encoded URI)');

        console.log('Dropping unique constraint "Student_rollNumber_key"...');
        await client.query('ALTER TABLE "Student" DROP CONSTRAINT IF EXISTS "Student_rollNumber_key"');
        console.log('Successfully dropped the unique constraint.');

    } catch (err) {
        console.error('Operation failed:', err);
        console.error('Error Code:', err.code);
        console.error('Error Message:', err.message);
    } finally {
        await client.end();
    }
}

dropConstraint();
